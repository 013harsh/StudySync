const groupModel = require("../model/group.model");
const crypto = require("crypto");
const mongoose = require("mongoose");

const createGroup = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Group name is required" });
    }

    const trimmedName = name.trim();

    // Check if same user already created a group with same name
    const existingGroup = await groupModel.findOne({
      name: trimmedName,
      createdBy: userId,
    });

    if (existingGroup) {
      return res.status(400).json({
        message: "You already created a group with this name",
      });
    }

    const inviteCode = crypto.randomBytes(6).toString("hex").toUpperCase();

    const group = await groupModel.create({
      name: trimmedName,
      description: description?.trim() || "",
      createdBy: userId,
      members: [{ user: userId, role: "admin" }],
      inviteCode: inviteCode,
    });

    return res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    console.error("Create group error:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const userId = req.user?.id;
    const groupId = req.params.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //validation id
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }
    //find group
    const group = await groupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    // authorization check

    if (group.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    // delete group
    await groupModel.findByIdAndDelete(groupId);

    return res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Delete group error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
//join Group
const joinGroup = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { inviteCode } = req.body;

    if (!inviteCode || inviteCode.trim() === "") {
      return res.status(400).json({ message: "Invite code is required" });
    }

    // Find group by invite code
    const group = await groupModel.findOne({
      inviteCode: inviteCode.trim().toUpperCase(),
    });

    if (!group) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    // Check if user is already a member
    const alreadyMember = group.members.some(
      (m) => m.user.toString() === userId,
    );

    if (alreadyMember) {
      return res
        .status(400)
        .json({ message: "You are already a member of this group" });
    }

    // Add user to members
    group.members.push({ user: userId, role: "member" });
    await group.save();

    return res.status(200).json({
      message: "Joined group successfully",
      group,
    });
  } catch (error) {
    console.error("Join group error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
// leave group
const leaveGroup = async (req, res) => {
  try {
    const userId = req.user?.id;
    const groupId = req.params.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //validation id
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }
    //find group
    const group = await groupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    // authorization check
    const member = group.members.find((m) => m.user.toString() === userId);
    if (!member) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    // leave group
    group.members = group.members.filter((m) => m.user.toString() !== userId);
    await group.save();

    return res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Leave group error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//Update Group	PUT /api/groups/:id
// 	Get Group Details	GET /api/groups/:id
// 	List All User Groups	GET /api/groups
// 	Remove/Kick Member	DELETE /api/groups/:id/members/:memberId
// 	Generate/Reset Invite Code	POST /api/groups/:id/invite

//POST   /api/groups
//DELETE /api/groups/:id
//PUT    /api/groups/:id
//GET    /api/groups/:id
//GET    /api/groups
//POST   /api/groups/:id/invite
//POST   /api/groups/:id/join

module.exports = { createGroup, deleteGroup, joinGroup, leaveGroup };
