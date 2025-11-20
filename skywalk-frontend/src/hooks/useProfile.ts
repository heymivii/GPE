// Hooks React Query pour gérer le profil utilisateur

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/user';
import { useAuth } from './useAuth';
import type { UpdateProfileDto } from '../types/auth';

// Clés pour la gestion du cache React Query
export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

// Hook pour récupérer le profil utilisateur
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: userApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook pour mettre à jour le profil
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => userApi.updateProfile(data),
    onSuccess: async (updatedUser) => {
      // Mettre à jour le cache
      queryClient.setQueryData(profileKeys.detail(), updatedUser);
      // Rafraîchir aussi le contexte d'authentification
      await refreshUser();
    },
  });
}

// Hook pour supprimer le compte
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: userApi.deleteAccount,
    onSuccess: async () => {
      // Nettoyer le cache
      queryClient.clear();
      // Déconnecter l'utilisateur
      await logout();
      // Rediriger vers la page d'accueil
      navigate('/', { replace: true });
    },
  });
}
