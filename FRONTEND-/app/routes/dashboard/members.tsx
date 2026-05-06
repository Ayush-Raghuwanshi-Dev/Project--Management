import { Loader } from "@/components/loader";
import { NoDataFound } from "@/components/no-data-found";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMyTasksQuery } from "@/hooks/use-task";
import { useGetWorkspaceDetailsQuery, useLeaveWorkspaceMutation, useRemoveWorkspaceMemberMutation } from "@/hooks/use-workspace";
import type { Task, Workspace } from "@/types";
import { format } from "date-fns";
import { ArrowUpRight, CheckCircle, Clock, FilterIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useAuth } from "@/provider/auth-context";
import { toast } from "sonner";

const Members = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const workspaceId = searchParams.get("workspaceId");
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState<string>(initialSearch);

  useEffect(() => {
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    params.search = search;

    setSearchParams(params, { replace: true });
  }, [search]);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  const { data, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!) as {
    data: Workspace;
    isLoading: boolean;
  };
  const { mutate: leaveWorkspace, isPending: isLeaving } = useLeaveWorkspaceMutation();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveWorkspaceMemberMutation();

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  if (!data || !workspaceId) {
    return (
      <NoDataFound
        title="Workspace members unavailable"
        description="Select a workspace first to view its members."
        buttonText="Back"
        buttonAction={() => setSearchParams({})}
      />
    );
  }

  // Backend returns { data: workspace } so unwrap it
  const workspace = (data as any)?.data as Workspace;
  const members = workspace?.members ?? [];
  const currentUserRole =
    members.find((m) => String(m.user._id) === String(user?._id))?.role || "viewer";
  const isAdmin = currentUserRole === "admin";
  const isOwner = String(workspace?.owner?._id || workspace?.owner) === String(user?._id);
  const filteredMembers = members.filter(
    (member) =>
      (member.user.username).toLowerCase().includes(search.toLowerCase()) ||
      member.user.email.toLowerCase().includes(search.toLowerCase()) ||
      member.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start md:items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Workspace Members</h1>
          <p className="text-sm text-muted-foreground">
            Role: <span className="font-medium capitalize">{currentUserRole}</span>
          </p>
        </div>

        {!isOwner && (
          <Button
            variant="outline"
            disabled={isLeaving}
            onClick={() => {
              if (!workspaceId) return;
              if (!window.confirm("Leave this workspace?")) return;
              leaveWorkspace(workspaceId, {
                onSuccess: (res: any) => {
                  toast.success(res?.message || "Left workspace");
                  setSearchParams({});
                },
                onError: (error: any) => {
                  toast.error(error.response?.data?.message || "Failed to leave workspace");
                },
              });
            }}
          >
            {isLeaving ? "Leaving..." : "Leave workspace"}
          </Button>
        )}
      </div>

      <Input
        placeholder="Search members ...."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>

        {/* LIST VIEW */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                {filteredMembers?.length} members in your workspace
              </CardDescription>
            </CardHeader>

            <CardContent>
              {filteredMembers.length === 0 ? (
                <NoDataFound
                  title="No members found"
                  description={
                    search
                      ? "No members match your search."
                      : "This workspace has no members yet."
                  }
                  buttonText="Clear Search"
                  buttonAction={() => setSearch("")}
                />
              ) : (
                <div className="divide-y">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.user._id}
                      className="flex flex-col md:flex-row items-center justify-between p-4 gap-3"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="bg-gray-500">
                          <AvatarImage src={member.user.profilePicture} />
                          <AvatarFallback>
                            {(member.user.name || member.user.username || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">@{member.user.username}</p>
                          <p className="text-sm text-gray-500">
                            {member.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 ml-11 md:ml-0">
                        <Badge
                          variant={member.role === "admin" ? "destructive" : "secondary"}
                          className="capitalize"
                        >
                          {member.role}
                        </Badge>

                        <Badge variant={"outline"}>{data.name}</Badge>
                      </div>

                      {isAdmin && member.role !== "admin" && (
                        <div className="ml-11 md:ml-0">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isRemoving}
                            onClick={() => {
                              if (!workspaceId) return;
                              if (!window.confirm("Remove this member from workspace?")) return;
                              removeMember(
                                { workspaceId, memberId: member.user._id },
                                {
                                  onSuccess: () => toast.success("Member removed"),
                                  onError: (error: any) =>
                                    toast.error(
                                      error.response?.data?.message || "Failed to remove member"
                                    ),
                                }
                              );
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOARD VIEW */}
        <TabsContent value="board">
          {filteredMembers.length === 0 ? (
            <NoDataFound
              title="No members found"
              description={
                search
                  ? "No members match your search."
                  : "This workspace has no members yet."
              }
              buttonText="Clear Search"
              buttonAction={() => setSearch("")}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMembers.map((member) => (
                <Card key={member.user._id} className="">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <Avatar className="bg-gray-500 size-20 mb-4">
                      <AvatarImage src={member.user.profilePicture} />
                      <AvatarFallback className="uppercase">
                        {(member.user.name || member.user.username || "Un").substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <h3 className="text-lg font-medium mb-1">
                      @{member.user.username}
                    </h3>

                    <p className="text-sm text-gray-500 mb-4">
                      {member.user.email}
                    </p>

                    <Badge
                      variant={member.role === "admin" ? "destructive" : "secondary"}
                    >
                      {member.role}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Members;