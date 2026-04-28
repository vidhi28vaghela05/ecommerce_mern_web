const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const userModel = require("../models/user.model");

module.exports.registerUser = async (req, res) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }

  const { username, email, password, role } = req.body;

  // check user is already registed or not
  let isExist = await userModel.findOne({ email: email });

  if (isExist) {
    return res.status(400).json({ message: "user is already register" });
  }

  const hashPassword = await userModel.hashPassword(password);

  const user = await userService.createUser({
    username,
    email,
    password: hashPassword,
    role,
  });

  let token = await user.generateAuthToken();

  res.status(200).json({ token, user });
};

module.exports.loginUser = async (req, res) => {
  let error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }

  const { email, password } = req.body;

  let checkUser = await userModel.findOne({ email: email }).select("+password");

  if (!checkUser) {
    return res.status(401).json({ message: "Email is invaild" });
  }

  const isMatch = await checkUser.comparePassword(password);

  if (!isMatch) {
    return res.status(400).json({ message: "Wrong Password" });
  }

  const token = checkUser.generateAuthToken();
  res.cookie("token", token);

  res.status(200).json({ token, checkUser });
};

module.exports.profile = (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "User logout Successfully !!" });
};

module.exports.updateUser = async (req, res) => {
  const userId = req.user.id;
  console.log(userId);

  const { username, email } = req.body;

  const updateUser = await userService.updateUser({ userId, username, email });

  res
    .status(200)
    .json({ message: "User Data Updated Successfully,", updateUser });
};

// forget password --> send email for reset password
module.exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await userService.forgetPassword(email);

    return res.status(200).json({
      message: "Email Send your Registed Mail Sucessfully. Check Your Mail",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

// reset Password
module.exports.resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { newPassword } = req.body;

    await userService.resetPassword({ token, newPassword });

    return res.status(200).json({ message: "Password Reset Successfully " });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
