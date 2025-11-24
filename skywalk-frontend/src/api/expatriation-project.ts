import apiClient from '../lib/api';
import type {
  ExpatriationProject,
  CreateExpatriationProjectDto,
  UpdateExpatriationProjectDto,
} from '../types/expatriation-project';

export const expatriationProjectApi = {
  /**
   * Get all projects for the authenticated user
   */
  getAll: async (): Promise<ExpatriationProject[]> => {
    const response = await apiClient.get<ExpatriationProject[]>('/expatriation-project');
    return response.data;
  },

  /**
   * Get a specific project by ID
   */
  getById: async (projectId: number): Promise<ExpatriationProject> => {
    const response = await apiClient.get<ExpatriationProject>(`/expatriation-project/${projectId}`);
    return response.data;
  },

  /**
   * Get project count for the authenticated user
   */
  getCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/expatriation-project/count');
    return response.data.count;
  },

  /**
   * Create a new expatriation project
   */
  create: async (data: CreateExpatriationProjectDto): Promise<ExpatriationProject> => {
    const response = await apiClient.post<ExpatriationProject>('/expatriation-project', data);
    return response.data;
  },

  /**
   * Update an existing project
   */
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

  /**
   * Delete a project
   */
  delete: async (projectId: number): Promise<void> => {
    await apiClient.delete(`/expatriation-project/${projectId}`);
  },
};

export default expatriationProjectApi;
