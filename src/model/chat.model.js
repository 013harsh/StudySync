const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["study", "friend"],
      default: "study",
    },

    text: {
      type: String,
      required: true,
    },

    aiStatus: {
      type: String,
      enum: ["approved", "warned", "blocked"],
      default: "approved",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
