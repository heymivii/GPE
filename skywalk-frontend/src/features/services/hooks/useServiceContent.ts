import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { expatriationProjectApi } from '../../../api/expatriation-project';
import { destinationsApi } from '../../../api/destinations';
import type { ServiceConfig, ServiceGuide } from '../../../data/services-config';
import { getCountryContent } from '../../../data/services-content-by-country';
import type { CityDestination } from '../../destinations/types';

interface UseServiceContentParams {
  service: ServiceConfig;
  category: string;
}

export function useServiceContent({ service, category }: UseServiceContentParams) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    const countryParam = searchParams.get('country');
    if (countryParam) {
      setSelectedCountry(countryParam.toLowerCase());
    }
  }, [searchParams]);

  const { data: projects } = useQuery({
    queryKey: ['expatriation-projects'],
    queryFn: expatriationProjectApi.getAll,
    enabled: isAuthenticated,
  });

  const { data: countryData } = useQuery({
    queryKey: ['country-details', selectedCountry],
    queryFn: () => destinationsApi.getBySlug(selectedCountry!),
    enabled: !!selectedCountry && isAuthenticated,
  });

  const availableCities = useMemo((): CityDestination[] => {
    if (!countryData || !countryData.cities) return [];
    return [...countryData.cities].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.name.localeCompare(b.name);
    });
  }, [countryData]);

  useEffect(() => {
    if (availableCities.length > 0) {
      const isSelectedCityValid = availableCities.some((c) => c.slug === selectedCity);
      if (!selectedCity || !isSelectedCityValid) {
        const capital = availableCities.find((c) => c.isCapital);
        setSelectedCity(capital ? capital.slug : availableCities[0].slug);
      }
    } else if (selectedCountry === null) {
      setSelectedCity(null);
    }
  }, [availableCities, selectedCity, selectedCountry]);

  const enrichedContent = useMemo(() => {
    if (!selectedCountry) {
      return {
        ...service,
        hasCountryContent: false,
        countryName: null,
      };
    }

    const countryContent = getCountryContent(selectedCountry, category);

    if (!countryContent) {
      return {
        ...service,
        hasCountryContent: false,
        countryName: selectedCountry,
      };
    }

    const combinedGuides: ServiceGuide[] = [
      ...service.guides,
      ...(countryContent.specificGuides || []).map(g => ({
        title: t(g.title),
        steps: g.steps.map(s => t(s)),
      })),
    ];

    const combinedTips = [
      ...service.tips,
      ...(countryContent.tips || []).map(tip => t(tip)),
    ];

    const stats = countryContent.stats
      ? countryContent.stats.map(s => ({ label: t(s.label), value: s.value }))
      : service.stats;

    return {
      ...service,
      guides: combinedGuides,
      tips: combinedTips,
      stats,
      hasCountryContent: true,
      countryName: selectedCountry,
      countrySpecific: countryContent,
    };
  }, [service, selectedCountry, category, t]);

  const displayMode = useMemo(() => {
    if (!isAuthenticated) {
      return 'generic';
    }
    if (projects && projects.length > 0) {
      return 'with-project';
    }
    return 'without-project';
  }, [isAuthenticated, projects]);

  return {
    content: enrichedContent,
    selectedCountry,
    setSelectedCountry,
    selectedCity,
    setSelectedCity,
    availableCities,
    displayMode,
    hasProject: projects && projects.length > 0,
    isAuthenticated,
  };
}
