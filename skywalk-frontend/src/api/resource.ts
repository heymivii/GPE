import apiClient from '../lib/api';

export type ResourceType = 'article' | 'video' | 'pdf' | 'website' | 'podcast' | 'tool' | 'other';

export interface Resource {
  idResource: number;
  title: string;
  url?: string;
  resourceType?: ResourceType;
  createdAt: string;
  countryId: number;
  country?: {
    idCountry: number;
    countryName: string;
  };
}

export interface CreateResourceDto {
  title: string;
  url?: string;
  resourceType?: ResourceType;
  countryId: number;
}

export interface UpdateResourceDto {
  title?: string;
  url?: string;
  resourceType?: ResourceType;
  countryId?: number;
}

export const resourceApi = {
  getAll: async (): Promise<Resource[]> => {
    const response = await apiClient.get<Resource[]>('/resource');
    return response.data;
  },

  getByCountry: async (countryId: number): Promise<Resource[]> => {
    const response = await apiClient.get<Resource[]>('/resource', {
      params: { countryId },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Resource> => {
    const response = await apiClient.get<Resource>(`/resource/${id}`);
    return response.data;
  },

  create: async (data: CreateResourceDto): Promise<Resource> => {
    const response = await apiClient.post<Resource>('/resource', data);
    return response.data;
  },

  update: async (id: number, data: UpdateResourceDto): Promise<Resource> => {
    const response = await apiClient.patch<Resource>(`/resource/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/resource/${id}`);
  },
};

export default resourceApi;
