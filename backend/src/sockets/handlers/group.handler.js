const Group = require("../../model/group.model");
const mongoose = require("mongoose");

// In-memory presence tracking: Map<groupId, Set<userId>>
const roomPresence = new Map();

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

      // Add user to presence map
      if (!roomPresence.has(groupId)) {
        roomPresence.set(groupId, new Set());
      }
      roomPresence.get(groupId).add(socket.user.id);

      console.log(`User ${socket.user.id} joined ${groupId}`);

      // Notify others that this user joined
      socket.to(groupId).emit("user-joined", {
        userId: socket.user.id,
      });

      // Send current online users list to the joining user
      const onlineUsers = Array.from(roomPresence.get(groupId));
      socket.emit("room:presence-update", {
        groupId,
        onlineUsers,
      });

      // Broadcast updated presence to all users in the room
      io.to(groupId).emit("room:presence-update", {
        groupId,
        onlineUsers,
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

      // Remove user from presence map
      if (roomPresence.has(groupId)) {
        roomPresence.get(groupId).delete(socket.user?.id);

        // Clean up empty sets
        if (roomPresence.get(groupId).size === 0) {
          roomPresence.delete(groupId);
        } else {
          const onlineUsers = Array.from(roomPresence.get(groupId));
          io.to(groupId).emit("room:presence-update", {
            groupId,
            onlineUsers,
          });
        }
      }

      socket.leave(groupId);
      console.log(`User ${socket.user?.id} left ${groupId}`);

      socket.to(groupId).emit("user-left", {
        userId: socket.user?.id,
      });
    } catch (error) {
      console.error("Leave Group Error:", error);
      socket.emit("error", "Something went wrong");
    }
  });

  // Handle disconnect - remove from all rooms
  socket.on("disconnect", () => {
    if (!socket.user?.id) return;

    // Remove user from all presence maps
    roomPresence.forEach((userSet, groupId) => {
      if (userSet.has(socket.user.id)) {
        userSet.delete(socket.user.id);

        // Broadcast updated presence
        const onlineUsers = Array.from(userSet);
        io.to(groupId).emit("room:presence-update", {
          groupId,
          onlineUsers,
        });

        // Notify others
        io.to(groupId).emit("user-left", {
          userId: socket.user.id,
        });

        // Clean up empty sets
        if (userSet.size === 0) {
          roomPresence.delete(groupId);
        }
      }
    });
  });
};
