import apiClient from '../lib/api';

export type WordSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ForbiddenWord {
  idForbiddenWord: number;
  word: string;
  severity: WordSeverity;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FlaggedUser {
  idUser: number;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  warningCount: number;
}

export interface UserWarning {
  idUserWarning: number;
  reason: string;
  createdAt: string;
  forbiddenWord?: { idForbiddenWord: number; word: string; severity: WordSeverity } | null;
  message?: { idForumMessage: number } | null;
}

export interface CreateForbiddenWordInput {
  word: string;
  severity?: WordSeverity;
  isActive?: boolean;
}

export const forumModerationApi = {
  listWords: async (): Promise<ForbiddenWord[]> =>
    (await apiClient.get<ForbiddenWord[]>('/forum-moderation/words')).data,

  createWord: async (data: CreateForbiddenWordInput): Promise<ForbiddenWord> =>
    (await apiClient.post<ForbiddenWord>('/forum-moderation/words', data)).data,

  updateWord: async (
    id: number,
    data: Partial<CreateForbiddenWordInput>,
  ): Promise<ForbiddenWord> =>
    (await apiClient.patch<ForbiddenWord>(`/forum-moderation/words/${id}`, data)).data,

  removeWord: async (id: number): Promise<void> => {
    await apiClient.delete(`/forum-moderation/words/${id}`);
  },

  flaggedUsers: async (threshold?: number): Promise<FlaggedUser[]> =>
    (
      await apiClient.get<FlaggedUser[]>(
        `/forum-moderation/flagged-users${threshold ? `?threshold=${threshold}` : ''}`,
      )
    ).data,

  userWarnings: async (userId: number): Promise<UserWarning[]> =>
    (await apiClient.get<UserWarning[]>(`/forum-moderation/users/${userId}/warnings`)).data,
};

export default forumModerationApi;
