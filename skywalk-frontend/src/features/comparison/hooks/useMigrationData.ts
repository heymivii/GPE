import { useQuery } from '@tanstack/react-query';
import { migrationApi } from '../../../api/migration';
import type { CountryMigrationData } from '../../../api/migration';
import { ISO2_TO_ISO3 } from '../../../data/supportedCountries';

export function useMigrationData() {
  const { data, isLoading, error } = useQuery<CountryMigrationData[]>({
    queryKey: ['oecd-migration'],
    queryFn: migrationApi.getAll,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const getByIso2 = (iso2?: string): CountryMigrationData | undefined => {
    if (!iso2 || !data) return undefined;
    const iso3 = ISO2_TO_ISO3[iso2.toUpperCase()];
    return data.find(d => d.countryCode === iso3);
  };

  return { migrationData: data, getByIso2, isLoading, error };
}
