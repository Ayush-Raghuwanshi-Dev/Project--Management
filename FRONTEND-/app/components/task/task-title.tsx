import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { useUpdateTaskTitleMutation } from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskTitle = ({
  title,
  taskId,
  isAdmin,
}: {
  title: string;
  taskId: string;
  isAdmin?: boolean;
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
            className={`flex-1 text-xl font-semibold transition-colors ${isAdmin ? "cursor-text hover:text-primary" : ""}`}
            onClick={() => {
              if (isAdmin) setIsEditing(true);
            }}
            title={isAdmin ? "Click to edit" : undefined}
          >
            {title}
          </h2>
      )}
    </div>
  );
};