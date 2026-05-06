import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Trash2, UserMinus } from "lucide-react";
import type { MemberProps } from "@/types";
import {
  useDeleteWorkspaceMutation,
  useRemoveWorkspaceMemberMutation,
} from "@/hooks/use-workspace";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const WorkspaceAdminActions = ({
  currentUserRole,
  workspaceId,
  members,
}: {
  currentUserRole: "admin" | "member" | "viewer";
  workspaceId: string;
  members: MemberProps[];
}) => {
  const isAdmin = currentUserRole === "admin";
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } =
    useDeleteWorkspaceMutation();
  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveWorkspaceMemberMutation();

  const removableMembers = useMemo(
    () => members
      .filter((member) => member.role !== "admin")
      .filter((m, i, self) => self.findIndex((t) => t.user._id === m.user._id) === i),
    [members]
  );

  const handleDeleteWorkspace = () => {
    const confirmed = window.confirm(
      "Delete this workspace and all of its projects and tasks? This cannot be undone."
    );

    if (!confirmed) return;

    deleteWorkspace(workspaceId, {
      onSuccess: () => {
        toast.success("Workspace deleted successfully");
        window.location.href = "/workspaces";
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete workspace");
      },
    });
  };

  const handleRemoveMember = () => {
    if (!selectedMemberId) {
      toast.error("Select a member to remove");
      return;
    }

    removeMember(
      { workspaceId, memberId: selectedMemberId },
      {
        onSuccess: () => {
          toast.success("Member removed successfully");
          setSelectedMemberId("");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to remove member");
        },
      }
    );
  };

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Workspace Controls</h3>
        <p className="text-sm text-muted-foreground">
          Sensitive actions are only available to admins.
        </p>
      </div>

      {isAdmin ? (
        <div className="grid gap-3">
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={handleDeleteWorkspace}
            disabled={isDeletingWorkspace}
          >
            <Trash2 className="mr-2 size-4" />
            {isDeletingWorkspace ? "Deleting..." : "Delete Workspace"}
          </Button>
          <div className="grid gap-2 rounded-xl border p-3">
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select member to remove" />
              </SelectTrigger>
              <SelectContent>
                {removableMembers.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No removable members
                  </SelectItem>
                ) : (
                  removableMembers.map((member) => (
                    <SelectItem key={member.user._id} value={member.user._id}>
                      @{member.user.username}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleRemoveMember}
              disabled={isRemovingMember || !selectedMemberId}
            >
              <UserMinus className="mr-2 size-4" />
              {isRemovingMember ? "Removing..." : "Remove User"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
          You can view the workspace, but only admins can delete the workspace or remove members.
        </div>
      )}
    </section>
  );
};