const mongoose = require("mongoose");
const Message = require("../../model/chat.model");
const Group = require("../../model/group.model");
const chatService = require("../../services/chat.service");

module.exports = (io, socket) => {
  socket.on("join-chat", (groupId) => {
    socket.join(groupId);
  });

  socket.on("leave-chat", (groupId) => {
    socket.leave(groupId);
  });

  socket.on("send-message", async ({ groupId, message }) => {
    try {
      if (!socket.user) {
        return socket.emit("error", { message: "Unauthorized" });
      }
      if (!groupId || !message || message.trim() === "") {
        return socket.emit("error", { message: "Invalid message data" });
      }
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return socket.emit("error", { message: "Invalid group ID" });
      }

      const group = await Group.findOne({
        _id: groupId,
        "members.user": socket.user.id,
      });
      if (!group) {
        return socket.emit("error", {
          message: "Not authorized to send message",
        });
      }

      const cleanMessage = message.trim();
      let savedMessage = null;

      //  Save to DB only for friend groups
      if (group.type === "friend") {
        savedMessage = await Message.create({
          groupId,
          sender: socket.user.id,
          text: cleanMessage,
        });
      }

      //  Broadcast to all group members in real-time
      io.to(groupId).emit("receive-message", {
        _id: savedMessage?._id || null,
        groupId,
        sender: {
          _id: socket.user.id,
          fullName: `${socket.user.fullName.firstName} ${socket.user.fullName.lastName}`,
          email: socket.user.email,
        },
        text: cleanMessage,
        groupType: group.type,
        createdAt: savedMessage?.createdAt || new Date(),
      });      
    } catch (error) {
      console.error("Send message error:", error);
      socket.emit("error", { message: "Something went wrong" });
    }
  });

  //  Typing Indicator
  socket.on("typing", ({ groupId, isTyping }) => {
    if (!groupId) return;
    socket.to(groupId).emit("typing", {
      userId: socket.user?.id,
      isTyping,
    });
  });

  //  Message Seen
  socket.on("message-seen", async ({ groupId, messageId }) => {
    if (!groupId || !messageId) return;

    // ✅ Persist to DB
    await chatService.markMessagesAsRead(groupId, socket.user?.id);

    // ✅ Broadcast to others
    socket.to(groupId).emit("message-seen", {
      userId: socket.user?.id,
      messageId,
    });
  });
};
