const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // NOTE (performance): This DB call validates the user still exists on every request.
    // This ensures revoked/deleted users are rejected immediately but adds one round-trip
    // per request. For high-traffic APIs consider a short-lived in-memory or Redis cache
    // keyed by user ID (e.g. 60-second TTL) as a future optimisation.
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { id: user._id, fullName: user.fullName, email: user.email };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { authMiddleware };
