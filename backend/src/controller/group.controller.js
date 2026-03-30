const groupModel = require("../model/group.model");
const messageModel = require("../model/chat.model");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { getIO } = require("../sockets/io");

const createGroup = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, description, type } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Group name is required" });
    }

    const VALID_TYPES = ["study", "friend"];
    const groupType = type || "study";
    if (!VALID_TYPES.includes(groupType)) {
      return res.status(400).json({
        message: `Invalid group type. Must be one of: ${VALID_TYPES.join(", ")}`,
      });
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
      type: groupType,
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

    if (group.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    // delete group
    await groupModel.findByIdAndDelete(groupId);
    await messageModel.deleteMany({ groupId });

    // 🔴 Real-time: notify all members the group is gone
    getIO().to(groupId).emit("group:deleted", {
      groupId,
      deletedBy: userId,
    });

    return res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Delete group error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
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
      (m) => m.user.toString() === userId.toString(),
    );

    if (alreadyMember) {
      return res
        .status(400)
        .json({ message: "You are already a member of this group" });
    }

    // Add user to members
    group.members.push({ user: userId, role: "member" });
    await group.save();

    // 🟢 Real-time: notify existing members someone joined
    getIO().to(group._id.toString()).emit("group:user-joined", {
      groupId: group._id,
      userId,
      fullName: req.user?.fullName,
    });

    return res.status(200).json({
      message: "Joined group successfully",
      group,
    });
  } catch (error) {
    console.error("Join group error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
const leaveGroup = async (req, res) => {
  try {
    const userId = req.user?.id;
    const groupId = req.params.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // validate id
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    // find group
    const group = await groupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // check user is a member
    const member = group.members.find((m) => m.user.toString() === userId.toString());
    if (!member) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const isAdmin = member.role === "admin";

    // remove user from members
    group.members = group.members.filter((m) => m.user.toString() !== userId.toString());

    // if no members remain, delete the group entirely
    if (group.members.length === 0) {
      await groupModel.findByIdAndDelete(groupId);
      getIO().to(groupId).emit("group:deleted", { groupId, deletedBy: userId });
      return res
        .status(200)
        .json({ message: "Left and group deleted (no members remaining)" });
    }

    // if admin left, promote the next member to admin
    if (isAdmin) {
      group.members[0].role = "admin";
    }

    await group.save();

    // 🟡 Real-time: notify remaining members someone left
    getIO()
      .to(groupId)
      .emit("group:user-left", {
        groupId,
        userId,
        fullName: req.user?.fullName,
        newAdmin: isAdmin ? group.members[0].user : null,
      });

    return res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Leave group error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
const getGroupMembers = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const groupId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    // Only members of the group can view its member list
    const group = await groupModel
      .findOne({ _id: groupId, "members.user": userId })
      .populate("members.user", "fullName email");

    if (!group) {
      return res
        .status(404)
        .json({ message: "Group not found or you are not a member" });
    }

    const members = group.members.map((m) => ({
      _id: m._id,
      user: {
        _id: m.user._id,
        fullName: m.user.fullName,
        email: m.user.email,
      },
      role: m.role,
      joinedAt: m.joinedAt,
    }));

    return res.status(200).json({
      groupId: group._id,
      name: group.name,
      type: group.type,
      memberCount: members.length,
      members,
    });
  } catch (error) {
    console.error("Get group members error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
const getMyGroups = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find all groups where this user is a member
    const groups = await groupModel
      .find({ "members.user": userId })
      .select("name description type inviteCode members createdBy createdAt")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    // Attach the user's role in each group
    const result = groups.map((group) => {
      const member = group.members.find(
        (m) => m.user.toString() === userId.toString(),
      );
      return {
        _id: group._id,
        name: group.name,
        description: group.description,
        type: group.type,
        inviteCode: group.inviteCode,
        memberCount: group.members.length,
        myRole: member?.role || "member",
        createdBy: group.createdBy,
        createdAt: group.createdAt,
      };
    });

    return res.status(200).json({ count: result.length, groups: result });
  } catch (error) {
    console.error("Get my groups error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
module.exports = {
  createGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  getMyGroups,
};
