import apiClient from '../lib/api';
import type { Country } from '../types/country';

export interface CreateCountryDto {
  countryName: string;
  isoCode?: string;
  continentId: number;
}

export interface UpdateCountryDto {
  countryName?: string;
  isoCode?: string;
  continentId?: number;
}

export const countryApi = {
  getAll: async (): Promise<Country[]> => {
    const response = await apiClient.get<Country[]>('/country');
    return response.data;
  },

  getById: async (id: number): Promise<Country> => {
    const response = await apiClient.get<Country>(`/country/${id}`);
    return response.data;
  },

  create: async (data: CreateCountryDto): Promise<Country> => {
    const response = await apiClient.post<Country>('/country', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCountryDto): Promise<Country> => {
    const response = await apiClient.patch<Country>(`/country/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/country/${id}`);
  },
};

export default countryApi;
