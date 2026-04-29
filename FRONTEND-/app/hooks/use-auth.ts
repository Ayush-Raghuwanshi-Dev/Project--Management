import { postData } from "@/lib/fetch-utils";
import type { SignupFormData } from "@/routes/auth/sign-up";
import { useMutation } from "@tanstack/react-query";

export const useSignUpMutation = () =>
  useMutation({
    mutationFn: ({ confirmPassword, ...data }: SignupFormData) =>
      postData("/auth/register", data),
  });

export const useLoginMutation = () =>
  useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      postData("/auth/login", data),
  });

export const useVerifyEmailMutation = () =>
  useMutation({
    mutationFn: (data: { token: string }) => postData("/auth/verify-email", data),
  });

export const useForgotPasswordMutation = () =>
  useMutation({
    mutationFn: (data: { email: string }) => postData("/auth/reset-password-request", data),
  });

export const useResetPasswordMutation = () =>
  useMutation({
    mutationFn: (data: { token: string; newPassword: string; confirmPassword: string }) =>
      postData("/auth/reset-password", data),
  });
