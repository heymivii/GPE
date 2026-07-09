import apiClient from '../lib/api';

export type UserReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'impersonation'
  | 'inappropriate'
  | 'other';

export type UserReportStatus = 'pending' | 'resolved' | 'rejected';

interface ReportUser {
  idUser: number;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UserReport {
  idUserReport: number;
  reason: UserReportReason;
  details?: string | null;
  status: UserReportStatus;
  moderatorNote?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  reporter?: ReportUser;
  reportedUser?: ReportUser;
  moderator?: ReportUser | null;
}

export interface CreateUserReportInput {
  reportedUserId: number;
  reason: UserReportReason;
  details?: string;
}

export interface UserReportStats {
  pending: number;
  resolved: number;
  rejected: number;
  total: number;
}

export const userReportApi = {
  create: async (data: CreateUserReportInput): Promise<UserReport> =>
    (await apiClient.post<UserReport>('/user-report', data)).data,

  list: async (status?: string): Promise<UserReport[]> =>
    (
      await apiClient.get<UserReport[]>(
        `/user-report${status ? `?status=${status}` : ''}`,
      )
    ).data,

  stats: async (): Promise<UserReportStats> =>
    (await apiClient.get<UserReportStats>('/user-report/stats')).data,

  resolve: async (
    id: number,
    action: 'resolved' | 'rejected',
    moderatorNote?: string,
  ): Promise<UserReport> =>
    (
      await apiClient.patch<UserReport>(`/user-report/${id}/resolve`, {
        action,
        moderatorNote,
      })
    ).data,
};

export default userReportApi;
