const mongoose = require("mongoose");
const Note = require("../model/notes.model");
const Group = require("../model/group.model");
const { getIO } = require("../sockets/io");

// ─── Helper ───────────────────────────────────────────────────────────────────
const isMember = async (groupId, userId) => {
  return Group.findOne({ _id: groupId, "members.user": userId });
};

// ─── Get Note ─────────────────────────────────────────────────────────────────
// GET /api/notes/groups/:id
const getNote = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const groupId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const group = await isMember(groupId, userId);
    if (!group) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    // Upsert: create an empty note if it doesn't exist yet
    const note = await Note.findOneAndUpdate(
      { groupId },
      { $setOnInsert: { groupId } },
      { upsert: true, new: true },
    ).populate("lastEditedBy", "fullName email");

    return res.status(200).json({ note });
  } catch (error) {
    console.error("Get note error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ─── Save Note ────────────────────────────────────────────────────────────────
// PUT /api/notes/groups/:id
const saveNote = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const groupId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const { content } = req.body;
    if (content === undefined || content === null) {
      return res.status(400).json({ message: "Content is required" });
    }

    const group = await isMember(groupId, userId);
    if (!group) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    // Upsert the note, bump version, record editor
    const note = await Note.findOneAndUpdate(
      { groupId },
      {
        $set: { content, lastEditedBy: userId },
        $inc: { version: 1 },
      },
      { upsert: true, new: true },
    ).populate("lastEditedBy", "fullName email");

    // Notify all connected group members in real-time
    getIO()
      .to(groupId)
      .emit("note:saved", {
        groupId,
        version: note.version,
        lastEditedBy: {
          _id: userId,
          fullName: req.user.fullName,
          email: req.user.email,
        },
      });

    return res.status(200).json({ message: "Note saved", note });
  } catch (error) {
    console.error("Save note error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getNote, saveNote };
