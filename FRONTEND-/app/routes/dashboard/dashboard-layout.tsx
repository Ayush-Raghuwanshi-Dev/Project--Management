import { Header } from "@/components/layout/header";
import { SidebarComponent } from "@/components/layout/sidebar-components";
import { Loader } from "@/components/loader";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { fetchData } from "@/lib/fetch-utils";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { useState } from "react";
import { Navigate, Outlet, useLoaderData } from "react-router";

export const clientLoader = async () => {
  try {
    const [response] = await Promise.all([fetchData<any>("/workspaces")]);
    const workspaces = Array.isArray(response) ? response : response?.data || [];
    return { workspaces };
  } catch (error) {
    console.log(error);
  }
};
const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { workspaces = [] } = useLoaderData() as { workspaces?: Workspace[] };
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(workspaces[0] ?? null);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }

  const handleWorkspaceSelected = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  };

  return (
    <div className="flex h-screen w-full">
      <SidebarComponent currentWorkspace={currentWorkspace} />

      <div className="flex flex-1 flex-col h-full">
        <Header
          onWorkspaceSelected={handleWorkspaceSelected}
          selectedWorkspace={currentWorkspace}
          onCreateWorkspace={() => setIsCreatingWorkspace(true)}
        />

        <main className="flex-1 overflow-y-auto scrollbar-hidden h-full w-full">
          <div className="mx-auto container px-2 sm:px-6 lg:px-8 py-0 md:py-8 w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </div>
  );
};

export default DashboardLayout;
