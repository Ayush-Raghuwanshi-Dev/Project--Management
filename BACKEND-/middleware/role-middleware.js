import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

export const requireWorkspaceRole = (roles) => {
  return async (req, res, next) => {
    try {
      let workspaceId;

      if (req.params.workspaceId) {
        workspaceId = req.params.workspaceId;
      } else if (req.params.projectId) {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });
        workspaceId = project.workspace;
      } else if (req.params.taskId) {
        const task = await Task.findById(req.params.taskId).populate("project");
        if (!task || !task.project) return res.status(404).json({ message: "Task not found" });
        workspaceId = task.project.workspace;
      } else if (req.params.resourceId) {
        // Strict resolution for generic resourceId: try Workspace -> Project -> Task.
        const resourceId = req.params.resourceId;
        const ws = await Workspace.findById(resourceId).select("_id");
        if (ws) {
          workspaceId = ws._id;
        } else {
          const project = await Project.findById(resourceId).select("workspace");
          if (project) {
            workspaceId = project.workspace;
          } else {
            const task = await Task.findById(resourceId).populate("project", "workspace");
            if (task?.project?.workspace) workspaceId = task.project.workspace;
          }
        }
      }

      if (!workspaceId) {
        return res.status(400).json({ message: "Could not determine workspace context for authorization" });
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) return res.status(404).json({ message: "Workspace not found" });

      const member = workspace.members.find(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!member) {
        return res.status(403).json({ message: "You are not a member of this workspace" });
      }

      if (!roles.includes(member.role)) {
        return res.status(403).json({ message: `Access denied. Requires one of roles: ${roles.join(", ")}` });
      }

      req.workspace = workspace;
      req.memberRole = member.role;
      console.log("requireWorkspaceRole: Authorized", req.user.username, req.originalUrl);
      next();
    } catch (error) {
      console.log("requireWorkspaceRole: Error", error);
      res.status(500).json({ message: "Authorization error", error: error.message });
    }
  };
};
