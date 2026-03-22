const router = require("express").Router();
const { getNote, saveNote } = require("../controller/notes.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.get("/groups/:id", authMiddleware, getNote);
router.put("/groups/:id", authMiddleware, saveNote);

module.exports = router;
