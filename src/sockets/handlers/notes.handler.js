const mongoose = require("mongoose");
const Note = require("../../model/notes.model");
const Group = require("../../model/group.model");

// ─── Helper ───────────────────────────────────────────────────────────────────
const isMember = (groupId, userId) =>
  Group.findOne({ _id: groupId, "members.user": userId });

module.exports = (io, socket) => {
  // ─── note:join ──────────────────────────────────────────────────────────────
  // Client joins the note collaboration room and receives the current content.
  // Payload: { groupId }
  socket.on("note:join", async ({ groupId } = {}) => {
    try {
      if (!socket.user) {
        return socket.emit("error", { message: "Unauthorized" });
      }
      if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
        return socket.emit("error", { message: "Invalid group ID" });
      }

      const group = await isMember(groupId, socket.user.id);
      if (!group) {
        return socket.emit("error", { message: "Not a member of this group" });
      }

      // Join a dedicated note room (separate from the chat room)
      const noteRoom = `note:${groupId}`;
      socket.join(noteRoom);

      // Upsert note so we always have a document to return
      const note = await Note.findOneAndUpdate(
        { groupId },
        { $setOnInsert: { groupId } },
        { upsert: true, new: true },
      );

      // Send current state only to the joining client
      socket.emit("note:init", {
        groupId,
        content: note.content,
        version: note.version,
      });

      console.log(`User ${socket.user.id} joined note room ${noteRoom}`);
    } catch (error) {
      console.error("note:join error:", error);
      socket.emit("error", { message: "Something went wrong" });
    }
  });

  // ─── note:update ──────────────────────────────────────────────────────────
  // Relay a Quill delta to all other editors in real-time (no DB write).
  // Payload: { groupId, delta }
  socket.on("note:update", async ({ groupId, delta } = {}) => {
    try {
      if (!socket.user) {
        return socket.emit("error", { message: "Unauthorized" });
      }
      if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
        return socket.emit("error", { message: "Invalid group ID" });
      }
      if (!delta) {
        return socket.emit("error", { message: "Delta is required" });
      }

      const group = await isMember(groupId, socket.user.id);
      if (!group) {
        return socket.emit("error", { message: "Not a member of this group" });
      }

      // Broadcast to everyone else in the note room (exclude sender)
      socket.to(`note:${groupId}`).emit("note:updated", {
        groupId,
        delta,
        sender: {
          _id: socket.user.id,
          fullName: socket.user.fullName,
        },
      });
    } catch (error) {
      console.error("note:update error:", error);
      socket.emit("error", { message: "Something went wrong" });
    }
  });

  // ─── note:save ────────────────────────────────────────────────────────────
  // Persist the current full content to the DB and notify the whole room.
  // Payload: { groupId, content }
  socket.on("note:save", async ({ groupId, content } = {}) => {
    try {
      if (!socket.user) {
        return socket.emit("error", { message: "Unauthorized" });
      }
      if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
        return socket.emit("error", { message: "Invalid group ID" });
      }
      if (content === undefined || content === null) {
        return socket.emit("error", { message: "Content is required" });
      }

      const group = await isMember(groupId, socket.user.id);
      if (!group) {
        return socket.emit("error", { message: "Not a member of this group" });
      }

      const note = await Note.findOneAndUpdate(
        { groupId },
        {
          $set: { content, lastEditedBy: socket.user.id },
          $inc: { version: 1 },
        },
        { upsert: true, new: true },
      );

      // Notify the entire room (including sender so they get the new version)
      io.to(`note:${groupId}`).emit("note:saved", {
        groupId,
        version: note.version,
        lastEditedBy: {
          _id: socket.user.id,
          fullName: socket.user.fullName,
        },
      });
    } catch (error) {
      console.error("note:save error:", error);
      socket.emit("error", { message: "Something went wrong" });
    }
  });

  // ─── note:get ─────────────────────────────────────────────────────────────
  // Re-fetch the latest persisted content (e.g. on reconnect).
  // Payload: { groupId }
  socket.on("note:get", async ({ groupId } = {}) => {
    try {
      if (!socket.user) {
        return socket.emit("error", { message: "Unauthorized" });
      }
      if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
        return socket.emit("error", { message: "Invalid group ID" });
      }

      const group = await isMember(groupId, socket.user.id);
      if (!group) {
        return socket.emit("error", { message: "Not a member of this group" });
      }

      const note = await Note.findOneAndUpdate(
        { groupId },
        { $setOnInsert: { groupId } },
        { upsert: true, new: true },
      );

      socket.emit("note:init", {
        groupId,
        content: note.content,
        version: note.version,
      });
    } catch (error) {
      console.error("note:get error:", error);
      socket.emit("error", { message: "Something went wrong" });
    }
  });

  // ─── note:leave ───────────────────────────────────────────────────────────
  // Client explicitly leaves the note collaboration room.
  // Payload: { groupId }
  socket.on("note:leave", ({ groupId } = {}) => {
    if (!groupId) return;
    socket.leave(`note:${groupId}`);
    console.log(`User ${socket.user?.id} left note room note:${groupId}`);
  });

  // ─── note:cursor ──────────────────────────────────────────────────────────
  // Relay cursor / selection range for collaborative presence UI.
  // Payload: { groupId, range }  — range: { index, length } (Quill range)
  socket.on("note:cursor", ({ groupId, range } = {}) => {
    if (!groupId || !socket.user) return;
    socket.to(`note:${groupId}`).emit("note:cursor", {
      userId: socket.user.id,
      fullName: socket.user.fullName,
      range,
    });
  });
};
