const userService = require("../services/user.service");

const attachTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = async (req, res, next) => {
  try {
    const { token, user } = await userService.registerUser(req.body);
    attachTokenCookie(res, token);
    res.status(201).json({ message: "Registration successful.", token, user });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { token, user } = await userService.loginUser(req.body);
    attachTokenCookie(res, token);
    res.json({ message: "Login successful.", token, user });
  } catch (error) {
    next(error);
  }
};

const adminLogin = async (req, res, next) => {
  try {
    const { token, user } = await userService.loginUser({
      ...req.body,
      requireAdmin: true,
    });
    attachTokenCookie(res, token);
    res.json({ message: "Admin login successful.", token, user });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user._id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const logout = async (_req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully." });
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUserProfile(req.user._id, req.body);
    res.json({ message: "Profile updated successfully.", user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  me,
  updateProfile,
  logout,
};
