const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json("User not found");
    }

    if (user.role !== "admin") {
      return res.status(403).json("Access denied. Admin only.");
    }

    next();
  } catch (error) {
    res.status(500).json("Admin verification failed");
  }
};

module.exports = adminMiddleware;
