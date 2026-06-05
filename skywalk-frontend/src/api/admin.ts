import apiClient from '../lib/api';
import type { ExpatriationProject } from '../types/expatriation-project';
import type { AdminProcedure } from './checklist';

export interface AdminStats {
  counts: {
    users: number;
    projects: number;
    topics: number;
    messages: number;
    countries: number;
    cities: number;
    newUsersThisWeek: number;
  };
  distribution: {
    projects: Array<{ status: string; count: string }>;
    users: Array<{ role: string; count: string }>;
    destinations: Array<{ country: string; isoCode: string; count: string }>;
    travelTypes: Array<{ travelType: string; count: string }>;
  };
  recentActivity: {
    topics: Array<{
      idForumTopic: number;
      title: string;
      createdAt: string;
      user?: { firstName?: string; lastName?: string; email: string };
      country?: { countryName: string };
    }>;
    projects: Array<{
      idProject: number;
      objective?: string;
      status: string;
      expectedDepartureDate?: string;
      user?: { firstName?: string; lastName?: string; email: string } | null;
      destinationCountry?: { countryName: string; isoCode: string } | null;
      travelType?: string | null;
    }>;
  };
  timestamp: string;
}

export interface CreateAdminProcedureDto {
  procedureType: string;
  description?: string;
  category?: string;
  stepOrder?: number;
  averageDelayDays?: number;
  countryId: number;
}

export interface UpdateAdminProcedureDto {
  procedureType?: string;
  description?: string;
  category?: string;
  stepOrder?: number;
  averageDelayDays?: number;
  countryId?: number;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get<AdminStats>('/admin/dashboard/stats');
    return response.data;
  },

  getAllProjects: async (): Promise<ExpatriationProject[]> => {
    const response = await apiClient.get<any[]>('/expatriation-project/admin/all');
    return response.data;
  },

  updateProjectStatus: async (projectId: number, status: string): Promise<any> => {
    const response = await apiClient.patch<any>(`/expatriation-project/admin/${projectId}`, { status });
    return response.data;
  },

  getAllProcedures: async (): Promise<AdminProcedure[]> => {
    const response = await apiClient.get<AdminProcedure[]>('/admin-procedure');
    return response.data;
  },

  createProcedure: async (dto: CreateAdminProcedureDto): Promise<AdminProcedure> => {
    const response = await apiClient.post<AdminProcedure>('/admin-procedure', dto);
    return response.data;
  },

  updateProcedure: async (id: number, dto: UpdateAdminProcedureDto): Promise<AdminProcedure> => {
    const response = await apiClient.patch<AdminProcedure>(`/admin-procedure/${id}`, dto);
    return response.data;
  },

  deleteProcedure: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin-procedure/${id}`);
  },
};

export default adminApi;
