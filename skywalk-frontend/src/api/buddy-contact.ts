import api from '../lib/api';

export interface BuddyContactRequest {
  id: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message: string | null;
  createdAt: string;
  expiresAt: string;
  sender: { idUser: number; firstName: string };
  recipient: { idUser: number; firstName: string };
  procedure: { idAdminProcedure: number; procedureType: string };
}

export const buddyContactApi = {
  sendRequest: async (
    recipientId: number,
    procedureId: number,
    message?: string,
  ): Promise<BuddyContactRequest> => {
    const response = await api.post<BuddyContactRequest>('/buddy-contact/request', {
      recipientId,
      procedureId,
      message,
    });
    return response.data;
  },

  respond: async (requestId: number, accept: boolean): Promise<BuddyContactRequest> => {
    const response = await api.patch<BuddyContactRequest>(
      `/buddy-contact/request/${requestId}`,
      { accept },
    );
    return response.data;
  },

  getMyRequests: async (): Promise<BuddyContactRequest[]> => {
    const response = await api.get<BuddyContactRequest[]>('/buddy-contact/requests');
    return response.data;
  },
};
