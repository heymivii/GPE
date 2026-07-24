import { useQuery } from '@tanstack/react-query';
import { getBuddies, type Buddy } from '../../../api/buddies';

export function useBuddies(
  procedureId: number | undefined,
  countryId: number | undefined,
) {
  return useQuery<Buddy[]>({
    queryKey: ['buddies', procedureId, countryId],
    queryFn: () => getBuddies(procedureId!, countryId!),
    enabled: !!procedureId && !!countryId,
    staleTime: 5 * 60 * 1000,
  });
}
