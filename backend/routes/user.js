import express from 'express';
import { protect } from '../utils/auth-middleware.js';
import User from '../models/user.js';

const router = express.Router();

router.put('/profile-picture', protect, async (req, res) => {
    try {
        const { profilePicture } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        user.profilePicture = profilePicture;
        await user.save();
        
        res.status(200).json({ 
            success: true,
            message: "Profile picture updated successfully", 
            profilePicture 
        });
    } catch (err) {
        console.error("Error updating profile picture:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
