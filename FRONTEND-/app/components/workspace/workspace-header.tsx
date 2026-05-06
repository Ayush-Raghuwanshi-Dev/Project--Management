import type { User, Workspace } from "@/types";
import { WorkspaceAvatar } from "./workspace-avatar";
import { Button } from "../ui/button";
import { Plus, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface WorkspaceHeaderProps {
  workspace: Workspace;
  members: {
    _id: string;
    user: User;
    role: "admin" | "member" | "viewer";
    joinedAt: Date;
  }[];
  currentUserRole: "admin" | "member" | "viewer";
  onCreateProject: () => void;
  onInviteMember: () => void;
}

export const WorkspaceHeader = ({
  workspace,
  members,
  currentUserRole,
  onCreateProject,
  onInviteMember,
}: WorkspaceHeaderProps) => {
  const isAdmin = currentUserRole === "admin";
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-3">
          <div className="flex md:items-center gap-3">
            {workspace.color && (
              <WorkspaceAvatar color={workspace.color} name={workspace.name} />
            )}

            <h2 className="text-xl md:text-2xl font-semibold">
              {workspace.name}
            </h2>
          </div>

          <div className="flex items-center gap-3 justify-between md:justify-start mb-4 md:mb-0">
            {isAdmin ? (
              <>
                <Button variant={"outline"} onClick={onInviteMember}>
                  <UserPlus className="size-4 mr-2" />
                  Invite
                </Button>
                <Button onClick={onCreateProject}>
                  <Plus className="size-4 mr-2" />
                  Create Project
                </Button>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                You have read access to this workspace.
              </div>
            )}
          </div>
        </div>

        {workspace.description && (
          <p className="text-sm md:text-base text-muted-foreground">
            {workspace.description}
          </p>
        )}
      </div>

      {members.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Members</span>

          <div className="flex space-x-2">
            {members.map((member) => (
              <Avatar
                key={member._id}
                className="relative h-8 w-8 rounded-full  border-2 border-background overflow-hidden"
                title={member.user.name || member.user.username}
              >
                <AvatarImage
                  src={member.user.profilePicture}
                  alt={member.user.name || member.user.username}
                />
                <AvatarFallback>{(member.user.name || member.user.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};