import apiClient from '../lib/api';
import type {
  ExpatriationProject,
  CreateExpatriationProjectDto,
  UpdateExpatriationProjectDto,
} from '../types/expatriation-project';

export const expatriationProjectApi = {
  getAll: async (): Promise<ExpatriationProject[]> => {
    const response = await apiClient.get<ExpatriationProject[]>('/expatriation-project');
    return response.data;
  },

  getById: async (projectId: number): Promise<ExpatriationProject> => {
    const response = await apiClient.get<ExpatriationProject>(`/expatriation-project/${projectId}`);
    return response.data;
  },

  getCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/expatriation-project/count');
    return response.data.count;
  },

  create: async (data: CreateExpatriationProjectDto): Promise<ExpatriationProject> => {
    const response = await apiClient.post<ExpatriationProject>('/expatriation-project', data);
    return response.data;
  },

  update: async (
    projectId: number,
    data: UpdateExpatriationProjectDto,
  ): Promise<ExpatriationProject> => {
    const response = await apiClient.patch<ExpatriationProject>(
      `/expatriation-project/${projectId}`,
      data,
    );
    return response.data;
  },

  delete: async (projectId: number): Promise<void> => {
    await apiClient.delete(`/expatriation-project/${projectId}`);
  },
};

export default expatriationProjectApi;
