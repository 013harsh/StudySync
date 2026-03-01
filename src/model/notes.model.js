const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      unique: true, // one note per group
      index: true,
    },

    content: {
      type: Object, // Quill Delta JSON  { ops: [...] }
      default: { ops: [] },
    },

    version: {
      type: Number,
      default: 1,
    },

    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Note", noteSchema);
