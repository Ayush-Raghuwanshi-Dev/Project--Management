import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    type: {
      type: String,
      enum: ["workspace_invite", "invite_response", "general"],
      default: "general",
    },
    message: { type: String, required: true, maxlength: 2000 },
    // Used for invite responses (accept/reject feedback).
    feedback: { type: String, maxlength: 1000 },
    pdfUrl: { type: String },
    imageUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "info"],
      default: "info",
    },
    readAt: Date,
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
