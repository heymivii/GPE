import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistApi } from '../../../api/checklist';
import type { UpdateChecklistDto } from '../../../api/checklist';

export function useChecklistProgress(projectId: number) {
  const queryClient = useQueryClient();

  // 📥 Récupérer la progression de la checklist
  const { data: progress = {}, isLoading } = useQuery({
    queryKey: ['checklist-progress', projectId],
    queryFn: () => checklistApi.getProgress(projectId),
    enabled: !!projectId,
  });

  //  Mettre à jour une étape
  const updateMutation = useMutation({
    mutationFn: (dto: UpdateChecklistDto) =>
      checklistApi.updateProgress(projectId, dto),
    onSuccess: () => {
      // Invalider les requêtes pour forcer un refresh
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
