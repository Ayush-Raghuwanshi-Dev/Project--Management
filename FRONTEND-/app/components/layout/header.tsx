import React from "react";
import { api } from "@/lib/fetch-utils";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarPicker } from "@/components/user/avatar-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, Filter, Pin, PlusCircle, Search } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";

export const Header = ({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkspace,
}: {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showAvatarPicker, setShowAvatarPicker] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterLabel, setFilterLabel] = React.useState<"All Time" | "This Month" | "This Week">("This Month");
  const { data: workspaces = [] } = useGetWorkspacesQuery() as { data: Workspace[] };
  const { data: notificationData } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/user/notifications")).data,
    refetchInterval: 30000,
  });
  const { data: userMatches = [] } = useQuery({
    queryKey: ["user-search", searchQuery],
    queryFn: async () => {
      if (searchQuery.trim().length < 2) return [];
      const response = await api.get("/users/search", {
        params: { username: searchQuery.trim() },
      });
      return response.data?.data || [];
    },
    enabled: searchQuery.trim().length >= 2,
  }) as { data: Array<{ _id: string; username: string; email: string; profilePicture?: string }> };

  React.useEffect(() => {
    setSearchQuery("");
  }, [location.pathname]);

  const filteredWorkspaces = workspaces.filter((workspace) => {
    const createdAt = new Date(workspace.createdAt);
    const now = new Date();

    if (filterLabel === "All Time") return true;
    if (filterLabel === "This Week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      return createdAt >= weekStart;
    }

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return createdAt >= monthStart;
  });

  const recentWorkspaces = [...filteredWorkspaces].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
  const pinnedWorkspaces = ((user?.pinnedWorkspaces || []) as any[])
    .map((item) => (typeof item === "string" ? workspaces.find((workspace) => workspace._id === item) : item))
    .filter(Boolean)
    .slice(0, 5) as Workspace[];

  const selectWorkspace = (workspace: Workspace) => {
    onWorkspaceSelected(workspace);
    setSearchQuery("");
    navigate(`/workspaces/${workspace._id}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="max-w-[220px] justify-between gap-2">
                <span className="truncate">{selectedWorkspace?.name || "Select Workspace"}</span>
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel>Recent workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recentWorkspaces.map((workspace) => (
                <DropdownMenuItem key={workspace._id} onClick={() => selectWorkspace(workspace)}>
                  <span className="size-6 rounded-md text-center text-xs font-bold leading-6 text-white" style={{ backgroundColor: workspace.color }}>
                    {workspace.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate">{workspace.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onCreateWorkspace} className="text-blue-600">
                <PlusCircle className="size-4" />
                Create Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative hidden min-w-[240px] max-w-sm flex-1 md:block">
            <div className="flex items-center rounded-md border bg-background px-3">
              <Search className="mr-2 size-4 text-slate-400" />
              <Input className="h-10 border-0 px-0 shadow-none focus-visible:ring-0" placeholder="Search workspaces or users" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-md border bg-background p-2 shadow-lg">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Workspaces</div>
                {filteredWorkspaces.filter((workspace) => [workspace.name, workspace.description || ""].join(" ").toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4).map((workspace) => (
                  <button key={workspace._id} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-muted" onClick={() => selectWorkspace(workspace)}>
                    <span className="size-6 rounded-md text-center text-xs font-bold leading-6 text-white" style={{ backgroundColor: workspace.color }}>{workspace.name.charAt(0).toUpperCase()}</span>
                    <span className="truncate">{workspace.name}</span>
                  </button>
                ))}
                <div className="my-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Users</div>
                {userMatches.slice(0, 4).map((matchedUser) => (
                  <button key={matchedUser._id} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-muted" onClick={() => {
                    setSearchQuery("");
                    const workspaceId = selectedWorkspace?._id || workspaces[0]?._id;
                    navigate(workspaceId ? `/members?workspaceId=${workspaceId}&search=${encodeURIComponent(matchedUser.username)}` : `/members?search=${encodeURIComponent(matchedUser.username)}`);
                  }}>
                    <span className="size-6 rounded-full bg-muted text-center text-xs font-bold leading-6">{matchedUser.username.charAt(0).toUpperCase()}</span>
                    <span className="truncate">{matchedUser.username}<span className="ml-2 text-xs text-muted-foreground">{matchedUser.email}</span></span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2"><Filter className="size-4" />{filterLabel}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setFilterLabel("This Week")}>This Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterLabel("This Month")}>This Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterLabel("All Time")}>All Time</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="hidden items-center gap-2 xl:flex">
            {pinnedWorkspaces.map((workspace) => (
              <Button key={workspace._id} variant="outline" size="sm" onClick={() => selectWorkspace(workspace)} className="max-w-[150px] gap-2">
                <Pin className="size-3 text-blue-600" />
                <span className="truncate">{workspace.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/notifications">
              <Bell className="size-5" />
              {!!notificationData?.unreadCount && <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">{notificationData.unreadCount > 9 ? "9+" : notificationData.unreadCount}</span>}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex max-w-[260px] items-center gap-2 rounded-md border border-black bg-white px-2 py-1 text-left">
              <Avatar className="size-9">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-sm font-semibold">{user?.username || user?.name}</span>
                <span className="block truncate text-xs text-slate-500">{user?.email}</span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <p>{user?.username || user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/user/profile">Profile</Link></DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowAvatarPicker(true)} className="text-blue-600">Change Avatar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AvatarPicker open={showAvatarPicker} onOpenChange={setShowAvatarPicker} />
        </div>
      </div>
    </header>
  );
};
