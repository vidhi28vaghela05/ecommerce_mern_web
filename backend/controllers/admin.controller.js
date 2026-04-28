const userModel = require("../models/user.model");
const adminService = require("../services/admin.service");
const { validationResult } = require("express-validator");

// get all user
module.exports.AllUser = async (req, res) => {
  try {
    const users = await adminService.getAllUser();

    return res.status(200).json({ message: "User Fetch Sucessfully", users });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// delete user
module.exports.deleteUser = async (req, res) => {
  try {
    const user = await adminService.deleteUser(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not Find" });
    }

    return res.status(200).json({ message: "User Delete Successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// update user role
module.exports.updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "Access Denined !!" });
    }

    const user = await adminService.updateUserRole({ userId, role });

    if (!user) {
      throw new Error("User Not Found !!");
    }

    return res
      .status(200)
      .json({ message: "User Role Updated Successfully", user });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
