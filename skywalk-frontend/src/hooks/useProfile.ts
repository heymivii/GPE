import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/user';
import { useAuth } from './useAuth';
import type { UpdateProfileDto } from '../types/auth';

export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: userApi.getProfile,
    staleTime: 5 * 60 * 1000, 
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => userApi.updateProfile(data),
    onSuccess: async (updatedUser) => {
      queryClient.setQueryData(profileKeys.detail(), updatedUser);
      await refreshUser();
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: userApi.deleteAccount,
    onSuccess: async () => {
      queryClient.clear();
      await logout();
      navigate('/', { replace: true });
    },
  });
}
