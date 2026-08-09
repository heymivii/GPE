export const TopicCategoryValues = {
  QUESTION: 'question',
  TESTIMONY: 'testimony',
  ADVICE: 'advice',
  DISCUSSION: 'discussion',
  ANNOUNCEMENT: 'announcement',
  OTHER: 'other',
} as const;

export type TopicCategory = typeof TopicCategoryValues[keyof typeof TopicCategoryValues];

export interface ForumTopic {
  topic_id: number;
  title: string;
  content: string;
  category?: TopicCategory;
  created_at: string;
  views_count?: number;
  is_pinned?: boolean;
  is_locked?: boolean;
  user?: {
    idUser: number;
    fullName: string;
    email: string;
  };
  country?: {
    idCountry: number;
    countryName: string;
    isoCode?: string;
    flagUrl?: string;
  };
  // F2 — suivi de discussions
  followersCount?: number;
  isFollowedByMe?: boolean;
  messages?: ForumMessage[];
}


export interface ForumMessage {
  message_id: number;
  content: string;
  sent_at: string;
  topic?: ForumTopic;
  user?: {
    idUser: number;
    fullName: string;
    email: string;
    roles?: string;
  };
}


export interface ForumTopicWithMessages extends ForumTopic {
  messages: ForumMessage[];
}

export interface CreateForumTopicDto {
  title: string;
  content: string;
  category?: TopicCategory;
  // NB: pas de userId — l'auteur est dérivé du token JWT côté serveur.
  countryId?: number;
}

export interface UpdateForumTopicDto {
  title?: string;
  category?: TopicCategory;
  content?: string; 
}


export interface CreateForumMessageDto {
  content: string;
  topicId: number;
  // NB: pas de userId — l'auteur vient du token JWT côté serveur.
}


export interface UpdateForumMessageDto {
  content?: string;
}


export interface UIForumTopic extends ForumTopic {
  viewCount?: number;
  messageCount?: number;
  voteCount?: number;
}

export interface UIForumMessage extends ForumMessage {
  voteCount?: number;
  isAccepted?: boolean;
}


export const ReportReasonValues = {
  SPAM: 'spam',
  HARASSMENT: 'harassment',
  HATE_SPEECH: 'hate_speech',
  INAPPROPRIATE: 'inappropriate',
  MISINFORMATION: 'misinformation',
  OTHER: 'other',
} as const;

export type ReportReason = typeof ReportReasonValues[keyof typeof ReportReasonValues];

export type ReportStatus = 'pending' | 'resolved' | 'rejected';

export interface ForumReport {
  idReport: number;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  moderatorNote?: string;
  createdAt: string;
  resolvedAt?: string;
  reporter?: { idUser: number; fullName: string };
  message?: ForumMessage;
  topic?: ForumTopic;
  moderator?: { idUser: number; fullName: string };
}

export interface CreateReportDto {
  // NB: pas de reporterId — le rapporteur vient du token JWT côté serveur.
  messageId?: number;
  topicId?: number;
  reason: ReportReason;
  details?: string;
}

export interface ResolveReportDto {
  status: 'resolved' | 'rejected';
  moderatorNote?: string;
}

export interface ReportStats {
  pending: number;
  resolved: number;
  rejected: number;
  total: number;
}
