const router = require("express").Router();
const { getNote, saveNote } = require("../controller/notes.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

// GET  /api/notes/groups/:id  — fetch (or auto-create) the group's shared note
router.get("/groups/:id", authMiddleware, getNote);

// PUT  /api/notes/groups/:id  — overwrite content, bump version, broadcast save
router.put("/groups/:id", authMiddleware, saveNote);

module.exports = router;
