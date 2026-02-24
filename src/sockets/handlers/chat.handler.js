const mongoose = require("mongoose");
const Message = require("../../model/chat.model");
const Group = require("../../model/group.model");

module.exports = (io, socket) => {
  // send  message
  socket.on("send-message", async ({ groupId, message }) => {
    try {
      if (!socket.user) {
        return socket.emit("error", "User not found");
      }

      if (!groupId || !message || message.trim() === "") {
        return socket.emit("error", "Invalid message data");
      }

      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return socket.emit("error", "Invalid group ID");
      }

      const group = await Group.findOne({
        _id: groupId,
        "members.user": socket.user.id,
      });

      if (!group) {
        return socket.emit("error", "Not authorized to send message");
      }

      // / Trim message (avoid empty spam)
      const cleanMessage = message.trim();

      // OPTIONAL: Save message in database (recommended)
      // await Message.create({
      //   groupId,
      //   sender: socket.user.id,
      //   message: cleanMessage
      // });

      io.to(groupId).emit("receive-message", {
        userId: socket.user.id,
        message: cleanMessage,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error(error);
      socket.emit("error", "Something went wrong");
    }
  });

  //receive message
};
