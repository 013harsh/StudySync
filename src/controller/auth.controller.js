const userModel = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
  try {
    const { fullName, email, password } = req.body;
    const { firstName, lastName } = fullName || {};

    if (!fullName || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const isexistAlready = await userModel.findOne({ email });

    if (isexistAlready) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullName: { firstName, lastName },
      email,
      password: passwordHash,
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    };

    return res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "something went wrong" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const ispasswordMatched = await bcrypt.compare(password, user.password);
    if (!ispasswordMatched) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    const userResponse = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    };
    return res
      .status(200)
      .json({ message: "User logged in successfully", user: userResponse });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "something went wrong" });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "something went wrong" });
  }
}

module.exports = { registerUser, loginUser, logout };
