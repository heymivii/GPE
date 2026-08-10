import apiClient from '../lib/api';

export interface Conversation {
  userId: number;
  fullName: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

export interface ThreadMessage {
  idPrivateMessage: number;
  senderId: number;
  recipientId: number;
  content: string;
  sentAt: string;
  mine: boolean;
}

export const privateMessagesApi = {
  send: async (recipientId: number, content: string): Promise<void> => {
    await apiClient.post('/private-message', { recipientId, content });
  },

  conversations: async (): Promise<Conversation[]> => {
    const { data } = await apiClient.get<Conversation[]>('/private-message/conversations');
    return data;
  },

  thread: async (userId: number): Promise<ThreadMessage[]> => {
    const { data } = await apiClient.get<ThreadMessage[]>(`/private-message/with/${userId}`);
    return data;
  },

  markRead: async (id: number): Promise<void> => {
    await apiClient.patch(`/private-message/${id}/read`);
  },

  unreadCount: async (): Promise<{ count: number }> => {
    const { data } = await apiClient.get<{ count: number }>('/private-message/unread-count');
    return data;
  },
};

export default privateMessagesApi;
