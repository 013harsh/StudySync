const router = require("express").Router();
const {
  getMessages,
  deleteMessage,
  editMessage,
} = require("../controller/chat.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/groups/:id/messages", authMiddleware, getMessages);
router.delete("/messages/:id", authMiddleware, deleteMessage);
router.put("/messages/:id", authMiddleware, editMessage);

module.exports = router;
