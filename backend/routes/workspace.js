import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { protect } from "../utils/auth-middleware.js";

import {
    createWorkspace,
    getUserWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace,
    addMember,
    removeMember,
} from "../controllers/workspace-controllers.js";

const router = express.Router();


const createWorkspaceSchema = z.object({
    name: z.string().min(3).max(50),
    description: z.string().max(300).optional(),
    color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i).optional(),
});

const updateWorkspaceSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    description: z.string().max(300).optional(),
    color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i).optional(),
});

const memberSchema = z.object({
    userId: z.string(),
    role: z.enum(["admin", "member", "viewer"]).optional(),
});


// ✅ Create Workspace
router.post(
    "/",
    protect,
    validateRequest({ body: createWorkspaceSchema }),
    createWorkspace
);

// ✅ Get All Workspaces of Logged-in User
router.get("/", protect, getUserWorkspaces);

// ✅ Get Single Workspace
router.get("/:workspaceId", protect, getWorkspaceById);

// ✅ Update Workspace (Admin/Owner)
router.patch(
    "/:workspaceId",
    protect,
    validateRequest({ body: updateWorkspaceSchema }),
    updateWorkspace
);

// ✅ Delete Workspace (Soft Delete)
router.delete("/:workspaceId", protect, deleteWorkspace);

// ✅ Add Member (Admin/Owner)
router.post(
    "/:workspaceId/members",
    protect,
    validateRequest({ body: memberSchema }),
    addMember
);

// ✅ Remove Member
router.delete(
    "/:workspaceId/members/:userId",
    protect,
    removeMember
);

export default router;