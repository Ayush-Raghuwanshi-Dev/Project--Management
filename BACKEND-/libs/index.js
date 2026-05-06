import ActivityLog from "../models/activity.js";

/**
 * Central activity recorder used by controllers.
 * Keeps existing behavior (workspace.activityLog) separate; this logs to ActivityLog collection.
 */
export const recordActivity = async (
  userId,
  action,
  resourceType,
  resourceId,
  details = {},
  workspaceId = undefined
) => {
  if (!userId || !action || !resourceType || !resourceId) return null;

  return ActivityLog.create({
    user: userId,
    action,
    resourceType,
    resourceId,
    details,
    ...(workspaceId ? { workspaceId } : {}),
  });
};
