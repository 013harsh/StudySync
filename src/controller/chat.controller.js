const mongoose = require("mongoose");
const Message = require("../model/chat.model");
const Group = require("../model/group.model");

// ─── Get Messages (with Pagination) ──────────────────────────────────────────
// GET /api/groups/:id/messages?page=1&limit=20
const getMessages = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const groupId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    // Only members can read messages
    const group = await Group.findOne({
      _id: groupId,
      "members.user": userId,
    });
    if (!group) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    // Only friend groups have saved messages
    if (group.type !== "friend") {
      return res
        .status(400)
        .json({ message: "Study groups do not have message history" });
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalMessages = await Message.countDocuments({ groupId });
    const totalPages = Math.ceil(totalMessages / limit);

    const messages = await Message.find({ groupId })
      .populate("sender", "fullName email")
      .sort({ createdAt: -1 }) // newest first (scroll up to load more)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      messages,
      currentPage: page,
      totalPages,
      totalMessages,
      hasNextPage: page < totalPages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ─── Delete Message ───────────────────────────────────────────────────────────
// DELETE /api/messages/:id
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

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only the sender can delete their own message
    if (message.sender.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized — not your message" });
    }

    await Message.findByIdAndDelete(messageId);
    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ─── Edit Message ─────────────────────────────────────────────────────────────
// PUT /api/messages/:id
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

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only the sender can edit their own message
    if (message.sender.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized — not your message" });
    }

    message.text = text.trim();
    await message.save();

    return res.status(200).json({
      message: "Message updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("Edit message error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getMessages, deleteMessage, editMessage };
