import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import {
  changePassword,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.js";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import User from "../models/user.js";
import Notification from "../models/notification.js";

const router = express.Router();

router.get("/search", authenticateUser, async (req, res) => {
  const query = String(req.query.username || "").trim();
  if (query.length < 2) return res.status(200).json({ data: [] });

  const users = await User.find({
    _id: { $ne: req.user._id },
    username: { $regex: query, $options: "i" },
  }).select("username email profilePicture").limit(8);

  res.status(200).json({ data: users });
});

router.get("/notifications", authenticateUser, async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate("sender", "username email profilePicture")
    .populate("workspace", "name color")
    .sort({ createdAt: -1 })
    .limit(20);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    readAt: { $exists: false },
  });
  res.status(200).json({ data: notifications, unreadCount });
});

router.put("/notifications/read-all", authenticateUser, async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, readAt: { $exists: false } },
    { $set: { readAt: new Date() } }
  );
  res.status(200).json({ message: "All notifications marked as read" });
});

router.put("/notifications/:id/read", authenticateUser, async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { $set: { readAt: new Date() } },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.status(200).json({ data: notification });
});

router.put("/profile-picture", authenticateUser, async (req, res) => {
  const { profilePicture } = req.body;
  if (!profilePicture) return res.status(400).json({ message: "Profile picture is required" });
  req.user.profilePicture = profilePicture;
  await req.user.save();
  res.status(200).json({ message: "Profile picture updated successfully", user: req.user.toSafeObject() });
});
router.get("/profile", authenticateUser, getUserProfile);
router.put(
  "/profile",
  authenticateUser,
  validateRequest({
    body: z.object({
      name: z.string().optional(),
      fullName: z.string().optional(),
      profilePicture: z.string().optional(),
    }),
  }),
  updateUserProfile
);

router.put(
  "/change-password",
  authenticateUser,
  validateRequest({
    body: z.object({
      currentPassword: z.string(),
      newPassword: z.string(),
      confirmPassword: z.string(),
    }),
  }),
  changePassword
);

export default router;
