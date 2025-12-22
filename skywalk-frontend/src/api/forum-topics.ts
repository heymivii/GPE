import apiClient from '../lib/api';
import type {
  ForumTopic,
  CreateForumTopicDto,
  UpdateForumTopicDto,
  ForumTopicWithMessages,
} from '../types/forum';

export const forumTopicsApi = {
  findAll: async (): Promise<ForumTopic[]> => {
    const response = await apiClient.get<ForumTopic[]>('/forum-topic');
    return response.data;
  },

  findOne: async (id: number): Promise<ForumTopicWithMessages> => {
    const response = await apiClient.get<ForumTopicWithMessages>(`/forum-topic/${id}`);
    return response.data;
  },

  create: async (data: CreateForumTopicDto): Promise<ForumTopic> => {
    const response = await apiClient.post<ForumTopic>('/forum-topic', data);
    return response.data;
  },

  update: async (id: number, data: UpdateForumTopicDto): Promise<ForumTopic> => {
    const response = await apiClient.patch<ForumTopic>(`/forum-topic/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/forum-topic/${id}`);
  },
};

export default forumTopicsApi;
