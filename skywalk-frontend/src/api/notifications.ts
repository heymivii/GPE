import apiClient from '../lib/api';

export interface AppNotification {
  idNotification: number;
  notifType: string; // 'reminder' (deadline) | 'info' (decision) | 'alert' (review) | ...
  message: string;
  isRead: boolean;
  sentAt: string;
  userId: number;
  // Contexte cliquable optionnel — ex. 'project' + idProject → /projects/:id/checklist
  contextType?: string | null;
  contextId?: number | null;
  // Libellé facultatif associé au contexte — ex. le prénom pour un contexte 'user'.
  contextLabel?: string | null;
}

export const notificationsApi = {
  /** The current user's notifications (newest first). */
  listMine: async (): Promise<AppNotification[]> => {
    const { data } = await apiClient.get<AppNotification[]>('/notification');
    return data;
  },

  markAsRead: async (id: number): Promise<AppNotification> => {
    const { data } = await apiClient.patch<AppNotification>(`/notification/${id}/read`);
    return data;
  },

  markAllAsRead: async (): Promise<{ updated: number }> => {
    const { data } = await apiClient.patch<{ updated: number }>('/notification/read-all');
    return data;
  },
};

export default notificationsApi;
