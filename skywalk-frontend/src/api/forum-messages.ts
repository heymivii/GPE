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

  // ─── Moderation / Report endpoints ─────────────────────────────────

  /** Moderator: delete any message */
  moderatorRemove: async (id: number): Promise<void> => {
    await apiClient.delete(`/forum-message/moderate/${id}`);
  },

  /** Any authenticated user: report a message or topic */
  report: async (data: CreateReportDto): Promise<ForumReport> => {
    const response = await apiClient.post<ForumReport>('/forum-message/report', data);
    return response.data;
  },

  /** Admin/Moderator: list all reports */
  getReports: async (status?: string): Promise<ForumReport[]> => {
    const url = status ? `/forum-message/reports/all?status=${status}` : '/forum-message/reports/all';
    const response = await apiClient.get<ForumReport[]>(url);
    return response.data;
  },

  /** Admin/Moderator: get report stats */
  getReportStats: async (): Promise<ReportStats> => {
    const response = await apiClient.get<ReportStats>('/forum-message/reports/stats');
    return response.data;
  },

  /** Admin/Moderator: resolve or reject a report */
  resolveReport: async (id: number, data: ResolveReportDto): Promise<ForumReport> => {
    const response = await apiClient.patch<ForumReport>(`/forum-message/reports/${id}/resolve`, data);
    return response.data;
  },
};

export default forumMessagesApi;
