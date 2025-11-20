import apiClient from '../lib/api';
import type {
  ForumTopic,
  CreateForumTopicDto,
  UpdateForumTopicDto,
  ForumTopicWithMessages,
} from '../types/forum';

/**
 * API client pour gérer les topics du forum
 * Correspond au ForumTopicController du backend
 */
export const forumTopicsApi = {
  /**
   * Récupérer tous les topics du forum
   * GET /api/forum-topic
   */
  findAll: async (): Promise<ForumTopic[]> => {
    const response = await apiClient.get<ForumTopic[]>('/forum-topic');
    return response.data;
  },

  /**
   * Récupérer un topic spécifique par son ID
   * GET /api/forum-topic/:id
   */
  findOne: async (id: number): Promise<ForumTopicWithMessages> => {
    const response = await apiClient.get<ForumTopicWithMessages>(`/forum-topic/${id}`);
    return response.data;
  },

  /**
   * Créer un nouveau topic
   * POST /api/forum-topic
   */
  create: async (data: CreateForumTopicDto): Promise<ForumTopic> => {
    const response = await apiClient.post<ForumTopic>('/forum-topic', data);
    return response.data;
  },

  /**
   * Mettre à jour un topic existant
   * PATCH /api/forum-topic/:id
   */
  update: async (id: number, data: UpdateForumTopicDto): Promise<ForumTopic> => {
    const response = await apiClient.patch<ForumTopic>(`/forum-topic/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer un topic
   * DELETE /api/forum-topic/:id
   */
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/forum-topic/${id}`);
  },
};

export default forumTopicsApi;
