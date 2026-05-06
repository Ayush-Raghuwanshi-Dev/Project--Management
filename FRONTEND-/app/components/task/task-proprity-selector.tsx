import type { TaskPriority, TaskStatus } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  useUpdateTaskPriorityMutation,
  useUpdateTaskStatusMutation,
} from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskPrioritySelector = ({
  priority,
  taskId,
  isAdmin,
}: {
  priority: TaskPriority;
  taskId: string;
  isAdmin?: boolean;
}) => {
  const { mutate, isPending } = useUpdateTaskPriorityMutation();

  const handleStatusChange = (value: string) => {
    mutate(
      { taskId, priority: value as TaskPriority },
      {
        onSuccess: () => {
          toast.success("Priority updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };
  return (
    <Select value={priority || ""} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]" disabled={isPending || !isAdmin}>
        <SelectValue placeholder="Priority" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="Low">Low</SelectItem>
        <SelectItem value="Medium">Medium</SelectItem>
        <SelectItem value="High">High</SelectItem>
      </SelectContent>
    </Select>
  );
};