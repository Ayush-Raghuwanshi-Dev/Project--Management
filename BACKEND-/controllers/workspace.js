import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import Comment from "../models/comment.js";
import User from "../models/user.js";
import WorkspaceInvite from "../models/workspace-invite.js";
import jwt from "jsonwebtoken";
import Notification from "../models/notification.js";
import { recordActivity } from "../libs/index.js";
import ActivityLog from "../models/activity.js";

const createWorkspace = async (req, res) => {
  try {
    const { name, description, color, type } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      color,
      ...(type ? { type } : {}),
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "admin",
          joinedAt: new Date(),
        },
      ],
    });

    await recordActivity(req.user._id, "created_workspace", "Workspace", workspace._id, {
      description: `Created ${workspace.name} workspace`,
    }, workspace._id);

    res.status(201).json(workspace);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({ data: workspaces });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceDetails = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId)
      .populate("members.user", "name email profilePicture username")
      .populate("activityLog.userId", "name email profilePicture username");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    res.status(200).json({ data: workspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
    })
      .populate("members.user", "name email profilePicture username")
      .populate("activityLog.userId", "name email profilePicture username");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isWorkspaceAdmin = workspace.members.some(
      (m) => m.user._id.toString() === req.user._id.toString() && m.role === "admin"
    );

    const projectQuery = {
      workspace: workspaceId,
      isArchived: false,
    };

    if (!isWorkspaceAdmin) {
      projectQuery.members = { $elemMatch: { user: req.user._id } };
    }

    const projects = await Project.find(projectQuery)
      .populate("tasks", "status")
      .sort({ createdAt: -1 })
      .lean();

    const projectsWithProgress = projects.map((project) => {
      const totalTasks = project.tasks?.length || 0;
      const doneTasks = project.tasks?.filter((t) => t.status === "Done").length || 0;
      const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
      return { ...project, progress };
    });

    res.status(200).json({ projects: projectsWithProgress, workspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;

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

    const projects = await Project.find({ workspace: workspaceId })
      .select("title description status createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const totalProjects = projects.length;
    const projectIds = projects.map((project) => project._id);

    const tasks = projectIds.length
      ? await Task.find({ project: { $in: projectIds } })
          .select("title status priority dueDate updatedAt isArchived project")
          .lean()
      : [];

    const totalTasks = tasks.length;
    const totalProjectInProgress = projects.filter(
      (project) => project.status === "In Progress"
    ).length;

    const totalTaskCompleted = tasks.filter((task) => task.status === "Done")
      .length;
    const totalTaskToDo = tasks.filter((task) => task.status === "To Do").length;
    const totalTaskInProgress = tasks.filter(
      (task) => task.status === "In Progress"
    ).length;

    // get upcoming task in next 7 days

    const upcomingTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      return (
        taskDate > today &&
        taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    const taskTrendsData = [
      { name: "Sun", completed: 0, inProgress: 0, todo: 0 },
      { name: "Mon", completed: 0, inProgress: 0, todo: 0 },
      { name: "Tue", completed: 0, inProgress: 0, todo: 0 },
      { name: "Wed", completed: 0, inProgress: 0, todo: 0 },
      { name: "Thu", completed: 0, inProgress: 0, todo: 0 },
      { name: "Fri", completed: 0, inProgress: 0, todo: 0 },
      { name: "Sat", completed: 0, inProgress: 0, todo: 0 },
    ];

    // get last 7 days tasks date
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    // populate

    for (const task of tasks) {
      const taskDate = new Date(task.updatedAt);

      const dayInDate = last7Days.findIndex(
        (date) =>
          date.getDate() === taskDate.getDate() &&
          date.getMonth() === taskDate.getMonth() &&
          date.getFullYear() === taskDate.getFullYear()
      );

      if (dayInDate !== -1) {
        const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
          weekday: "short",
        });

        const dayData = taskTrendsData.find((day) => day.name === dayName);

        if (dayData) {
          switch (task.status) {
            case "Done":
              dayData.completed++;
              break;
            case "In Progress":
              dayData.inProgress++;
              break;
            case "To Do":
              dayData.todo++;
              break;
          }
        }
      }
    }

    // get project status distribution
    const projectStatusData = [
      { name: "Completed", value: 0, color: "#10b981" },
      { name: "In Progress", value: 0, color: "#3b82f6" },
      { name: "Planning", value: 0, color: "#f59e0b" },
    ];

    for (const project of projects) {
      switch (project.status) {
        case "Completed":
          projectStatusData[0].value++;
          break;
        case "In Progress":
          projectStatusData[1].value++;
          break;
        case "Planning":
          projectStatusData[2].value++;
          break;
      }
    }

    // Task priority distribution
    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];

    for (const task of tasks) {
      switch (task.priority) {
        case "High":
          taskPriorityData[0].value++;
          break;
        case "Medium":
          taskPriorityData[1].value++;
          break;
        case "Low":
          taskPriorityData[2].value++;
          break;
      }
    }

    const tasksByProject = new Map();
    for (const task of tasks) {
      const projectId = task.project.toString();
      if (!tasksByProject.has(projectId)) {
        tasksByProject.set(projectId, []);
      }
      tasksByProject.get(projectId).push(task);
    }

    const workspaceProductivityData = [];

    for (const project of projects) {
      const projectTask = tasksByProject.get(project._id.toString()) || [];
      const completedTask = projectTask.filter(
        (task) => task.status === "Done" && task.isArchived === false
      );

      workspaceProductivityData.push({
        name: project.title,
        completed: completedTask.length,
        total: projectTask.length,
      });
    }

    const stats = {
      totalProjects,
      totalTasks,
      totalProjectInProgress,
      totalTaskCompleted,
      totalTaskToDo,
      totalTaskInProgress,
    };

    res.status(200).json({
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects: projects.slice(0, 5).map((project) => {
        const projectTask = tasksByProject.get(project._id.toString()) || [];
        return {
          ...project,
          tasks: projectTask,
        };
      }),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const inviteUserToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { username, message, pdfUrl, imageUrl } = req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMemberInfo || userMemberInfo.role !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to invite members to this workspace",
      });
    }

    const existingUser = await User.findOne({ username });

    if (!existingUser) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === existingUser._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    await Notification.create({
      recipient: existingUser._id,
      sender: req.user._id,
      workspace: workspace._id,
      type: "workspace_invite",
      status: "pending",
      message,
      pdfUrl,
      imageUrl,
    });

    await recordActivity(req.user._id, "invite_received", "Workspace", workspaceId, {
      description: `Invited ${existingUser.username} to ${workspace.name}`,
    }, workspace._id);

    res.status(200).json({
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptGenerateInvite = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "You are already a member of this workspace",
      });
    }

    workspace.members.push({
      user: req.user._id,
      role: "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    await recordActivity(
      req.user._id,
      "joined_workspace",
      "Workspace",
      workspaceId,
      {
        description: `Joined ${workspace.name} workspace`,
      }
    );

    res.status(200).json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptInviteByToken = async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user, workspaceId, role } = decoded;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === user.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    const inviteInfo = await WorkspaceInvite.findOne({
      user: user,
      workspaceId: workspaceId,
    });

    if (!inviteInfo) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    if (inviteInfo.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Invitation has expired",
      });
    }

    workspace.members.push({
      user: user,
      role: role || "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    await Promise.all([
      WorkspaceInvite.deleteOne({ _id: inviteInfo._id }),
      recordActivity(user, "joined_workspace", "Workspace", workspaceId, {
        description: `Joined ${workspace.name} workspace`,
      }),
    ]);

    res.status(200).json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const pinWorkspace = async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const workspace = await Workspace.findOne({ _id: workspaceId, "members.user": req.user._id });
  if (!workspace) return res.status(404).json({ message: "Workspace not found" });

  const pinnedIds = (req.user.pinnedWorkspaces || []).map(String);
  if (pinnedIds.includes(workspaceId)) {
    req.user.pinnedWorkspaces = req.user.pinnedWorkspaces.filter((id) => id.toString() !== workspaceId);
  } else {
    if (pinnedIds.length >= 5) return res.status(400).json({ message: "You can pin up to 5 workspaces" });
    req.user.pinnedWorkspaces.push(workspaceId);
  }

  await req.user.save();
  await req.user.populate("pinnedWorkspaces");
  res.status(200).json({
    message: pinnedIds.includes(workspaceId) ? "Workspace unpinned" : "Workspace pinned",
    pinnedWorkspaces: req.user.pinnedWorkspaces,
  });
};

const removeWorkspaceMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const currentUserMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!currentUserMemberInfo || currentUserMemberInfo.role !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to remove members from this workspace",
      });
    }

    if (workspace.owner.toString() === memberId.toString()) {
      return res.status(400).json({
        message: "Workspace owner cannot be removed",
      });
    }

    const memberExists = workspace.members.some(
      (member) => member.user.toString() === memberId.toString()
    );

    if (!memberExists) {
      return res.status(404).json({ message: "Member not found in workspace" });
    }

    workspace.members = workspace.members.filter(
      (member) => member.user.toString() !== memberId.toString()
    );

    await workspace.save();

    await Promise.all([
      User.updateOne(
        { _id: memberId },
        { $pull: { pinnedWorkspaces: workspace._id } }
      ),
      Notification.deleteMany({ workspace: workspace._id, recipient: memberId, type: "workspace_invite" }),
      WorkspaceInvite.deleteMany({ workspaceId: workspace._id, user: memberId }),
      recordActivity(req.user._id, "removed_member", "Workspace", workspaceId, {
        description: `Removed a member from ${workspace.name}`,
      }),
      Notification.create({
        recipient: memberId,
        sender: req.user._id,
        workspace: workspace._id,
        type: "general",
        status: "info",
        message: `You have been removed from the workspace ${workspace.name}`,
      }),
    ]);

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const currentUserMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!currentUserMemberInfo || currentUserMemberInfo.role !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to delete this workspace",
      });
    }

    const projects = await Project.find({ workspace: workspaceId }).select("_id tasks");
    const projectIds = projects.map((project) => project._id);
    const taskIds = projects.flatMap((project) => project.tasks || []);

    const tasks = await Task.find({ _id: { $in: taskIds } }).select("comments");
    const commentIds = tasks.flatMap((task) => task.comments || []);

    await Promise.all([
      Comment.deleteMany({ _id: { $in: commentIds } }),
      Task.deleteMany({ _id: { $in: taskIds } }),
      Project.deleteMany({ _id: { $in: projectIds } }),
      WorkspaceInvite.deleteMany({ workspaceId: workspace._id }),
      Notification.deleteMany({ workspace: workspace._id }),
      User.updateMany(
        { pinnedWorkspaces: workspace._id },
        { $pull: { pinnedWorkspaces: workspace._id } }
      ),
      Workspace.deleteOne({ _id: workspace._id }),
      recordActivity(req.user._id, "updated_workspace", "Workspace", workspaceId, {
        description: `Deleted ${workspace.name} workspace`,
      }),
    ]);

    res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const respondToInvite = async (req, res) => {
  const { notificationId, action } = req.params;
  const { feedback = "" } = req.body;
  if (!["accept", "reject"].includes(action)) return res.status(400).json({ message: "Invalid invitation action" });

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: req.user._id,
    type: "workspace_invite",
    status: "pending",
  }).populate("workspace");

  if (!notification) return res.status(404).json({ message: "Invitation not found" });

  if (action === "accept") {
    const workspace = await Workspace.findById(notification.workspace._id);
    if (!workspace.members.some((member) => member.user.toString() === req.user._id.toString())) {
      workspace.members.push({ user: req.user._id, role: "member", joinedAt: new Date() });
      await workspace.save();
    }
  }

  notification.status = action === "accept" ? "accepted" : "rejected";
  notification.feedback = feedback;
  notification.readAt = new Date();
  await notification.save();

  await Notification.create({
    recipient: notification.sender,
    sender: req.user._id,
    workspace: notification.workspace._id,
    type: "invite_response",
    status: "info",
    message: `${req.user.username} has ${notification.status} your invitation to workspace ${notification.workspace.name}`,
    feedback,
  });

  await recordActivity(
    req.user._id,
    notification.status === "accepted" ? "invite_accepted" : "invite_rejected",
    "Workspace",
    notification.workspace._id,
    {
      description: `${req.user.username} ${notification.status} an invite to ${notification.workspace.name}`,
      feedback,
    },
    notification.workspace._id
  );

  res.status(200).json({ message: `Invitation ${notification.status}` });
};
const leaveWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const memberExists = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!memberExists) {
      return res.status(404).json({ message: "You are not a member of this workspace" });
    }

    if (workspace.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Workspace owner cannot leave the workspace. You must delete it or transfer ownership." });
    }

    workspace.members = workspace.members.filter(
      (member) => member.user.toString() !== req.user._id.toString()
    );

    await workspace.save();

    await Promise.all([
      User.updateOne(
        { _id: req.user._id },
        { $pull: { pinnedWorkspaces: workspace._id } }
      ),
      recordActivity(req.user._id, "left_workspace", "Workspace", workspaceId, {
        description: `Left ${workspace.name} workspace`,
      }, workspace._id),
    ]);

    res.status(200).json({ message: "Left workspace successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getWorkspaceActivity = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 50);
    const skip = (page - 1) * limit;

    const [total, activity] = await Promise.all([
      ActivityLog.countDocuments({ workspaceId }),
      ActivityLog.find({ workspaceId })
        .populate("user", "name username profilePicture fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.status(200).json({
      data: activity,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaceStats,
  inviteUserToWorkspace,
  acceptGenerateInvite,
  acceptInviteByToken,
  pinWorkspace,
  respondToInvite,
  removeWorkspaceMember,
  deleteWorkspace,
  leaveWorkspace,
  getWorkspaceActivity,
};
