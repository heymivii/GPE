import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ratingsApi } from '../api/ratings';
import { forumKeys } from './useForum';

export const ratingKeys = {
  all: ['ratings'] as const,
  myTopic: (topicId: number) => [...ratingKeys.all, 'my-topic', topicId] as const,
};

/** Les notes de l'utilisateur courant pour les messages d'un topic. */
export function useMyTopicRatings(topicId: number, enabled = true) {
  return useQuery({
    queryKey: ratingKeys.myTopic(topicId),
    queryFn: () => ratingsApi.myTopicRatings(topicId),
    enabled: enabled && !!topicId && topicId > 0,
  });
}

export function useRateMessage(topicId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, stars }: { messageId: number; stars: number }) =>
      ratingsApi.rate(messageId, stars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.myTopic(topicId) });
      queryClient.invalidateQueries({ queryKey: ['experts'] });
      queryClient.invalidateQueries({ queryKey: forumKeys.topic(topicId) });
    },
  });
}

export function useUnrateMessage(topicId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: number) => ratingsApi.unrate(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.myTopic(topicId) });
      queryClient.invalidateQueries({ queryKey: ['experts'] });
    },
  });
}
