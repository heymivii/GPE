import apiClient from '../lib/api';

export interface UserDocument {
  idDocument: number;
  originalName: string;
  docType: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  procedureTracking?: { idProcedureTracking: number } | null;
}

export const ACCEPTED_MIME = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// Types prédéfinis (libellés traduits via documents.types.*).
export const DOC_TYPES = [
  'passport',
  'id_card',
  'visa',
  'residence_permit',
  'work_contract',
  'lease',
  'birth_certificate',
  'diploma',
  'bank_details',
  'insurance',
  'payslip',
  'other',
] as const;

export const documentsApi = {
  listByProject: async (projectId: number): Promise<UserDocument[]> =>
    (await apiClient.get<UserDocument[]>(`/documents?projectId=${projectId}`)).data,

  listByProcedure: async (procedureTrackingId: number): Promise<UserDocument[]> =>
    (
      await apiClient.get<UserDocument[]>(
        `/documents?procedureTrackingId=${procedureTrackingId}`,
      )
    ).data,

  upload: async (
    projectId: number,
    file: File,
    docType: string,
    procedureTrackingId?: number,
  ): Promise<UserDocument> => {
    const form = new FormData();
    form.append('file', file);
    form.append('projectId', String(projectId));
    form.append('docType', docType);
    if (procedureTrackingId) {
      form.append('procedureTrackingId', String(procedureTrackingId));
    }
    return (
      await apiClient.post<UserDocument>('/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data;
  },

  // Télécharge via un blob authentifié (jamais d'URL publique) puis déclenche l'enregistrement.
  download: async (doc: UserDocument): Promise<void> => {
    const res = await apiClient.get(`/documents/${doc.idDocument}/download`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.originalName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },
};

export default documentsApi;
