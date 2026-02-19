const groupModel = require("../model/group.model");

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

    const group = await groupModel.create({
      name: trimmedName,
      description: description?.trim() || "",
      createdBy: userId,
      members: [{ user: userId, role: "admin" }],
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    });
    console.log("Group ID:", group.id);

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

module.exports = { createGroup };
