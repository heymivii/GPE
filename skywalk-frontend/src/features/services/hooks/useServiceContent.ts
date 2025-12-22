import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { expatriationProjectApi } from '../../../api/expatriation-project';
import type { ServiceConfig, ServiceGuide } from '../../../data/services-config';
import { getCountryContent } from '../../../data/services-content-by-country';

interface UseServiceContentParams {
  service: ServiceConfig;
  category: string;
}

export function useServiceContent({ service, category }: UseServiceContentParams) {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

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

  useEffect(() => {
    const countryParam = searchParams.get('country');
    if (!countryParam && projects && projects.length > 0 && !selectedCountry) {
    }
  }, [projects, selectedCountry, searchParams]);

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
      ...(countryContent.specificGuides || []),
    ];

    const combinedTips = [
      ...service.tips,
      ...(countryContent.tips || []),
    ];

    const stats = countryContent.stats || service.stats;

    return {
      ...service,
      guides: combinedGuides,
      tips: combinedTips,
      stats,
      hasCountryContent: true,
      countryName: selectedCountry,
      countrySpecific: countryContent,
    };
  }, [service, selectedCountry, category]);

  const displayMode = useMemo(() => {
    if (!isAuthenticated) {
      return 'generic'; // Visiteur anonyme
    }
    if (projects && projects.length > 0) {
      return 'with-project'; // Utilisateur avec projet
    }
    return 'without-project'; // Utilisateur sans projet
  }, [isAuthenticated, projects]);

  return {
    content: enrichedContent,
    selectedCountry,
    setSelectedCountry,
    displayMode,
    hasProject: projects && projects.length > 0,
    isAuthenticated,
  };
}
