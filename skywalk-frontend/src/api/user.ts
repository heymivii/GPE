import apiClient from '../lib/api';
import type { User, UpdateProfileDto } from '../types/auth';

export const userApi = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileDto): Promise<User> => {
    const response = await apiClient.patch<User>('/users/me', data);
    return response.data;
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/users/me');
  },

  getUsersAdmin: async (page = 1, limit = 100): Promise<{ data: any[]; total: number }> => {
    const response = await apiClient.get<any>('/users/admin/all', {
      params: { page, limit },
    });
    return response.data;
  },

  updateUserRole: async (userId: number, role: string): Promise<any> => {
    const response = await apiClient.patch<any>(`/users/admin/${userId}/role`, { role });
    return response.data;
  },
};
