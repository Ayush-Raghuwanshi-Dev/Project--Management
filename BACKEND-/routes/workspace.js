import express from "express";
import { validateRequest } from "zod-express-middleware";
import {
  acceptGenerateInvite,
  acceptInviteByToken,
  createWorkspace,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaces,
  getWorkspaceStats,
  inviteUserToWorkspace,
  removeWorkspaceMember,
  pinWorkspace,
  deleteWorkspace,
  respondToInvite,
} from "../controllers/workspace.js";
import {
  inviteMemberSchema,
  tokenSchema,
  workspaceSchema,
} from "../libs/validate-schema.js";
import authMiddleware from "../middleware/auth-middleware.js";
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
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: inviteMemberSchema,
  }),
  inviteUserToWorkspace
);

router.post("/:workspaceId/invitations", authMiddleware, validateRequest({
  params: z.object({ workspaceId: z.string() }),
  body: inviteMemberSchema,
}), inviteUserToWorkspace);

router.post("/:workspaceId/pin", authMiddleware, pinWorkspace);

router.delete(
  "/:workspaceId",
  authMiddleware,
  deleteWorkspace
);

router.delete(
  "/:workspaceId/members/:memberId",
  authMiddleware,
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

router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);
router.get("/:workspaceId/projects", authMiddleware, getWorkspaceProjects);
router.get("/:workspaceId/stats", authMiddleware, getWorkspaceStats);

export default router;
