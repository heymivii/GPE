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
  status?: 'active' | 'archived';
}

export const countryApi = {
  getAll: async (): Promise<Country[]> => {
    const response = await apiClient.get<Country[]>('/country');
    return response.data;
  },

  /** Fetch only admin-activated countries (status=active). */
  getActive: async (): Promise<Country[]> => {
    const response = await apiClient.get<Country[]>('/country', {
      params: { status: 'active' },
    });
    return response.data;
  },

  // Reference list of all countries (name + ISO2) for the admin picker.
  getAvailable: async (): Promise<{ code: string; name: string }[]> => {
    const response = await apiClient.get<{ code: string; name: string }[]>(
      '/country/available',
    );
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

  /** Approve a pending country (4-eyes: the author cannot approve their own addition). */
  approve: async (id: number): Promise<Country> => {
    const response = await apiClient.patch<Country>(`/country/${id}/approve`);
    return response.data;
  },

  /** Reject a pending country — stays invisible user-side. */
  reject: async (id: number): Promise<Country> => {
    const response = await apiClient.patch<Country>(`/country/${id}/reject`);
    return response.data;
  },
};

export default countryApi;
