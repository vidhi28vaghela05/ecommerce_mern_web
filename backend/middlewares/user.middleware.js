const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

module.exports.authUser = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "Token Exprie Re-SignIn" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await userModel.findOne({ _id: decoded._id });

    if (!user) {
      return res.status(401).json({ message: "Unathorized" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(500).json({ error });
  }
};
