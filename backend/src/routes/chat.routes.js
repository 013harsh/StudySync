const router = require("express").Router();
const {
  getMessages,
  deleteMessage,
  editMessage,
  getUnreadCount,
} = require("../controller/chat.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/groups/:id/messages", authMiddleware, getMessages);

router.get("/groups/:id/unread", authMiddleware, getUnreadCount);

router.delete("/messages/:id", authMiddleware, deleteMessage);

router.put("/messages/:id", authMiddleware, editMessage);

module.exports = router;
