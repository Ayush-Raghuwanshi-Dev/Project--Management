import mongoose, { Schema } from "mongoose";

const workspaceModel = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String, trim: true },
    color: { type: String, default: "#FF5733" },
    type: {
      type: String,
      trim: true,
      default: "dev",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["admin", "member", "viewer"],
          default: "member",
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    activityLog: [
      {
        message: { type: String, required: true, trim: true },
        timestamp: { type: Date, default: Date.now },
        userId: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);

const Workspace = mongoose.model("Workspace", workspaceModel);

export default Workspace;