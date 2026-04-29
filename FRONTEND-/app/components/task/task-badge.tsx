import { cn } from "@/lib/utils";

type TaskPriority = "Low" | "Medium" | "High";

const priorityStyles: Record<TaskPriority, string> = {
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  Medium: "bg-amber-50 text-amber-700 ring-amber-600/15",
  High: "bg-rose-50 text-rose-700 ring-rose-600/15",
};

export const TaskBadge = ({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        priorityStyles[priority],
        className
      )}
    >
      {priority} Priority
    </span>
  );
};