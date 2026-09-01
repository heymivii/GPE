import { useQuery } from '@tanstack/react-query';
import { govLinksApi, type GovLink } from './govLinks';

// Map the various frontend category keys (checklist + services) to a canonical gov category.
// Returns null when no official gov link is expected (keeps callers a no-op).
export function toGovCategory(key?: string): string | null {
  if (!key) return null;
  const k = key.toLowerCase();
  const map: Record<string, string> = {
    visa: 'visa',
    demarches: 'demarches',
    'demarches-admin': 'demarches',
    administrative: 'demarches',
    administratif: 'demarches',
    'pre-departure': 'demarches',
    logement: 'logement',
    housing: 'logement',
    sante: 'sante',
    health: 'sante',
  };
  return map[k] ?? null;
}

// Returns the single active official link for (country, category), or undefined.
export function useGovLink(
  countryCode?: string,
  categoryKey?: string,
): { link?: GovLink; isLoading: boolean } {
  const category = toGovCategory(categoryKey);
  const enabled = !!countryCode && !!category;
  const { data, isLoading } = useQuery({
    queryKey: ['gov-link', countryCode, category],
    queryFn: () =>
      govLinksApi.list({ country: countryCode!, category: category!, status: 'active' }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  return { link: data?.[0], isLoading: enabled && isLoading };
}
