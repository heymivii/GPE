import api from '../lib/api';

export interface ChecklistProgress {
  [stepId: string]: {
    completed: boolean;
    completedAt?: string;
    substeps?: {
      [substepId: string]: {
        completed: boolean;
        completedAt?: string;
      };
    };
  };
}

export interface UpdateChecklistDto {
  stepId: string;
  completed: boolean;
  substepId?: string;
}

export const checklistApi = {
  getProgress: async (projectId: number): Promise<ChecklistProgress> => {
    const response = await api.get<ChecklistProgress>(
      `/expatriation-project/${projectId}/checklist`,
    );
    return response.data;
  },

  updateProgress: async (
    projectId: number,
    dto: UpdateChecklistDto,
  ): Promise<void> => {
    await api.post(`/expatriation-project/${projectId}/checklist`, dto);
  },
};
