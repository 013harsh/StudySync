const Group = require("../../model/group.model");
const mongoose = require("mongoose");

module.exports = (io, socket) => {
  //join group
  socket.on("join-group", async (groupId) => {
    try {
      if (!socket.user) {
        return socket.emit("error", "User not found");
      }
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return socket.emit("error", "Invalid group ID");
      }

      const group = await Group.findOne({
        _id: groupId,
        "members.user": socket.user.id,
      });
      if (!group) {
        return socket.emit("error", "Group not found");
      }

      socket.join(groupId);

      console.log(`User ${socket.user.id} joined ${groupId}`);

      socket.to(groupId).emit("user-joined", {
        userId: socket.user.id,
      });
    } catch (error) {
      console.error("Join Group Error:", error);
      socket.emit("error", "Something went wrong");
    }
  });

  // leave group
  socket.on("leave-group", (data) => {
    try {
      const groupId = data?.groupId;
      if (!groupId) {
        return socket.emit("error", "Group ID required");
      }
      socket.leave(groupId);
      console.log(`User ${socket.user.id} left ${groupId}`);

      socket.to(groupId).emit("user-left", {
        userId: socket.user.id,
      });
    } catch (error) {
      console.error("Leave Group Error:", error);
      socket.emit("error", "Something went wrong");
    }
  });

  //user-joined
  //user left
};
