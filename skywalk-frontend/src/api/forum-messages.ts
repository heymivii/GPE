import apiClient from '../lib/api';
import type {
  ForumMessage,
  CreateForumMessageDto,
  UpdateForumMessageDto,
} from '../types/forum';


export const forumMessagesApi = {

  findAll: async (): Promise<ForumMessage[]> => {
    const response = await apiClient.get<ForumMessage[]>('/forum-message');
    return response.data;
  },


  findOne: async (id: number): Promise<ForumMessage> => {
    const response = await apiClient.get<ForumMessage>(`/forum-message/${id}`);
    return response.data;
  },


  create: async (data: CreateForumMessageDto): Promise<ForumMessage> => {
    const response = await apiClient.post<ForumMessage>('/forum-message', data);
    return response.data;
  },


  update: async (id: number, data: UpdateForumMessageDto): Promise<ForumMessage> => {
    const response = await apiClient.patch<ForumMessage>(`/forum-message/${id}`, data);
    return response.data;
  },

 
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/forum-message/${id}`);
  },

  findByTopic: async (topicId: number): Promise<ForumMessage[]> => {
    const allMessages = await forumMessagesApi.findAll();
    return allMessages.filter(msg => msg.topic?.topic_id === topicId);
  },
};

export default forumMessagesApi;
