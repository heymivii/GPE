import apiClient from '../lib/api';

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
  status?: 'active' | 'archived';
  country?: {
    idCountry: number;
    countryName: string;
  };
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
};

export default cityApi;
