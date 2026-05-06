import mongoose, { Schema } from "mongoose";

const activityLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "created_task",
        "updated_task",
        "created_subtask",
        "updated_subtask",
        "completed_task",
        "created_project",
        "updated_project",
        "completed_project",
        "created_workspace",
        "updated_workspace",
        "added_comment",
        "added_member",
        "removed_member",
        "joined_workspace",
        "left_workspace",
        "invite_received",
        "invite_accepted",
        "invite_rejected",
        "assigned_task",
        "deleted_task",
        "transferred_workspace_ownership",
        "added_attachment",
      ],
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      enum: ["Task", "Project", "Workspace", "Comment", "User"],
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: Object,
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ workspaceId: 1, createdAt: -1 });
activityLogSchema.index({ resourceId: 1, createdAt: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;