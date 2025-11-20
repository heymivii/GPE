import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { forumTopicsApi } from '../api/forum-topics';
import { forumMessagesApi } from '../api/forum-messages';
import type {
  ForumTopic,
  ForumMessage,
  CreateForumTopicDto,
  UpdateForumTopicDto,
  CreateForumMessageDto,
  UpdateForumMessageDto,
  ForumTopicWithMessages,
} from '../types/forum';

// ==================== QUERY KEYS ====================

export const forumKeys = {
  all: ['forum'] as const,
  topics: () => [...forumKeys.all, 'topics'] as const,
  topic: (id: number) => [...forumKeys.topics(), id] as const,
  messages: () => [...forumKeys.all, 'messages'] as const,
  message: (id: number) => [...forumKeys.messages(), id] as const,
  messagesByTopic: (topicId: number) => [...forumKeys.messages(), 'topic', topicId] as const,
};

// ==================== TOPICS HOOKS ====================

/**
 * Hook pour récupérer tous les topics
 */
export function useForumTopics(): UseQueryResult<ForumTopic[], Error> {
  return useQuery({
    queryKey: forumKeys.topics(),
    queryFn: () => forumTopicsApi.findAll(),
  });
}

/**
 * Hook pour récupérer un topic spécifique avec ses messages
 */
export function useForumTopic(id: number): UseQueryResult<ForumTopicWithMessages, Error> {
  return useQuery({
    queryKey: forumKeys.topic(id),
    queryFn: () => forumTopicsApi.findOne(id),
    enabled: !!id && id > 0,
  });
}

/**
 * Hook pour créer un nouveau topic
 */
export function useCreateForumTopic(): UseMutationResult<ForumTopic, Error, CreateForumTopicDto> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateForumTopicDto) => forumTopicsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
    },
  });
}

/**
 * Hook pour mettre à jour un topic
 */
export function useUpdateForumTopic(): UseMutationResult<
  ForumTopic,
  Error,
  { id: number; data: UpdateForumTopicDto }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateForumTopicDto }) =>
      forumTopicsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topic(variables.id) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
    },
  });
}

/**
 * Hook pour supprimer un topic
 */
export function useDeleteForumTopic(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => forumTopicsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
    },
  });
}

// ==================== MESSAGES HOOKS ====================

/**
 * Hook pour récupérer tous les messages
 */
export function useForumMessages(): UseQueryResult<ForumMessage[], Error> {
  return useQuery({
    queryKey: forumKeys.messages(),
    queryFn: () => forumMessagesApi.findAll(),
  });
}

/**
 * Hook pour récupérer un message spécifique
 */
export function useForumMessage(id: number): UseQueryResult<ForumMessage, Error> {
  return useQuery({
    queryKey: forumKeys.message(id),
    queryFn: () => forumMessagesApi.findOne(id),
    enabled: !!id && id > 0,
  });
}

/**
 * Hook pour récupérer les messages d'un topic spécifique
 */
export function useForumMessagesByTopic(topicId: number): UseQueryResult<ForumMessage[], Error> {
  return useQuery({
    queryKey: forumKeys.messagesByTopic(topicId),
    queryFn: () => forumMessagesApi.findByTopic(topicId),
    enabled: !!topicId && topicId > 0,
  });
}

/**
 * Hook pour créer un nouveau message (réponse)
 */
export function useCreateForumMessage(): UseMutationResult<ForumMessage, Error, CreateForumMessageDto> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateForumMessageDto) => forumMessagesApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.messagesByTopic(variables.idTopic) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topic(variables.idTopic) });
      queryClient.invalidateQueries({ queryKey: forumKeys.messages() });
    },
  });
}

/**
 * Hook pour mettre à jour un message
 */
export function useUpdateForumMessage(): UseMutationResult<
  ForumMessage,
  Error,
  { id: number; data: UpdateForumMessageDto; topicId?: number }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateForumMessageDto; topicId?: number }) =>
      forumMessagesApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalider le message lui-même
      queryClient.invalidateQueries({ queryKey: forumKeys.message(variables.id) });
      
      // Invalider tous les messages
      queryClient.invalidateQueries({ queryKey: forumKeys.messages() });
      
      // Invalider le topic parent si fourni
      if (variables.topicId) {
        queryClient.invalidateQueries({ queryKey: forumKeys.topic(variables.topicId) });
        queryClient.invalidateQueries({ queryKey: forumKeys.messagesByTopic(variables.topicId) });
      }
    },
  });
}

/**
 * Hook pour supprimer un message
 */
export function useDeleteForumMessage(): UseMutationResult<void, Error, { id: number; topicId?: number }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; topicId?: number }) => forumMessagesApi.remove(id),
    onSuccess: (_, variables) => {
      // Invalider tous les messages
      queryClient.invalidateQueries({ queryKey: forumKeys.messages() });
      
      // Invalider le topic parent si fourni
      if (variables.topicId) {
        queryClient.invalidateQueries({ queryKey: forumKeys.topic(variables.topicId) });
        queryClient.invalidateQueries({ queryKey: forumKeys.messagesByTopic(variables.topicId) });
      }
    },
  });
}
