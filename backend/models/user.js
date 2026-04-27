import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select  : false
  },
  profilePicture: {
    type: String,
    default: ""
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  is2FAEnabled: {
    type: Boolean,
    default: false,
    select: false
  },
  twoFAOTP: {
    type: String,
    default: null,
    select: false
  },
  twoFAOTPExpires: {
    type: Date,
    default: null,
    select: false
  },
  tokenVersion: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;

