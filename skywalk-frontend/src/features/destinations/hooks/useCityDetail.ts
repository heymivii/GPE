import { useQuery, useQueries } from '@tanstack/react-query';
import { cityApi } from '../../../api/city';
import { cityIndicesApi } from '../../../api/cityIndices';
import { costOfLivingApi } from '../../../api/costOfLiving';

/**
 * Agrège les quatre sources déjà exposées par l'API pour une ville :
 * identité (/city/:id), coût de la vie, indices de qualité de vie et
 * indicateurs immobiliers. Chaque bloc est indépendant : une source absente
 * (Numbeo ne publie pas tout pour toutes les villes) masque sa section sans
 * empêcher l'affichage des autres.
 */
export function useCityDetail(cityId: number) {
  const cityQuery = useQuery({
    queryKey: ['city', cityId],
    queryFn: () => cityApi.getById(cityId),
    enabled: Number.isFinite(cityId) && cityId > 0,
    staleTime: 5 * 60 * 1000,
  });

  const city = cityQuery.data;

  const [qualityOfLife, propertyInvestment] = useQueries({
    queries: [
      {
        queryKey: ['city-quality-of-life', cityId],
        queryFn: () => cityIndicesApi.getQualityOfLife(cityId),
        enabled: !!city,
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['city-property-investment', cityId],
        queryFn: () => cityIndicesApi.getPropertyInvestment(cityId),
        enabled: !!city,
        staleTime: 5 * 60 * 1000,
      },
    ],
  });

  const costOfLiving = useQuery({
    // Le coût de la vie s'interroge par NOM de ville + pays, pas par id.
    queryKey: ['city-cost-of-living', city?.name, city?.country?.countryName],
    queryFn: () =>
      costOfLivingApi.getCostOfLiving(city!.name, city!.country!.countryName),
    enabled: !!city?.name && !!city?.country?.countryName,
    staleTime: 5 * 60 * 1000,
    retry: false, // pas de données pour cette ville : on affiche l'état vide
  });

  return {
    city,
    isLoading: cityQuery.isLoading,
    isError: cityQuery.isError,
    costOfLiving: costOfLiving.data,
    isCostOfLivingLoading: costOfLiving.isLoading,
    qualityOfLife: qualityOfLife.data,
    propertyInvestment: propertyInvestment.data,
  };
}
