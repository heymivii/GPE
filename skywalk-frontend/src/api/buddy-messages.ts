import api from '../lib/api';

export interface BuddyMessage {
  id: number;
  content: string;
  sentAt: string;
  isRead: boolean;
  senderId: number;
  sender?: { idUser: number; firstName: string };
}

export interface BuddyConversation {
  id: number;
  status: string;
  createdAt: string;
  sender: { idUser: number; firstName: string };
  recipient: { idUser: number; firstName: string };
  procedure: { idAdminProcedure: number; procedureType: string };
}

export const buddyMessagesApi = {
  getConversations: async (): Promise<BuddyConversation[]> => {
    const res = await api.get('/buddy-messages/conversations');
    return res.data;
  },

  getMessages: async (contactRequestId: number): Promise<BuddyMessage[]> => {
    const res = await api.get(`/buddy-messages/${contactRequestId}`);
    return res.data;
  },

  sendMessage: async (contactRequestId: number, content: string): Promise<BuddyMessage> => {
    const res = await api.post(`/buddy-messages/${contactRequestId}`, { content });
    return res.data;
  },

  markAsRead: async (contactRequestId: number): Promise<void> => {
    await api.patch(`/buddy-messages/${contactRequestId}/read`);
  },
};
