import mongoose from "mongoose";
import Workspace from "../models/workspace.js";

const createWorkspaceController = async (req, res) => {
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

export { createWorkspaceController };