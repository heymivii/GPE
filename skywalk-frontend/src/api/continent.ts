import apiClient from '../lib/api';

export interface Continent {
  idContinent: number;
  name: string;
  isoCode?: string;
  createdAt?: string;
}

export interface CreateContinentDto {
  name: string;
  isoCode?: string;
}

export interface UpdateContinentDto {
  name?: string;
  isoCode?: string;
}

export const continentApi = {
  getAll: async (): Promise<Continent[]> => {
    const response = await apiClient.get<Continent[]>('/continent');
    return response.data;
  },

  create: async (data: CreateContinentDto): Promise<Continent> => {
    const response = await apiClient.post<Continent>('/continent', data);
    return response.data;
  },

  update: async (id: number, data: UpdateContinentDto): Promise<Continent> => {
    const response = await apiClient.patch<Continent>(`/continent/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/continent/${id}`);
  },
};

export default continentApi;
