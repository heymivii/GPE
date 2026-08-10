import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { privateMessagesApi } from '../api/private-messages';

export const pmKeys = {
  all: ['private-messages'] as const,
  conversations: () => [...pmKeys.all, 'conversations'] as const,
  thread: (userId: number) => [...pmKeys.all, 'thread', userId] as const,
  unread: () => [...pmKeys.all, 'unread'] as const,
};

export function useConversations(enabled = true) {
  return useQuery({
    queryKey: pmKeys.conversations(),
    queryFn: () => privateMessagesApi.conversations(),
    enabled,
  });
}

export function useThread(userId: number, enabled = true) {
  return useQuery({
    queryKey: pmKeys.thread(userId),
    queryFn: () => privateMessagesApi.thread(userId),
    enabled: enabled && !!userId && userId > 0,
  });
}

/** Compteur de non-lus pour la pastille de navigation. */
export function useUnreadMessages(enabled = true) {
  return useQuery({
    queryKey: pmKeys.unread(),
    queryFn: () => privateMessagesApi.unreadCount(),
    enabled,
    refetchInterval: 30_000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recipientId, content }: { recipientId: number; content: string }) =>
      privateMessagesApi.send(recipientId, content),
    onSuccess: (_d, variables) => {
      queryClient.invalidateQueries({ queryKey: pmKeys.thread(variables.recipientId) });
      queryClient.invalidateQueries({ queryKey: pmKeys.conversations() });
    },
  });
}
