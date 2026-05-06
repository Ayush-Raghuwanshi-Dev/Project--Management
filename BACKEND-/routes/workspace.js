import express from "express";
import { validateRequest } from "zod-express-middleware";
import {
  acceptGenerateInvite,
  acceptInviteByToken,
  createWorkspace,
  getWorkspaceDetails,
  getWorkspaceActivity,
  getWorkspaceProjects,
  getWorkspaces,
  getWorkspaceStats,
  inviteUserToWorkspace,
  removeWorkspaceMember,
  pinWorkspace,
  deleteWorkspace,
  respondToInvite,
  leaveWorkspace,
} from "../controllers/workspace.js";
import {
  inviteMemberSchema,
  tokenSchema,
  workspaceSchema,
} from "../libs/validate-schema.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { requireWorkspaceRole } from "../middleware/role-middleware.js";
import { z } from "zod";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateRequest({ body: workspaceSchema }),
  createWorkspace
);

router.post(
  "/accept-invite-token",
  authMiddleware,
  validateRequest({ body: tokenSchema }),
  acceptInviteByToken
);

router.post(
  "/:workspaceId/invite-member",
  authMiddleware,
  requireWorkspaceRole(["admin"]),
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: inviteMemberSchema,
  }),
  inviteUserToWorkspace
);

router.post("/:workspaceId/invitations", authMiddleware, requireWorkspaceRole(["admin"]), validateRequest({
  params: z.object({ workspaceId: z.string() }),
  body: inviteMemberSchema,
}), inviteUserToWorkspace);

router.post("/:workspaceId/pin", authMiddleware, pinWorkspace);

router.post(
  "/:workspaceId/leave",
  authMiddleware,
  requireWorkspaceRole(["member", "viewer"]),
  leaveWorkspace
);

router.delete(
  "/:workspaceId",
  authMiddleware,
  requireWorkspaceRole(["admin"]),
  deleteWorkspace
);

router.delete(
  "/:workspaceId/members/:memberId",
  authMiddleware,
  requireWorkspaceRole(["admin"]),
  removeWorkspaceMember
);

// Backwards-compatible alias for requested API shape:
// DELETE /workspace/:id/member/:userId
router.delete(
  "/:workspaceId/member/:memberId",
  authMiddleware,
  requireWorkspaceRole(["admin"]),
  removeWorkspaceMember
);

router.post("/invitations/:notificationId/:action", authMiddleware, respondToInvite);

router.post(
  "/:workspaceId/accept-generate-invite",
  authMiddleware,
  validateRequest({ params: z.object({ workspaceId: z.string() }) }),
  acceptGenerateInvite
);

router.get("/", authMiddleware, getWorkspaces);

router.get("/:workspaceId", authMiddleware, requireWorkspaceRole(["admin", "member", "viewer"]), getWorkspaceDetails);
router.get("/:workspaceId/projects", authMiddleware, requireWorkspaceRole(["admin", "member", "viewer"]), getWorkspaceProjects);
router.get("/:workspaceId/stats", authMiddleware, requireWorkspaceRole(["admin", "member", "viewer"]), getWorkspaceStats);
router.get(
  "/:workspaceId/activity",
  authMiddleware,
  requireWorkspaceRole(["admin"]),
  validateRequest({ params: z.object({ workspaceId: z.string() }) }),
  getWorkspaceActivity
);

export default router;
