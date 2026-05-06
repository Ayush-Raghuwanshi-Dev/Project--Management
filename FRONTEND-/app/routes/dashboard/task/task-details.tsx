import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { CommentSection } from "@/components/task/comment-section";
import { SubTasksDetails } from "@/components/task/sub-tasks";
import { TaskActivity } from "@/components/task/task-activity";
import { TaskAssigneesSelector } from "@/components/task/task-assignees-selector";
import { TaskDescription } from "@/components/task/task-description";
import { TaskBadge } from "@/components/task/task-badge";
import { TaskPrioritySelector } from "@/components/task/task-priority-selector";
import { TaskStatusSelector } from "@/components/task/task-status-selector";
import { TaskTitle } from "@/components/task/task-title";
import { Watchers } from "@/components/task/watchers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAchievedTaskMutation,
  useTaskByIdQuery,
  useWatchTaskMutation,
  useDeleteTaskMutation,
} from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import type { Project, Task } from "@/types";
import { format, formatDistanceToNow } from "date-fns";
import { Eye, EyeOff, Paperclip, FileText, Image as ImageIcon, Download } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace";
import { toast } from "sonner";

const TaskDetails = () => {
  const { user } = useAuth();
  const { taskId, projectId, workspaceId } = useParams<{
    taskId: string;
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const { data, isLoading } = useTaskByIdQuery(taskId!) as {
    data: {
      task: Task;
      project: Project;
    };
    isLoading: boolean;
  };
  const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
  const { mutate: achievedTask, isPending: isAchieved } =
    useAchievedTaskMutation();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();
  const { data: workspaceData, isLoading: isLoadingWorkspace } = useGetWorkspaceDetailsQuery(workspaceId!);

  if (isLoading || isLoadingWorkspace) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold">Task not found</div>
      </div>
    );
  }

  const { task, project } = data;
  const isUserWatching = task?.watchers?.some(
    (watcher) => watcher._id.toString() === user?._id.toString()
  );

  const goBack = () => navigate(-1);

  const members = task?.assignees || [];

  const currentUserRole = (workspaceData as any)?.data?.members?.find(
    (m: any) => m.user?._id === user?._id || m.user === user?._id
  )?.role;

  const isAdmin = currentUserRole === "admin";
  const isMember = currentUserRole === "member";
  const canEditStatus = isAdmin || isMember;

  const handleWatchTask = () => {
    watchTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success("Task watched");
        },
        onError: () => {
          toast.error("Failed to watch task");
        },
      }
    );
  };

  const handleAchievedTask = () => {
    achievedTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success("Task achieved");
        },
        onError: () => {
          toast.error("Failed to achieve task");
        },
      }
    );
  };

  const handleDeleteTask = () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    deleteTask(
      { taskId: task._id, projectId: task.project as any },
      {
        onSuccess: () => {
          toast.success("Task deleted successfully");
          goBack();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to delete task");
        },
      }
    );
  };

  return (
    <div className="container mx-auto p-0 py-4 md:px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <BackButton />

          <h1 className="text-xl md:text-2xl font-bold">{task.title}</h1>

          {task.isArchived && (
            <Badge className="ml-2" variant={"outline"}>
              Archived
            </Badge>
          )}
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            variant={"outline"}
            size="sm"
            onClick={handleWatchTask}
            className="w-fit"
            disabled={isWatching}
          >
            {isUserWatching ? (
              <>
                <EyeOff className="mr-2 size-4" />
                Unwatch
              </>
            ) : (
              <>
                <Eye className="mr-2 size-4" />
                Watch
              </>
            )}
          </Button>

          <Button
            variant={"outline"}
            size="sm"
            onClick={handleAchievedTask}
            className="w-fit"
            disabled={isAchieved}
          >
            {task.isArchived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4">
              <div>
                <TaskBadge priority={task.priority} className="mb-2" />

                <TaskTitle title={task.title} taskId={task._id} isAdmin={isAdmin} />

                <div className="text-sm md:text-base text-muted-foreground">
                  Created at:{" "}
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <TaskStatusSelector status={task.status} taskId={task._id} disabled={!canEditStatus} />

                {isAdmin && (
                  <Button
                    variant={"destructive"}
                    size="sm"
                    disabled={isDeleting}
                    onClick={handleDeleteTask}
                    className="hidden md:block"
                  >
                    {isDeleting ? "Deleting..." : "Delete Task"}
                  </Button>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-0">
                Description
              </h3>

              <TaskDescription
                description={task.description || ""}
                taskId={task._id}
                isAdmin={isAdmin}
              />
            </div>

            <TaskAssigneesSelector
              task={task}
              assignees={task.assignees}
              projectMembers={project.members as any}
              isAdmin={isAdmin}
            />

            <TaskPrioritySelector priority={task.priority} taskId={task._id} isAdmin={isAdmin} />

            <SubTasksDetails subTasks={task.subtasks || []} taskId={task._id} isAdmin={isAdmin} />

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Paperclip className="size-4" /> Attachments
                </h3>
                <div className="flex flex-col gap-2">
                  {task.attachments.map((att) => (
                    <a
                      key={att._id}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-md border bg-muted/40 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      {att.fileType === "application/pdf" ? (
                        <FileText className="size-4 text-red-500 shrink-0" />
                      ) : (
                        <ImageIcon className="size-4 text-blue-500 shrink-0" />
                      )}
                      <span className="truncate flex-1">{att.fileName}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {att.fileType === "application/pdf" ? "PDF" : "Image"}
                        {att.fileSize ? ` · ${(att.fileSize / 1024).toFixed(0)} KB` : ""}
                      </span>
                      <Download className="size-4 text-muted-foreground shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <CommentSection taskId={task._id} members={project.members as any} />
        </div>

        {/* right side */}
        <div className="w-full">
          <Watchers watchers={task.watchers || []} />

          <TaskActivity resourceId={task._id} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;