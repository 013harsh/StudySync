const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      unique: true, // one note per group
    },
 
    content: {
      type: Object, // Quill Delta JSON
      default: {},
    },

    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
