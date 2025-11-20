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


export const forumKeys = {
  all: ['forum'] as const,
  topics: () => [...forumKeys.all, 'topics'] as const,
  topic: (id: number) => [...forumKeys.topics(), id] as const,
  messages: () => [...forumKeys.all, 'messages'] as const,
  message: (id: number) => [...forumKeys.messages(), id] as const,
  messagesByTopic: (topicId: number) => [...forumKeys.messages(), 'topic', topicId] as const,
};

export function useForumTopics(): UseQueryResult<ForumTopic[], Error> {
  return useQuery({
    queryKey: forumKeys.topics(),
    queryFn: () => forumTopicsApi.findAll(),
  });
}


export function useForumTopic(id: number): UseQueryResult<ForumTopicWithMessages, Error> {
  return useQuery({
    queryKey: forumKeys.topic(id),
    queryFn: () => forumTopicsApi.findOne(id),
    enabled: !!id && id > 0,
  });
}


export function useCreateForumTopic(): UseMutationResult<ForumTopic, Error, CreateForumTopicDto> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateForumTopicDto) => forumTopicsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
    },
  });
}


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


export function useDeleteForumTopic(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => forumTopicsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
    },
  });
}

export function useForumMessages(): UseQueryResult<ForumMessage[], Error> {
  return useQuery({
    queryKey: forumKeys.messages(),
    queryFn: () => forumMessagesApi.findAll(),
  });
}


export function useForumMessage(id: number): UseQueryResult<ForumMessage, Error> {
  return useQuery({
    queryKey: forumKeys.message(id),
    queryFn: () => forumMessagesApi.findOne(id),
    enabled: !!id && id > 0,
  });
}


export function useForumMessagesByTopic(topicId: number): UseQueryResult<ForumMessage[], Error> {
  return useQuery({
    queryKey: forumKeys.messagesByTopic(topicId),
    queryFn: () => forumMessagesApi.findByTopic(topicId),
    enabled: !!topicId && topicId > 0,
  });
}


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
      queryClient.invalidateQueries({ queryKey: forumKeys.message(variables.id) });
      
      queryClient.invalidateQueries({ queryKey: forumKeys.messages() });
      
      if (variables.topicId) {
        queryClient.invalidateQueries({ queryKey: forumKeys.topic(variables.topicId) });
        queryClient.invalidateQueries({ queryKey: forumKeys.messagesByTopic(variables.topicId) });
      }
    },
  });
}


export function useDeleteForumMessage(): UseMutationResult<void, Error, { id: number; topicId?: number }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; topicId?: number }) => forumMessagesApi.remove(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.messages() });
      
      if (variables.topicId) {
        queryClient.invalidateQueries({ queryKey: forumKeys.topic(variables.topicId) });
        queryClient.invalidateQueries({ queryKey: forumKeys.messagesByTopic(variables.topicId) });
      }
    },
  });
}
