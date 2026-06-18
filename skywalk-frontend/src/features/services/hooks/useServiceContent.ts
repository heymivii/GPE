import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { expatriationProjectApi } from '../../../api/expatriation-project';
import type { ServiceConfig, ServiceGuide } from '../../../data/services-config';
import { getCountryContent } from '../../../data/services-content-by-country';
import { useDestination } from '../../../contexts/DestinationContext';
import { useSupportedCountries } from '../../../hooks/useSupportedCountries';
import { resolveCountry, slugify } from '../../../data/countryMappings';

// Lightweight city shape for the service-page selector (admin-managed `city` table).
export interface ServiceCity {
  slug: string;
  name: string;
  isCapital: boolean;
  priority: number;
}

interface UseServiceContentParams {
  service: ServiceConfig;
  category: string;
}

export function useServiceContent({ service, category }: UseServiceContentParams) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const {
    countrySlug: selectedCountry,
    setCountrySlug: setSelectedCountry,
    citySlug: selectedCity,
    setCitySlug: setSelectedCity,
  } = useDestination();

  const { data: projects } = useQuery({
    queryKey: ['expatriation-projects'],
    queryFn: expatriationProjectApi.getAll,
    enabled: isAuthenticated,
  });

  // Cities come from the admin-managed `city` table (active) — same source as the onboarding step.
  const { citiesByCode } = useSupportedCountries();
  const countryCode = resolveCountry(selectedCountry)?.code;

  const availableCities = useMemo((): ServiceCity[] => {
    const cities = (countryCode && citiesByCode[countryCode]) || [];
    return cities
      .map((c) => ({ slug: slugify(c.name), name: c.name, isCapital: c.isCapital, priority: c.isCapital ? 0 : 1 }))
      .sort((a, b) => (a.priority !== b.priority ? a.priority - b.priority : a.name.localeCompare(b.name)));
  }, [citiesByCode, countryCode]);

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
