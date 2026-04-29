import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { useUpdateTaskTitleMutation } from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskTitle = ({
  title,
  taskId,
}: {
  title: string;
  taskId: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const { mutate, isPending } = useUpdateTaskTitleMutation();

  useEffect(() => {
    if (!isEditing) {
      setNewTitle(title);
    }
  }, [title, isEditing]);

  const cancelEdit = () => {
    setNewTitle(title);
    setIsEditing(false);
  };

  const updateTitle = () => {
    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle || trimmedTitle === title) {
      cancelEdit();
      return;
    }

    mutate(
      { taskId, title: trimmedTitle },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Title updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || "Failed to update title";
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      updateTitle();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <Input
          autoFocus
          className="w-full min-w-0 text-xl font-semibold"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={cancelEdit}
          disabled={isPending}
        />
      ) : (
        <h2
          className="flex-1 cursor-text text-xl font-semibold transition-colors hover:text-primary"
          onClick={() => setIsEditing(true)}
          title="Click to edit"
        >
          {title}
        </h2>
      )}
    </div>
  );
};