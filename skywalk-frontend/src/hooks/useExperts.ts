import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expertsApi } from '../api/experts';
import type { Expert, VerifyExpertDto } from '../types/expert';

export const expertKeys = {
  all: ['experts'] as const,
  list: (countryId?: number, q?: string) =>
    [...expertKeys.all, 'list', countryId ?? null, q ?? ''] as const,
};

export function useExperts(countryId?: number, q?: string) {
  return useQuery<Expert[], Error>({
    queryKey: expertKeys.list(countryId, q),
    queryFn: () => expertsApi.list({ countryId, q }),
  });
}

export function useVerifyExpert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, dto }: { userId: number; dto: VerifyExpertDto }) =>
      expertsApi.verify(userId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expertKeys.all });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useRevokeExpert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => expertsApi.revoke(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expertKeys.all });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}
