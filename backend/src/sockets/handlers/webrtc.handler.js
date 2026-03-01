// NOTE: These Maps are in-process only.
// In a multi-process deployment (PM2 cluster, multiple dynos, etc.) each
// worker has its own copy of these Maps, so cross-process signaling will break.
// To scale horizontally, replace with a Redis-backed store and use the
// Socket.IO Redis adapter (socket.io-redis / @socket.io/redis-adapter).
const onlineUsers = new Map(); // userId (string) → socket.id
const activeCalls = new Map(); // userId (string) → peerId (string)

const getSocketId = (userId) => onlineUsers.get(userId?.toString());

module.exports = (io, socket) => {
  const userId = socket.user?.id?.toString();

  if (userId) {
    onlineUsers.set(userId, socket.id);
    console.log(`[WebRTC] User online: ${userId} → socket ${socket.id}`);
  }
  // Caller sends SDP offer. We check if target is online/busy, then forward.
  socket.on("call:offer", ({ targetUserId, offer, groupId }) => {
    if (!targetUserId || !offer) {
      return socket.emit("call:error", {
        message: "targetUserId and offer are required",
      });
    }

    const targetSocketId = getSocketId(targetUserId);

    // Target is offline
    if (!targetSocketId) {
      return socket.emit("call:error", { message: "User is not online" });
    }

    // Target is already in a call
    if (activeCalls.has(targetUserId)) {
      return socket.emit("call:busy", { targetUserId });
    }

    // Caller is already in a call
    if (activeCalls.has(userId)) {
      return socket.emit("call:error", {
        message: "You are already in a call",
      });
    }

    // Mark both as in-call
    activeCalls.set(userId, targetUserId);
    activeCalls.set(targetUserId, userId);

    // Forward offer to target
    io.to(targetSocketId).emit("call:offer", {
      from: userId,
      offer, // SDP offer — browser-generated, just forwarded
      groupId, // optional: which study group this call belongs to
    });

    console.log(`[WebRTC] call:offer  ${userId} → ${targetUserId}`);
  });

  // ─── 2. CALL:ANSWER ───────────────────────────────────────────────────────
  // Receiver accepts and sends back SDP answer to the caller.
  socket.on("call:answer", ({ targetUserId, answer }) => {
    if (!targetUserId || !answer) {
      return socket.emit("call:error", {
        message: "targetUserId and answer are required",
      });
    }

    const targetSocketId = getSocketId(targetUserId);
    if (!targetSocketId) return;

    io.to(targetSocketId).emit("call:answer", {
      from: userId,
      answer, // SDP answer — browser-generated, just forwarded
    });

    console.log(`[WebRTC] call:answer  ${userId} → ${targetUserId}`);
  });

  // ─── 3. CALL:ICE-CANDIDATE ────────────────────────────────────────────────
  // Both sides continuously send ICE candidates (network paths).
  // We just relay — the browser picks the best one automatically.
  socket.on("call:ice-candidate", ({ targetUserId, candidate }) => {
    if (!targetUserId || !candidate) return;

    const targetSocketId = getSocketId(targetUserId);
    if (!targetSocketId) return;

    io.to(targetSocketId).emit("call:ice-candidate", {
      from: userId,
      candidate, // network info — browser-generated, just forwarded
    });
  });

  // ─── 4. CALL:REJECT ───────────────────────────────────────────────────────
  // Receiver declines the incoming call.
  socket.on("call:reject", ({ targetUserId }) => {
    if (!targetUserId) return;

    // Clean up call tracking
    activeCalls.delete(userId);
    activeCalls.delete(targetUserId);

    const targetSocketId = getSocketId(targetUserId);
    if (!targetSocketId) return;

    io.to(targetSocketId).emit("call:rejected", { from: userId });

    console.log(
      `[WebRTC] call:reject  ${userId} rejected call from ${targetUserId}`,
    );
  });

  // ─── 5. CALL:END ──────────────────────────────────────────────────────────
  // Either side hangs up. Notify the peer and clean up.
  socket.on("call:end", ({ targetUserId }) => {
    if (!targetUserId) return;

    // Clean up call tracking
    activeCalls.delete(userId);
    activeCalls.delete(targetUserId);

    const targetSocketId = getSocketId(targetUserId);
    if (!targetSocketId) return;

    io.to(targetSocketId).emit("call:end", { from: userId });

    console.log(`[WebRTC] call:end  ${userId} ended call with ${targetUserId}`);
  });

  // ─── 6. DISCONNECT ────────────────────────────────────────────────────────
  // Clean up maps when user disconnects (tab closed, network drop, etc.)
  socket.on("disconnect", () => {
    if (!userId) return;

    // If they were in a call, notify their peer
    const peerId = activeCalls.get(userId);
    if (peerId) {
      const peerSocketId = getSocketId(peerId);
      if (peerSocketId) {
        io.to(peerSocketId).emit("call:end", {
          from: userId,
          reason: "disconnected",
        });
      }
      activeCalls.delete(peerId);
    }

    activeCalls.delete(userId);
    onlineUsers.delete(userId);

    console.log(`[WebRTC] User offline: ${userId}`);
  });
};
