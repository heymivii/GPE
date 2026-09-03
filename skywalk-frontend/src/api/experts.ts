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


// ── Candidatures au statut d'expert ────────────────────────────────────────

export type ExpertApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface ExpertApplication {
  idExpertApplication: number;
  expertTitle: string;
  motivation: string;
  status: ExpertApplicationStatus;
  diplomaOriginalName: string;
  diplomaMimeType: string;
  diplomaSizeBytes: number;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  userId: number;
  countryId?: number | null;
  user?: { idUser: number; fullName: string; email: string };
  country?: { idCountry: number; countryName: string } | null;
}

export const expertApplicationsApi = {
  /** Dépose une candidature (multipart : le justificatif accompagne le formulaire). */
  create: async (payload: {
    expertTitle: string;
    motivation: string;
    countryId?: number;
    diploma: File;
  }): Promise<ExpertApplication> => {
    const form = new FormData();
    form.append('expertTitle', payload.expertTitle);
    form.append('motivation', payload.motivation);
    if (payload.countryId != null) form.append('countryId', String(payload.countryId));
    form.append('diploma', payload.diploma);
    // Le header doit être forcé ici : apiClient impose 'application/json' par
    // défaut, et sans cette surcharge Multer ne parse pas le multipart — le
    // fichier restait alors dans le corps, rejeté par forbidNonWhitelisted
    // (« property diploma should not exist »). Même convention que api/documents.ts.
    const response = await apiClient.post<ExpertApplication>('/expert-applications', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  mine: async (): Promise<ExpertApplication[]> => {
    const response = await apiClient.get<ExpertApplication[]>('/expert-applications/mine');
    return response.data;
  },

  // Admin
  list: async (status?: ExpertApplicationStatus): Promise<ExpertApplication[]> => {
    const suffix = status ? `?status=${status}` : '';
    const response = await apiClient.get<ExpertApplication[]>(`/expert-applications${suffix}`);
    return response.data;
  },

  review: async (
    id: number,
    dto: { status: 'approved' | 'rejected'; reviewNote?: string },
  ): Promise<ExpertApplication> => {
    const response = await apiClient.patch<ExpertApplication>(
      `/expert-applications/${id}/review`,
      dto,
    );
    return response.data;
  },

  /** URL du justificatif — consultable par un admin authentifié. */
  diplomaUrl: (id: number): string =>
    `${apiClient.defaults.baseURL ?? ''}/expert-applications/${id}/diploma`,
};

export default expertsApi;
