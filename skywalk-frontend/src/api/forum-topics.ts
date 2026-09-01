import apiClient from '../lib/api';
import type {
  ForumTopic,
  CreateForumTopicDto,
  UpdateForumTopicDto,
  ForumTopicWithMessages,
} from '../types/forum';

// Normalise la réponse backend (camelCase) vers le type frontend (snake_case)
function mapTopic(raw: any): ForumTopic {
  return {
    ...raw,
    topic_id: raw.topic_id ?? raw.idForumTopic,
    created_at: raw.created_at ?? raw.createdAt,
    is_pinned: raw.is_pinned ?? raw.isPinned ?? false,
    is_locked: raw.is_locked ?? raw.isLocked ?? false,
    views_count: raw.views_count ?? raw.viewsCount ?? 0,
    followersCount: raw.followersCount ?? 0,
    isFollowedByMe: raw.isFollowedByMe ?? false,
    messages: Array.isArray(raw.messages) ? raw.messages.map(mapMessage) : undefined,
  };
}

function mapMessage(raw: any) {
  if (!raw) return undefined;
  return {
    ...raw,
    message_id: raw.message_id ?? raw.idForumMessage,
    sent_at: raw.sent_at ?? raw.sentAt,
    user: raw.user ? {
      idUser: raw.user.idUser ?? raw.user.id,
      fullName: raw.user.fullName ?? (raw.user.firstName ? `${raw.user.firstName} ${raw.user.lastName || ''}`.trim() : 'Anonymous'),
      email: raw.user.email,
      roles: raw.user.roles ?? raw.user.role,
      // F1 — statut expert (pour l'ExpertBadge à côté de l'auteur)
      isExpert: raw.user.isExpert ?? false,
      expertTitle: raw.user.expertTitle ?? null,
      expertVerifiedAt: raw.user.expertVerifiedAt ?? null,
    } : undefined,
  };
}

export const forumTopicsApi = {
  findAll: async (): Promise<ForumTopic[]> => {
    const response = await apiClient.get<any[]>('/forum-topic');
    return response.data.map(mapTopic);
  },

  findOne: async (id: number): Promise<ForumTopicWithMessages> => {
    const response = await apiClient.get<any>(`/forum-topic/${id}`);
    return mapTopic(response.data) as ForumTopicWithMessages;
  },

  create: async (data: CreateForumTopicDto): Promise<ForumTopic> => {
    const response = await apiClient.post<any>('/forum-topic', data);
    return mapTopic(response.data);
  },

  update: async (id: number, data: UpdateForumTopicDto): Promise<ForumTopic> => {
    const response = await apiClient.patch<any>(`/forum-topic/${id}`, data);
    return mapTopic(response.data);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/forum-topic/${id}`);
  },

  lockTopic: async (id: number): Promise<ForumTopic> => {
    const response = await apiClient.patch<any>(`/forum-topic/${id}/lock`);
    return mapTopic(response.data);
  },

  pinTopic: async (id: number): Promise<ForumTopic> => {
    const response = await apiClient.patch<any>(`/forum-topic/${id}/pin`);
    return mapTopic(response.data);
  },

  moderatorRemove: async (id: number): Promise<void> => {
    await apiClient.delete(`/forum-topic/moderate/${id}`);
  },

  // F2 — suivi de discussions
  getFollowed: async (): Promise<ForumTopic[]> => {
    const response = await apiClient.get<any[]>('/forum-topic/followed');
    return response.data.map(mapTopic);
  },

  follow: async (id: number): Promise<{ following: boolean; followersCount: number }> => {
    const response = await apiClient.post<{ following: boolean; followersCount: number }>(
      `/forum-topic/${id}/follow`,
    );
    return response.data;
  },

  unfollow: async (id: number): Promise<{ following: boolean; followersCount: number }> => {
    const response = await apiClient.delete<{ following: boolean; followersCount: number }>(
      `/forum-topic/${id}/follow`,
    );
    return response.data;
  },
};

export default forumTopicsApi;
