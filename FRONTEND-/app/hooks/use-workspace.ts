import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { deleteData, fetchData, postData } from "@/lib/fetch-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export const useCreateWorkspace = () => {
  return useMutation({
    mutationFn: async (data: WorkspaceForm) => postData("/workspaces", data),
  });
};

export const useGetWorkspacesQuery = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await fetchData<any>("/workspaces");
      return Array.isArray(response) ? response : response?.data || [];
    },
  });
};

export const useGetWorkspaceQuery = (workspaceId?: string | null) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
    enabled: Boolean(workspaceId),
  });
};

export const useGetWorkspaceStatsQuery = (workspaceId?: string | null) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "stats"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/stats`),
    enabled: Boolean(workspaceId),
  });
};

export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "details"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}`),
    enabled: Boolean(workspaceId),
  });
};

export const useInviteMemberMutation = () => {
  return useMutation({
    mutationFn: (data: { username: string; message: string; workspaceId: string }) =>
      postData(`/workspaces/${data.workspaceId}/invitations`, data),
  });
};

export const useAcceptInviteByTokenMutation = () => {
  return useMutation({
    mutationFn: (token: string) =>
      postData(`/workspaces/accept-invite-token`, {
        token,
      }),
  });
};

export const useAcceptGenerateInviteMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      postData(`/workspaces/${workspaceId}/accept-generate-invite`, {}),
  });
};

export const useDeleteWorkspaceMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) => deleteData(`/workspaces/${workspaceId}`),
  });
};

export const useRemoveWorkspaceMemberMutation = () => {
  return useMutation({
    mutationFn: (data: { workspaceId: string; memberId: string }) =>
      deleteData(`/workspaces/${data.workspaceId}/members/${data.memberId}`),
  });
};

export const useLeaveWorkspaceMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      postData(`/workspaces/${workspaceId}/leave`, {}),
  });
};

export const useWorkspaceActivityQuery = (workspaceId?: string | null, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "activity", page, limit],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/activity?page=${page}&limit=${limit}`),
    enabled: Boolean(workspaceId),
  });
};
