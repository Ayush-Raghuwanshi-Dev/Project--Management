import { fetchData, updateData } from "@/lib/fetch-util";
import type {
  ChangePasswordFormData,
  ProfileFormData,
} from "@/routes/user/profile";
import { useAuth } from "@/provider/auth-context";
import { queryClient } from "@/provider/react-query-provider";
import { useMutation, useQuery, type QueryKey } from "@tanstack/react-query";

const queryKey: QueryKey = ["user"];

export const useUserProfileQuery = () => {
  return useQuery({
    queryKey,
    queryFn: () => fetchData("/users/profile"),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      updateData("/users/change-password", data),
  });
};

export const useUpdateUserProfile = () => {
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (data: ProfileFormData) => updateData("/users/profile", data),
    onSuccess: (data: any) => {
      const nextUser = data?.user || data;
      queryClient.setQueryData(queryKey, nextUser);
      updateUser(nextUser);
    },
  });
};