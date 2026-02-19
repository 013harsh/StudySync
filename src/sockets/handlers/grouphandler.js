const Group = require("../../model/group.model");

module.exports = (io, socket) => {
  socket.on("join-group", async (groupId) => {
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
  });

 socket.on("send-message", async ({ groupId, message }) => {

  const group = await Group.findOne({
    _id: groupId,
    "members.user": socket.user.id,
  });

  if (!group) {
    return socket.emit("error", "Not authorized to send message");
  }

  io.to(groupId).emit("receive-message", {
    userId: socket.user.id,
    message,
  });

});

};
