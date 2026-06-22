import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistApi } from '../../../api/checklist';
import type { UpdateChecklistDto } from '../../../api/checklist';

// ✅ Types pour les deadlines
export interface StepDeadline {
  date: Date | null;
  isUrgent: boolean;   // < 14 jours restants
  isLate: boolean;     // deadline dépassée
  daysLeft: number | null;
}

// ✅ Type pour le filtre onlyFor dans countries-data.json
export interface StepOnlyFor {
  travelType?: string[];
  objective?: string[];
}

// ✅ Calcul de la deadline d'une étape depuis la date de départ
export const getStepDeadline = (
  daysBeforeDeparture: number | undefined,
  departureDate: string | Date | undefined | null
): StepDeadline => {
  if (daysBeforeDeparture == null || !departureDate) {
    return { date: null, isUrgent: false, isLate: false, daysLeft: null };
  }

  const departure = new Date(departureDate);
  const deadline = new Date(departure);
  deadline.setDate(deadline.getDate() - daysBeforeDeparture);

  const now = new Date();
  const daysLeft = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    date: deadline,
    isUrgent: daysLeft <= 14 && daysLeft > 0,
    isLate: daysLeft <= 0,
    daysLeft,
  };
};

// ✅ Filtrage des étapes selon le profil du projet
export const filterStepsForProject = <T extends {
  onlyFor?: StepOnlyFor | null;
}>(
  steps: T[],
  project: {
    travelType?: string | null;
    objective?: string | null;
  }
): T[] => {
  return steps.filter((step) => {
    // Pas de filtre → étape universelle, tout le monde la voit
    if (!step.onlyFor) return true;

    // Filtre par type de voyage
    if (
      step.onlyFor.travelType &&
      step.onlyFor.travelType.length > 0 &&
      !step.onlyFor.travelType.includes(project.travelType ?? '')
    ) {
      return false;
    }

    // Filtre par objectif
    if (
      step.onlyFor.objective &&
      step.onlyFor.objective.length > 0 &&
      !step.onlyFor.objective.includes(project.objective ?? '')
    ) {
      return false;
    }

    return true;
  });
};

// ✅ Hook principal — inchangé dans son interface, enrichi en interne
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

  const updateFactsMutation = useMutation({
    mutationFn: ({ trackingId, completedFacts }: { trackingId: number; completedFacts: number[] }) =>
      checklistApi.updateCompletedFacts(trackingId, completedFacts),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['checklist-progress', projectId],
      });
    },
  });

  return {
    progress,
    isLoading,
    updateStep: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateFacts: updateFactsMutation.mutateAsync,
    isUpdatingFacts: updateFactsMutation.isPending,
  };
}
