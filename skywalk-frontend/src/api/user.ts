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
};
