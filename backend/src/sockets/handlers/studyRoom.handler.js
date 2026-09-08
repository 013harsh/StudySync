const Group = require("../../model/group.model");
const sessions = new Map();

module.exports = (io, socket) => {
  const userId = socket.user?.id?.toString();

  socket.on("join-group", (groupId) => {
    const session = sessions.get(groupId);
    if (session) {
      socket.emit("room:session-started", {
        groupId,
        session,
      });
    }
  });

  socket.on("room:start-session", async ({ groupId, mode, duration }) => {
    try {
      if (!userId || !groupId) {
        return socket.emit("error", "Missing required fields");
      }

      if (!["countdown", "stopwatch"].includes(mode)) {
        return socket.emit("error", "Invalid mode");
      }

      if (mode === "countdown" && (!duration || duration <= 0)) {
        return socket.emit("error", "Duration required for countdown");
      }

      // Verify user is an admin
      const group = await Group.findOne({
        _id: groupId,
        members: {
          $elemMatch: {
            user: userId,
            role: "admin",
          },
        },
      });

      if (!group) {
        return socket.emit("error", "Only group admins can start a session");
      }

      const session = {
        hostId: userId,
        mode,
        startedAt: Date.now(),
        pausedAt: null,
        duration: mode === "countdown" ? duration : null,
        isRunning: true,
      };

      sessions.set(groupId, session);

      console.log(`⏱️ Session started in ${groupId}`);

      io.to(groupId).emit("room:session-started", {
        groupId,
        session,
      });

      if (mode === "countdown") {
        setTimeout(() => {
          const session = sessions.get(groupId);

          if (!session) return;

          session.isRunning = false;
          session.isFinished = true;
          session.pausedAt = Date.now();

          console.log(`⏰ Countdown finished in ${groupId}`);

          io.to(groupId).emit("room:timer-update", {
            groupId,
            isRunning: false,
            isFinished: true,
            pausedAt: session.pausedAt,
          });
        }, duration);
      }
    } catch (error) {
      console.error("Start Session Error:", error);
      socket.emit("error", "Failed to start session");
    }
  });

  socket.on("room:pause", ({ groupId }) => {
    try {
      if (!userId || !groupId) {
        return socket.emit("error", "Missing required fields");
      }

      const session = sessions.get(groupId);

      if (!session) {
        return socket.emit("error", "No active session");
      }

      if (session.hostId !== userId) {
        return socket.emit("error", "Only host can pause the timer");
      }

      if (!session.isRunning) {
        return socket.emit("error", "Session is not running");
      }

      session.pausedAt = Date.now();
      session.isRunning = false;

      console.log(`⏸️  Session paused in ${groupId} by ${userId}`);

      const elapsed = session.pausedAt - session.startedAt;
      io.to(groupId).emit("room:timer-update", {
        groupId,
        isRunning: false,
        pausedAt: session.pausedAt,
        elapsed,
      });
    } catch (error) {
      console.error("Pause Session Error:", error);
      socket.emit("error", "Failed to pause session");
    }
  });

  socket.on("room:resume", ({ groupId }) => {
    try {
      if (!userId || !groupId) {
        return socket.emit("error", "Missing required fields");
      }

      const session = sessions.get(groupId);

      if (!session) {
        return socket.emit("error", "No active session");
      }

      if (session.hostId !== userId) {
        return socket.emit("error", "Only host can resume the timer");
      }

      if (session.isRunning) {
        return socket.emit("error", "Session is already running");
      }

      const pauseDuration = Date.now() - session.pausedAt;
      session.startedAt += pauseDuration;
      session.pausedAt = null;
      session.isRunning = true;

      io.to(groupId).emit("room:timer-update", {
        groupId,
        isRunning: true,
        startedAt: session.startedAt,
      });
    } catch (error) {
      console.error("Resume Session Error:", error);
      socket.emit("error", "Failed to resume session");
    }
  });

  socket.on("room:end-session", ({ groupId }) => {
    try {
      if (!userId || !groupId) {
        return socket.emit("error", "Missing required fields");
      }

      const session = sessions.get(groupId);

      if (!session) {
        return socket.emit("error", "No active session");
      }

      if (session.hostId !== userId) {
        return socket.emit("error", "Only host can end the timer");
      }

      const endTime = session.pausedAt || Date.now();
      const elapsed = endTime - session.startedAt;

      console.log(`⏹️  Session ended in ${groupId} by ${userId}`);

      sessions.delete(groupId);

      io.to(groupId).emit("room:session-ended", {
        groupId,
        elapsed,
      });
    } catch (error) {
      console.error("End Session Error:", error);
      socket.emit("error", "Failed to end session");
    }
  });

  socket.on("disconnect", () => {
    if (!userId) return;

    sessions.forEach((session, groupId) => {
      if (session.hostId === userId) {
        console.log(`  Host ${userId} disconnected from ${groupId}`);

        sessions.delete(groupId);
        io.to(groupId).emit("room:session-ended", {
          groupId,
          reason: "Host disconnected",
        });
      }
    });
  });
};
