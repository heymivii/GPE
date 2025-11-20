// API client pour les opérations sur le profil utilisateur

import apiClient from '../lib/api';
import type { User, UpdateProfileDto } from '../types/auth';

export const userApi = {
  // Récupérer le profil de l'utilisateur connecté
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (data: UpdateProfileDto): Promise<User> => {
    const response = await apiClient.patch<User>('/users/me', data);
    return response.data;
  },

  // Supprimer le compte
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/users/me');
  },
};
