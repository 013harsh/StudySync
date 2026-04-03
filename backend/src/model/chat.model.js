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

    text: {
      type: String,
      default: "",
    },

    messageType: {
      type: String,
      enum: ["text", "file"],
      default: "text",
    },

    file: {
      fileName: String,
      fileUrl: String,
      fileType: String,
      fileSize: Number,
      mimeType: String,
    },

    // aiStatus: {
    //   type: String,
    //   enum: ["approved", "warned", "blocked"],
    //   default: "approved",
    // },

    isEdited: {
      type: Boolean,
      default: false,
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
