import apiClient from '../lib/api';
import type {
  ForumMessage,
  CreateForumMessageDto,
  UpdateForumMessageDto,
} from '../types/forum';

/**
 * API client pour gérer les messages du forum
 * Correspond au ForumMessageController du backend
 */
export const forumMessagesApi = {
  /**
   * Récupérer tous les messages
   * GET /api/forum-message
   */
  findAll: async (): Promise<ForumMessage[]> => {
    const response = await apiClient.get<ForumMessage[]>('/forum-message');
    return response.data;
  },

  /**
   * Récupérer un message spécifique par son ID
   * GET /api/forum-message/:id
   */
  findOne: async (id: number): Promise<ForumMessage> => {
    const response = await apiClient.get<ForumMessage>(`/forum-message/${id}`);
    return response.data;
  },

  /**
   * Créer un nouveau message (réponse à un topic)
   * POST /api/forum-message
   */
  create: async (data: CreateForumMessageDto): Promise<ForumMessage> => {
    const response = await apiClient.post<ForumMessage>('/forum-message', data);
    return response.data;
  },

  /**
   * Mettre à jour un message existant
   * PATCH /api/forum-message/:id
   */
  update: async (id: number, data: UpdateForumMessageDto): Promise<ForumMessage> => {
    const response = await apiClient.patch<ForumMessage>(`/forum-message/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer un message
   * DELETE /api/forum-message/:id
   */
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/forum-message/${id}`);
  },

  /**
   * Helper: Récupérer les messages d'un topic spécifique
   * Note: Si le backend ne fournit pas cet endpoint, on filtrera côté client
   */
  findByTopic: async (topicId: number): Promise<ForumMessage[]> => {
    // Si le backend a un endpoint spécifique pour ça, utilisez-le
    // Sinon, on peut filtrer après avoir récupéré tous les messages
    const allMessages = await forumMessagesApi.findAll();
    return allMessages.filter(msg => msg.topic?.topic_id === topicId);
  },
};

export default forumMessagesApi;
