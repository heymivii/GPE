// API client pour les pays

import apiClient from '../lib/api';
import type { Country } from '../types/country';

export const countryApi = {
  // Récupérer tous les pays
  getAll: async (): Promise<Country[]> => {
    const response = await apiClient.get<Country[]>('/country');
    return response.data;
  },

  // Récupérer un pays par son ID
  getById: async (id: number): Promise<Country> => {
    const response = await apiClient.get<Country>(`/country/${id}`);
    return response.data;
  },
};
