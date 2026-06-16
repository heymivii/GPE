import apiClient from '../lib/api';
import type {
  ForumMessage,
  CreateForumMessageDto,
  UpdateForumMessageDto,
  ForumReport,
  CreateReportDto,
  ResolveReportDto,
  ReportStats,
} from '../types/forum';

function mapTopic(raw: any) {
  if (!raw) return undefined;
  return {
    ...raw,
    topic_id: raw.topic_id ?? raw.idForumTopic,
    created_at: raw.created_at ?? raw.createdAt,
    is_pinned: raw.is_pinned ?? raw.isPinned ?? false,
    is_locked: raw.is_locked ?? raw.isLocked ?? false,
    views_count: raw.views_count ?? raw.viewsCount ?? 0,
  };
}

function mapMessage(raw: any): ForumMessage {
  return {
    ...raw,
    message_id: raw.message_id ?? raw.idForumMessage,
    sent_at: raw.sent_at ?? raw.sentAt,
    topic: mapTopic(raw.topic),
    user: raw.user ? {
      idUser: raw.user.idUser ?? raw.user.id,
      fullName: raw.user.fullName ?? (raw.user.firstName ? `${raw.user.firstName} ${raw.user.lastName || ''}`.trim() : 'Anonymous'),
      email: raw.user.email,
      roles: raw.user.roles ?? raw.user.role,
    } : undefined,
  };
}

function mapReport(raw: any): ForumReport {
  return {
    ...raw,
    reporter: raw.reporter ? {
      idUser: raw.reporter.idUser ?? raw.reporter.id,
      fullName: raw.reporter.fullName ?? (raw.reporter.firstName ? `${raw.reporter.firstName} ${raw.reporter.lastName || ''}`.trim() : 'Anonymous'),
    } : undefined,
    moderator: raw.moderator ? {
      idUser: raw.moderator.idUser ?? raw.moderator.id,
      fullName: raw.moderator.fullName ?? (raw.moderator.firstName ? `${raw.moderator.firstName} ${raw.moderator.lastName || ''}`.trim() : 'Anonymous'),
    } : undefined,
    message: raw.message ? mapMessage(raw.message) : undefined,
    topic: raw.topic ? mapTopic(raw.topic) : undefined,
  };
}

export const forumMessagesApi = {
  findAll: async (): Promise<ForumMessage[]> => {
    const response = await apiClient.get<any[]>('/forum-message');
    return response.data.map(mapMessage);
  },

  findOne: async (id: number): Promise<ForumMessage> => {
    const response = await apiClient.get<any>(`/forum-message/${id}`);
    return mapMessage(response.data);
  },

  create: async (data: CreateForumMessageDto): Promise<ForumMessage> => {
    const response = await apiClient.post<any>('/forum-message', data);
    return mapMessage(response.data);
  },

  update: async (id: number, data: UpdateForumMessageDto): Promise<ForumMessage> => {
    const response = await apiClient.patch<any>(`/forum-message/${id}`, data);
    return mapMessage(response.data);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/forum-message/${id}`);
  },

  findByTopic: async (topicId: number): Promise<ForumMessage[]> => {
    const response = await apiClient.get<any[]>(`/forum-message?topicId=${topicId}`);
    return response.data.map(mapMessage);
  },

  moderatorRemove: async (id: number): Promise<void> => {
    await apiClient.delete(`/forum-message/moderate/${id}`);
  },

  report: async (data: CreateReportDto): Promise<ForumReport> => {
    const response = await apiClient.post<any>('/forum-message/report', data);
    return mapReport(response.data);
  },

  getReports: async (status?: string): Promise<ForumReport[]> => {
    const url = status ? `/forum-message/reports/all?status=${status}` : '/forum-message/reports/all';
    const response = await apiClient.get<any[]>(url);
    return response.data.map(mapReport);
  },

  getReportStats: async (): Promise<ReportStats> => {
    const response = await apiClient.get<ReportStats>('/forum-message/reports/stats');
    return response.data;
  },

  resolveReport: async (id: number, data: ResolveReportDto): Promise<ForumReport> => {
    const payload = {
      action: data.status,
      moderatorNote: data.moderatorNote,
    };
    const response = await apiClient.patch<any>(`/forum-message/reports/${id}/resolve`, payload);
    return mapReport(response.data);
  },
};

export default forumMessagesApi;
