import { Loader } from "@/components/loader";
import { useTaskByIdQuery } from "@/hooks/use-task";
import type { Project, Task } from "@/types";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

const TaskShare = () => {
  const { workspaceId, taskId } = useParams<{ workspaceId: string; taskId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useTaskByIdQuery(taskId || "") as {
    data: { task: Task; project: Project };
    isLoading: boolean;
  };

  useEffect(() => {
    if (!workspaceId || !taskId || !data?.project?._id) return;
    navigate(`/workspaces/${workspaceId}/projects/${data.project._id}/tasks/${taskId}`, { replace: true });
  }, [workspaceId, taskId, data?.project?._id, navigate]);

  if (isLoading) return <Loader />;

  // If we couldn't resolve the project for a shared task, avoid an infinite loader.
  if (!data?.project?._id) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Task not found or you don’t have access.</div>
      </div>
    );
  }

  // Redirect happens in the effect; render nothing to avoid flicker.
  return null;
};

export default TaskShare;

