import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        
        const username = fullName; // map fullName to username
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = await User.create({ username, email, password: hashedPassword });
        
        res.status(201).json({ message: "Registration successful. Please log in.", user: newUser });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, tokenVersion: user.tokenVersion || 0 },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "7d" }
        );

        user.lastLogin = new Date();
        await user.save();

        user.password = undefined; // Don't send password back

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
            },
            token
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: error.message });
    }
}

const logoutUser = (req, res) => {
    // For single-device logout, the client just needs to discard their JWT token.
    res.status(200).json({ message: "Logged out successfully" });
};

const logoutAllDevices = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Increment tokenVersion so all existing JWTs become invalid
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();
        
        res.status(200).json({ message: "Logged out from all devices successfully" });
    } catch (error) {
        console.error("Error logging out from all devices:", error);
        res.status(500).json({ message: error.message });
    }
};

export { registerUser, loginUser, logoutUser, logoutAllDevices };