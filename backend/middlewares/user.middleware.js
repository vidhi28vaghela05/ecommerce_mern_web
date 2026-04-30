const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authUser = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = req.cookies.token || (header.startsWith("Bearer ") ? header.split(" ")[1] : null);

    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "change-me-in-env");
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Session expired. Please login again." });
  }
};

module.exports = { authUser };
