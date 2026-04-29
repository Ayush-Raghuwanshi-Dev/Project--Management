import { Loader } from "@/components/loader";
import { CreateProjectDialog } from "@/components/project/create-project";
import { InviteMemberDialog } from "@/components/workspace/invite-member";
import { RecentActivity } from "@/components/workspace/recent-activity";
import { ProjectList } from "@/components/workspace/project-list";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { useGetWorkspaceQuery } from "@/hooks/use-workspace";
import { useAuth } from "@/provider/auth-context";
import type { Project, Workspace } from "@/types";
import { useState } from "react";
import { useParams } from "react-router";
import { WorkspaceAdminActions } from "@/components/workspace/workspace-admin-actions";

const WorkspaceDetails = () => {
  const { user } = useAuth();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [isCreateProject, setIsCreateProject] = useState(false);
  const [isInviteMember, setIsInviteMember] = useState(false);

  if (!workspaceId) {
    return <div>No workspace found</div>;
  }

  const { data, isLoading } = useGetWorkspaceQuery(workspaceId) as {
    data: {
      workspace: Workspace;
      projects: Project[];
    };
    isLoading: boolean;
  };

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  const currentUserRole =
    data.workspace.members.find(
      (member) => member.user._id === user?._id
    )?.role || "member";

  return (
    <div className="space-y-8">
      <WorkspaceHeader
        workspace={data.workspace}
        members={data?.workspace?.members as any}
        onCreateProject={() => setIsCreateProject(true)}
        onInviteMember={() => setIsInviteMember(true)}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ProjectList
          workspaceId={workspaceId}
          projects={data.projects}
          onCreateProject={() => setIsCreateProject(true)}
        />

        <div className="space-y-6">
          <WorkspaceAdminActions
            currentUserRole={currentUserRole}
            workspaceId={workspaceId}
            members={data.workspace.members as any}
          />
          <RecentActivity activityLog={data.workspace.activityLog || []} />
        </div>
      </div>

      <CreateProjectDialog
        isOpen={isCreateProject}
        onOpenChange={setIsCreateProject}
        workspaceId={workspaceId}
        workspaceMembers={data.workspace.members as any}
      />

      <InviteMemberDialog
        isOpen={isInviteMember}
        onOpenChange={setIsInviteMember}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export default WorkspaceDetails;