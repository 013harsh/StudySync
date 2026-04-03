const router = require("express").Router();
const {
  getMessages,
  deleteMessage,
  editMessage,
  getUnreadCount,
  uploadFile,
} = require("../controller/chat.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.get("/groups/:id/messages", authMiddleware, getMessages);
router.get("/groups/:id/unread", authMiddleware, getUnreadCount);
router.post(
  "/groups/:id/upload",
  authMiddleware,
  upload.single("file"),
  uploadFile,
);
router.delete("/messages/:id", authMiddleware, deleteMessage);
router.put("/messages/:id", authMiddleware, editMessage);

module.exports = router;
