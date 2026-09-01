import apiClient from '../lib/api';

export interface UserDocument {
  idDocument: number;
  originalName: string;
  docType: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  procedureTracking?: { idProcedureTracking: number } | null;
  project?: {
    idProject: number;
    destinationCountry?: { countryName: string } | null;
  } | null;
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
  // Tout le coffre personnel (tous projets confondus + documents sans projet).
  listAll: async (): Promise<UserDocument[]> =>
    (await apiClient.get<UserDocument[]>('/documents')).data,

  listByProject: async (projectId: number): Promise<UserDocument[]> =>
    (await apiClient.get<UserDocument[]>(`/documents?projectId=${projectId}`)).data,

  listByProcedure: async (procedureTrackingId: number): Promise<UserDocument[]> =>
    (
      await apiClient.get<UserDocument[]>(
        `/documents?procedureTrackingId=${procedureTrackingId}`,
      )
    ).data,

  // projectId optionnel : sans projet, le document rejoint le coffre personnel.
  upload: async (
    file: File,
    docType: string,
    opts?: { projectId?: number; procedureTrackingId?: number },
  ): Promise<UserDocument> => {
    const form = new FormData();
    form.append('file', file);
    form.append('docType', docType);
    if (opts?.projectId != null) {
      form.append('projectId', String(opts.projectId));
    }
    if (opts?.procedureTrackingId != null) {
      form.append('procedureTrackingId', String(opts.procedureTrackingId));
    }
    return (
      await apiClient.post<UserDocument>('/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data;
  },

  // Récupère le contenu déchiffré via un blob authentifié et renvoie une object-URL
  // (jamais d'URL publique). L'appelant DOIT révoquer l'URL après usage.
  blobUrl: async (doc: UserDocument): Promise<string> => {
    const res = await apiClient.get(`/documents/${doc.idDocument}/download`, {
      responseType: 'blob',
    });
    // On force le bon type MIME pour que <img>/<iframe> l'affiche correctement.
    const blob = new Blob([res.data as BlobPart], { type: doc.mimeType });
    return URL.createObjectURL(blob);
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
