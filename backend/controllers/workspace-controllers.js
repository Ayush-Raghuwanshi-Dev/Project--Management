import mongoose from "mongoose";
import Workspace from "../models/workspace.js";

export const createWorkspace = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = req.user?.id;
    const { name, description, color } = req.body;

    // 🔴 Safety check
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 🔥 Check duplicate workspace (same owner + same name)
    const existingWorkspace = await Workspace.findOne({
      owner: userId,
      name: name.trim(),
      isDeleted: false,
    });

    if (existingWorkspace) {
      return res.status(400).json({
        success: false,
        message: "Workspace with this name already exists",
      });
    }

    // ✅ Create workspace
    const workspace = await Workspace.create(
      [
        {
          name: name.trim(),
          description,
          color,
          owner: userId,
          members: [
            {
              user: userId,
              role: "owner",
            },
          ],
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: workspace[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating workspace:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserWorkspaces = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const workspaces = await Workspace.find({
      "members.user": userId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getWorkspaceById = async (req, res) => {
  return res.status(200).json({ success: true, data: null });
};

export const updateWorkspace = async (req, res) => {
  return res.status(200).json({ success: true, data: null });
};

export const deleteWorkspace = async (req, res) => {
  return res.status(200).json({ success: true, message: "Workspace deleted" });
};

export const addMember = async (req, res) => {
  return res.status(200).json({ success: true, message: "Member added" });
};

export const removeMember = async (req, res) => {
  return res.status(200).json({ success: true, message: "Member removed" });
};
