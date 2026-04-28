const userModel = require("../models/user.model");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// when create a service -- when you want to change into database

// thrid validation --> cheak all field are not blank

module.exports.createUser = async ({ username, email, password, role }) => {
  if (!username || !email || !password) {
    throw new Error("All Filed Are Required");
  }

  const user = await userModel.create({ username, email, password, role });

  return user;
};

// update data
module.exports.updateUser = async ({ userId, username, email }) => {
  const updatedUser = await userModel.findOneAndUpdate(
    { _id: userId },
    { username, email },
    { new: true },
  );

  if (!updatedUser) {
    throw new Error("user not found");
  }

  return updatedUser;
};

// forget password
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODE_EMAIL,
    pass: process.env.NODE_PASSWORD,
  },
});

module.exports.forgetPassword = async (email) => {
  const user = await userModel.findOne({ email });

  if (!user) {
    throw new Error("User Not Found !!");
  }

  const token = crypto.randomBytes(32).toString("hex");
  console.log(token);
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
  // created reset Token Expiry time = genrate link data and time + extra 15 min
  // token will be validate only 15 minutes, after 15 minutes token will be expiry and you can't reset your password
  await user.save();

  const resetLink = `http://localhost:3002/reset-password/${token}`;
  // resetLink = frontend page link that show newPassword filed with change password btn

  await transporter.sendMail({
    to: email,
    subject: "Reset Your Password",
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #007bff;">Reset Your Password</h2>
        <p>Hi there,</p>
        <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; padding: 15px 25px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
               Reset My Password
            </a>
        </div>
        
        <p>This link will expire in 30 minutes for security reasons.</p>
        <p>Best regards,<br>The Support Team</p>
    </div>`,
  });
};

// reset password -- set new password logic with timeout validation
module.exports.resetPassword = async ({ token, newPassword }) => {
  const user = await userModel.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Link Expire, Send new Request");
  }

  const hashPassword = await userModel.hashPassword(newPassword);

  user.password = hashPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
};
