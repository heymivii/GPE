import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../../api/auth";
import type { LoginDto } from "../../../types/auth";

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
  });
}