import api from '../lib/api';

export interface AdminProcedure {
  idAdminProcedure: number;
  procedureType: string;
  description?: string;
  category?: string;
  stepOrder?: number;
  averageDelayDays?: number;
  // ✅ Ajouts pour la checklist personnalisée
  daysBeforeDeparture?: number;
  onlyFor?: {
    travelType?: string[];
    objective?: string[];
  } | null;
  // ✅ Gov-link enrichment (rempli lors de la génération depuis les liens officiels)
  sourceUrl?: string;
  keyFacts?: string[];
}

export interface ProcedureTracking {
  idProcedureTracking: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  start_date?: string;
  end_date?: string;
  completedFacts?: number[];
  admin_procedure: AdminProcedure;
  project: {
    idProject: number;
  };
}

export interface UpdateChecklistDto {
  trackingId: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
}

export const checklistApi = {
  getProgress: async (projectId: number): Promise<ProcedureTracking[]> => {
    const response = await api.get<ProcedureTracking[]>(
      `/procedure-tracking?projectId=${projectId}`,
    );
    return response.data;
  },

  updateProgress: async (
    trackingId: number,
    status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled',
  ): Promise<ProcedureTracking> => {
    const response = await api.patch<ProcedureTracking>(
      `/procedure-tracking/${trackingId}`,
      { status },
    );
    return response.data;
  },

  updateCompletedFacts: async (
    trackingId: number,
    completedFacts: number[],
  ): Promise<ProcedureTracking> => {
    const response = await api.patch<ProcedureTracking>(
      `/procedure-tracking/${trackingId}`,
      { completedFacts },
    );
    return response.data;
  },
};
