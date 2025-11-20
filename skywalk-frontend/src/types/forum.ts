/**
 * Types pour le forum basés sur l'architecture backend NestJS
 */

// ==================== ENUMS ====================

export const TopicCategoryValues = {
  QUESTION: 'question',
  TESTIMONY: 'testimony',
  ADVICE: 'advice',
  DISCUSSION: 'discussion',
  ANNOUNCEMENT: 'announcement',
  OTHER: 'other',
} as const;

export type TopicCategory = typeof TopicCategoryValues[keyof typeof TopicCategoryValues];

// ==================== ENTITES BACKEND ====================

/**
 * Topic du forum tel que renvoyé par le backend
 */
export interface ForumTopic {
  topic_id: number;
  title: string;
  category?: TopicCategory;
  created_at: string;
  views_count?: number;
  is_pinned?: boolean;
  is_locked?: boolean;
  // Relations - peuvent être incluses ou non selon les queries
  user?: {
    idUser: number;
    fullName: string;
    email: string;
  };
  country?: {
    country_id: number;
    name: string;
  };
  messages?: ForumMessage[]; // Ajouté pour les topics avec messages chargés
}

/**
 * Message du forum tel que renvoyé par le backend
 */
export interface ForumMessage {
  message_id: number;
  content: string;
  sent_at: string;
  // Relations
  topic?: ForumTopic;
  user?: {
    idUser: number;
    fullName: string;
    email: string;
  };
}

/**
 * Topic avec ses messages (pour la page de détail)
 */
export interface ForumTopicWithMessages extends ForumTopic {
  messages: ForumMessage[];
}

// ==================== DTOs ====================

/**
 * DTO pour créer un nouveau topic
 */
export interface CreateForumTopicDto {
  title: string;
  content: string; // Contenu initial du topic (premier message) - OBLIGATOIRE
  category?: TopicCategory;
  idUser: number;
  idCountry?: number;
}

/**
 * DTO pour mettre à jour un topic
 */
export interface UpdateForumTopicDto {
  title?: string;
  category?: TopicCategory;
  content?: string; // Pour modifier le premier message
}

/**
 * DTO pour créer un nouveau message
 */
export interface CreateForumMessageDto {
  content: string;
  idTopic: number;
  idUser: number;
}

/**
 * DTO pour mettre à jour un message
 */
export interface UpdateForumMessageDto {
  content?: string;
}

// ==================== TYPES POUR L'UI (optionnels, mappés depuis le backend) ====================

/**
 * Topic enrichi pour l'affichage dans l'UI
 */
export interface UIForumTopic extends ForumTopic {
  // Compteurs calculés côté front
  viewCount?: number;
  messageCount?: number;
  voteCount?: number;
}

/**
 * Message enrichi pour l'affichage dans l'UI
 */
export interface UIForumMessage extends ForumMessage {
  // Statut UI
  voteCount?: number;
  isAccepted?: boolean;
}
