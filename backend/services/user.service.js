const User = require("../models/user.model");

const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
});

const buildUsername = async (name, email) => {
  const base = (name || email.split("@")[0] || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 12) || "user";

  let username = base;
  let counter = 1;

  while (await User.findOne({ username })) {
    username = `${base}${counter}`;
    counter += 1;
  }

  return username;
};

const registerUser = async ({ name, email, password, phone }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const username = await buildUsername(name, email);
  const user = await User.create({
    username,
    name,
    email: email.toLowerCase(),
    password,
    phone,
  });

  const token = user.generateAuthToken();
  return { token, user: sanitizeUser(user) };
};

const loginUser = async ({ email, password, requireAdmin = false }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid email or password.");
  }

  if (requireAdmin && user.role !== "admin") {
    throw new Error("Admin access denied.");
  }

  const token = user.generateAuthToken();
  return { token, user: sanitizeUser(user) };
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  return sanitizeUser(user);
};

const updateUserProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  if (data.name) user.name = data.name;
  if (data.phone) user.phone = data.phone;
  if (data.password) user.password = data.password;

  await user.save();
  return sanitizeUser(user);
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  sanitizeUser,
};
