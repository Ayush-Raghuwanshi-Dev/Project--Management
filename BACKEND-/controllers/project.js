import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, status, startDate, dueDate, tags, members } =
      req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const tagArray = tags ? tags.split(",") : [];

    // Always include the creator as a manager in project members
    const creatorAlreadyInMembers = (members || []).some(
      (m) => m.user === req.user._id.toString()
    );
    const projectMembers = creatorAlreadyInMembers
      ? members || []
      : [{ user: req.user._id, role: "manager" }, ...(members || [])];

    const newProject = await Project.create({
      title,
      description,
      status,
      startDate,
      dueDate,
      tags: tagArray,
      workspace: workspaceId,
      members: projectMembers,
      createdBy: req.user._id,
    });

    workspace.projects.push(newProject._id);
    await workspace.save();

    return res.status(201).json(newProject);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate(
      "members.user",
      "name username email profilePicture"
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Allow workspace admin access even if not an explicit project member
    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );
    const workspace = await (await import("../models/workspace.js")).default.findById(project.workspace);
    const isWorkspaceAdmin = workspace?.members.some(
      (m) => m.user.toString() === req.user._id.toString() && m.role === "admin"
    );

    if (!isMember && !isWorkspaceAdmin) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("members.user", "name username email profilePicture");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );
    const wsModel = (await import("../models/workspace.js")).default;
    const workspace = await wsModel.findById(project.workspace);
    const isWorkspaceAdmin = workspace?.members.some(
      (m) => m.user.toString() === req.user._id.toString() && m.role === "admin"
    );

    if (!isMember && !isWorkspaceAdmin) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const { status, priority, assignee } = req.query;

    const query = {
      project: projectId,
      isArchived: false,
    };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignees = { $in: [assignee] };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalTasks = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate("assignees", "name username profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      project,
      tasks,
      pagination: {
        totalTasks,
        totalPages: Math.ceil(totalTasks / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { createProject, getProjectDetails, getProjectTasks };