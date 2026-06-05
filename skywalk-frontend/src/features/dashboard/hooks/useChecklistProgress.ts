import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistApi } from '../../../api/checklist';
import type { UpdateChecklistDto } from '../../../api/checklist';

export function useChecklistProgress(projectId: number) {
  const queryClient = useQueryClient();

  const { data: progress = [], isLoading } = useQuery({
    queryKey: ['checklist-progress', projectId],
    queryFn: () => checklistApi.getProgress(projectId),
    enabled: !!projectId,
  });

  const updateMutation = useMutation({
    mutationFn: (dto: UpdateChecklistDto) =>
      checklistApi.updateProgress(dto.trackingId, dto.status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['checklist-progress', projectId],
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    progress,
    isLoading,
    updateStep: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
