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

router.get("/group/:id/group-messages", authMiddleware, getMessages);
router.post(
  "/group/:id/upload",
  authMiddleware,
  upload.single("file"),
  uploadFile,
);
router.delete("/messages/:id", authMiddleware, deleteMessage);
router.put("/messages/:id", authMiddleware, editMessage);
router.get("/group/:id/unread", authMiddleware, getUnreadCount);

module.exports = router;
