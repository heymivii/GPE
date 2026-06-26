import apiClient from '../lib/api';
import type { ContentReviewStatus, ReviewUserRef } from '../types/country';

export interface City {
  idCity: number;
  name: string;
  latitude?: string;
  longitude?: string;
  population?: number;
  timezone?: string;
  isCapital: boolean;
  imageUrl?: string;
  countryId: number;
  status?: ContentReviewStatus;
  country?: {
    idCountry: number;
    countryName: string;
  };
  createdBy?: ReviewUserRef | null;
  reviewedBy?: ReviewUserRef | null;
  reviewedAt?: string | null;
}

export interface CreateCityDto {
  name: string;
  latitude?: number;
  longitude?: number;
  population?: number;
  timezone?: string;
  isCapital?: boolean;
  imageUrl?: string;
  countryId: number;
}

/** Geo data auto-filled server-side from Open-Meteo + Wikipédia (free, keyless). */
export interface CityAutofillData {
  latitude: number | null;
  longitude: number | null;
  population: number | null;
  timezone: string | null;
  isCapital: boolean;
  imageUrl: string | null;
  matchedName: string | null;
}

export interface UpdateCityDto {
  name?: string;
  latitude?: number;
  longitude?: number;
  population?: number;
  timezone?: string;
  isCapital?: boolean;
  imageUrl?: string;
  countryId?: number;
  status?: 'active' | 'archived';
}

export const cityApi = {
  getAll: async (): Promise<City[]> => {
    const response = await apiClient.get<City[]>('/city');
    return response.data;
  },

  /** Fetch only admin-activated cities (status=active), including their country relation. */
  getActive: async (): Promise<City[]> => {
    const response = await apiClient.get<City[]>('/city', {
      params: { status: 'active' },
    });
    return response.data;
  },

  // Reference list of a country's cities (free geo source) for the admin picker.
  getAvailable: async (country: string): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/city/available', {
      params: { country },
    });
    return response.data;
  },

  getById: async (id: number): Promise<City> => {
    const response = await apiClient.get<City>(`/city/${id}`);
    return response.data;
  },

  create: async (data: CreateCityDto): Promise<City> => {
    const response = await apiClient.post<City>('/city', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCityDto): Promise<City> => {
    const response = await apiClient.patch<City>(`/city/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/city/${id}`);
  },

  /** Geo data auto-fill (Open-Meteo + Wikipédia) — called automatically when a city is selected. */
  autofill: async (
    name: string,
    country?: string,
  ): Promise<CityAutofillData> => {
    const response = await apiClient.get<CityAutofillData>('/city/autofill', {
      params: { name, ...(country ? { country } : {}) },
    });
    return response.data;
  },

  /** Approve a pending city (4-eyes: the author cannot approve their own addition). */
  approve: async (id: number): Promise<City> => {
    const response = await apiClient.patch<City>(`/city/${id}/approve`);
    return response.data;
  },

  /** Reject a pending city — stays invisible user-side. */
  reject: async (id: number): Promise<City> => {
    const response = await apiClient.patch<City>(`/city/${id}/reject`);
    return response.data;
  },
};

export default cityApi;
