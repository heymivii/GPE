import apiClient from '../lib/api';

export interface AppNotification {
  idNotification: number;
  notifType: string; // 'alert' (review request) | 'info' (decision) | ...
  message: string;
  isRead: boolean;
  sentAt: string;
  userId: number;
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
};

export default notificationsApi;
