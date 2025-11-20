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
    country_id: number;
    name: string;
  };
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
  };
}


export interface ForumTopicWithMessages extends ForumTopic {
  messages: ForumMessage[];
}

export interface CreateForumTopicDto {
  title: string;
  content: string; 
  category?: TopicCategory;
  idUser: number;
  idCountry?: number;
}

export interface UpdateForumTopicDto {
  title?: string;
  category?: TopicCategory;
  content?: string; 
}


export interface CreateForumMessageDto {
  content: string;
  idTopic: number;
  idUser: number;
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
