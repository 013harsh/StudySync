const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // group.model.js — add this field
    type: {
      type: String,
      enum: ["study", "friend"],
      default: "study",
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    inviteCode: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

const groupModel = mongoose.model("Group", groupSchema);
module.exports = groupModel;
