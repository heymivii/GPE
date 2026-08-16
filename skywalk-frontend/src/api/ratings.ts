import apiClient from '../lib/api';

export interface RatingSummary {
  average: number;
  count: number;
}

export const ratingsApi = {
  rate: async (messageId: number, stars: number, comment?: string) => {
    const { data } = await apiClient.post(`/forum-message/${messageId}/rate`, {
      stars,
      comment,
    });
    return data;
  },

  unrate: async (messageId: number) => {
    await apiClient.delete(`/forum-message/${messageId}/rate`);
  },

  // Mes notes pour les messages d'un topic (hydratation UI).
  myTopicRatings: async (
    topicId: number,
  ): Promise<{ messageId: number; stars: number }[]> => {
    const { data } = await apiClient.get<{ messageId: number; stars: number }[]>(
      `/forum-message/ratings/mine?topicId=${topicId}`,
    );
    return data;
  },

  userRating: async (userId: number): Promise<RatingSummary> => {
    const { data } = await apiClient.get<RatingSummary>(`/users/${userId}/rating`);
    return data;
  },
};

export default ratingsApi;
