const mongoose = require("mongoose");
const Group = require("../model/group.model");
const MessageModel = require("../model/chat.model");
const chatService = require("../services/chat.service");
const { getIO } = require("../sockets/io");

const getMessages = async (req, res) => {
  try {
    const userId = req.user?.id;
    const groupId = req.params.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    // Check user is a member
    const group = await Group.findOne({ _id: groupId, "members.user": userId });
    if (!group) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    // Only friend groups have saved messages
    if (group.type !== "friend") {
      return res
        .status(400)
        .json({ message: "Study groups do not have message history" });
    }

    const { before, limit } = req.query;
    const messages = await chatService.getGroupMessages(groupId, {
      before: before || null,
      limit: parseInt(limit) || 20,
    });

    // Mark messages as read
    await chatService.markMessagesAsRead(groupId, userId);

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const messageId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const message = await MessageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete
    if (message.sender.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized — not your message" });
    }

    await chatService.deleteMessageById(messageId);

    // 🔴 Real-time: notify all group members
    getIO().to(message.groupId.toString()).emit("message-deleted", {
      messageId,
      deletedBy: userId,
    });

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const editMessage = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const messageId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Message text is required" });
    }

    const message = await MessageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can edit
    if (message.sender.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized — not your message" });
    }

    const updated = await chatService.editMessageById(messageId, text.trim());

    // 🟡 Real-time: notify all group members
    getIO().to(message.groupId.toString()).emit("message-edited", {
      messageId,
      newText: updated.text,
      isEdited: true,
      editedBy: userId,
    });

    return res.status(200).json({
      message: "Message updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Edit message error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const groupId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const count = await chatService.getUnreadCount(groupId, userId);
    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Unread count error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getMessages, deleteMessage, editMessage, getUnreadCount };
