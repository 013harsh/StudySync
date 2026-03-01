const Message = require("../model/chat.model");

const getGroupMessages = async (groupId, { before, limit = 20 }) => {
  const query = { groupId };

  if (before) {
    query._id = { $lt: before };
  }

  const messages = await Message.find(query)
    .populate("sender", "fullName email")
    .sort({ _id: -1 }) // newest first
    .limit(limit);

  return messages.reverse(); // return oldest-first for display
};

const saveMessage = async ({ groupId, senderId, text }) => {
  return await Message.create({
    groupId,
    sender: senderId,
    text,
  });
};

const deleteMessageById = async (messageId) => {
  return await Message.findByIdAndDelete(messageId);
};

const editMessageById = async (messageId, text) => {
  return await Message.findByIdAndUpdate(
    messageId,
    { text, isEdited: true },
    { new: true }, // returns the updated document
  );
};

const markMessagesAsRead = async (groupId, userId) => {
  await Message.updateMany(
    { groupId, readBy: { $ne: userId } }, // not yet read by this user
    { $addToSet: { readBy: userId } }, // add userId to readBy array
  );
};

const getUnreadCount = async (groupId, userId) => {
  return await Message.countDocuments({
    groupId,
    readBy: { $ne: userId }, // messages NOT read by this user
  });
};

module.exports = {
  getGroupMessages,
  saveMessage,
  deleteMessageById,
  editMessageById,
  markMessagesAsRead,
  getUnreadCount,
};
