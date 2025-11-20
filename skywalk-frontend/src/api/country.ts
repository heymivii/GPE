import apiClient from '../lib/api';
import type { Country } from '../types/country';

export const countryApi = {
  getAll: async (): Promise<Country[]> => {
    const response = await apiClient.get<Country[]>('/country');
    return response.data;
  },

  getById: async (id: number): Promise<Country> => {
    const response = await apiClient.get<Country>(`/country/${id}`);
    return response.data;
  },
};
