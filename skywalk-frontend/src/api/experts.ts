import apiClient from '../lib/api';
import type { Expert, VerifyExpertDto } from '../types/expert';

export const expertsApi = {
  // Public — experts vérifiés, filtrables par pays et recherche texte.
  list: async (params?: { countryId?: number; q?: string }): Promise<Expert[]> => {
    const qs = new URLSearchParams();
    if (params?.countryId) qs.set('countryId', String(params.countryId));
    if (params?.q?.trim()) qs.set('q', params.q.trim());
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    const response = await apiClient.get<Expert[]>(`/users/experts${suffix}`);
    return response.data;
  },

  // Admin — vérifier / révoquer.
  verify: async (userId: number, dto: VerifyExpertDto) => {
    const response = await apiClient.post(`/users/${userId}/verify-expert`, dto);
    return response.data;
  },

  revoke: async (userId: number) => {
    const response = await apiClient.delete(`/users/${userId}/verify-expert`);
    return response.data;
  },

  // Expert connecté — modifie titre / bio (jamais la vérification).
  updateMyProfile: async (dto: { expertTitle?: string; expertBio?: string }) => {
    const response = await apiClient.patch('/users/me/expert-profile', dto);
    return response.data;
  },
};

export default expertsApi;
