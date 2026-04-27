import { z } from "zod";

export const registerSchema =
    z.object({
        fullName: z.string().min(3, "Full name must be at least 3 characters long").max(50, "Full name must be at most 50 characters long"),
        email: z.string().email("Please provide a valid email address"),
        password: z.string().min(6, "Password must be at least 6 characters long").max(100, "Password must be at most 100 characters long")
    });

export const loginSchema =
    z.object({
        email: z.string().email("Please provide a valid email address"),
        password: z.string().min(6, "Password must be at least 6 characters long").max(100, "Password must be at most 100 characters long")
    });

const objectIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const hexColorSchema = z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid HEX color");


// ✅ Create Workspace
export const createWorkspaceSchema = z.object({
    name: z
        .string()
        .min(3, "Workspace name must be at least 3 characters long")
        .max(50, "Workspace name must be at most 50 characters long")
        .trim(),

    description: z
        .string()
        .max(300, "Workspace description must be at most 300 characters long")
        .optional(),

    color: hexColorSchema.optional(),
});

// ✅ Update Workspace
export const updateWorkspaceSchema = z.object({
    name: z
        .string()
        .min(3, "Workspace name must be at least 3 characters long")
        .max(50, "Workspace name must be at most 50 characters long")
        .trim()
        .optional(),

    description: z
        .string()
        .max(300, "Workspace description must be at most 300 characters long")
        .optional(),

    color: hexColorSchema.optional(),
});

export const addMemberSchema = z.object({
    userId: objectIdSchema,
    role: z.enum(["admin", "member", "viewer"]).optional(),
});

export const workspaceIdParamSchema = z.object({
    workspaceId: objectIdSchema,
});

export const memberParamSchema = z.object({
    workspaceId: objectIdSchema,
    userId: objectIdSchema,
});

export const workspaceQuerySchema = z.object({
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
});