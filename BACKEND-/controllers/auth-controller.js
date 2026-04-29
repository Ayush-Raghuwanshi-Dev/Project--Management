import jwt from "jsonwebtoken";
import User from "../models/user.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signToken = (user) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(
    { userId: user._id, tokenVersion: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const setAuthCookie = (res, user) => {
  res.cookie("authToken", signToken(user), cookieOptions);
};

const safeUser = (user) => ({
  _id: user._id,
  id: user._id,
  username: user.username,
  name: user.name || user.username,
  email: user.email,
  profilePicture: user.profilePicture,
  pinnedWorkspaces: user.pinnedWorkspaces || [],
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    }).select("email username");

    if (existingUser?.email === email.toLowerCase()) {
      return res.status(409).json({ field: "email", message: "Email already exists" });
    }
    if (existingUser?.username === username) {
      return res.status(409).json({ field: "username", message: "Username already exists" });
    }

    const user = await User.create({ username, email, password });
    setAuthCookie(res, user);

    res.status(201).json({
      message: "Successfully registered, please login",
      user: safeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user.lastLogin = new Date();
    await user.save();
    setAuthCookie(res, user);

    res.status(200).json({ message: "Login successful", user: safeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message || "Login failed" });
  }
};

const getCurrentUser = (req, res) => res.status(200).json({ user: safeUser(req.user) });

const logoutUser = (req, res) => {
  res.clearCookie("authToken", { ...cookieOptions, maxAge: undefined });
  res.status(200).json({ message: "Logged out successfully" });
};

const verifyEmail = async (_req, res) =>
  res.status(410).json({ message: "Email verification is disabled for this application" });

const resetPasswordRequest = async (_req, res) =>
  res.status(410).json({ message: "Password reset email flow is disabled for this application" });

const verifyResetPasswordTokenAndResetPassword = async (_req, res) =>
  res.status(410).json({ message: "Password reset token flow is disabled for this application" });

export {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  verifyEmail,
  resetPasswordRequest,
  verifyResetPasswordTokenAndResetPassword,
};
