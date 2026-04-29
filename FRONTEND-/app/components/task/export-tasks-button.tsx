import type { Task } from "@/types";
import { Download } from "lucide-react";
import { CSVLink } from "react-csv";

export const ExportTasksButton = ({ tasks }: { tasks: Task[] }) => {
  const csvData = tasks.map((task) => ({
    Title: task.title,
    Description: task.description || "",
    Status: task.status,
    Priority: task.priority,
    Project: task.project?.title || "",
    Created_At: new Date(task.createdAt).toLocaleString(),
    Due_Date: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
  }));

  return (
    <CSVLink
      data={csvData}
      filename={`tasks-export-${new Date().toISOString().slice(0, 10)}.csv`}
      className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
    >
      <Download className="mr-2 size-4" />
      Export Tasks (CSV)
    </CSVLink>
  );
};