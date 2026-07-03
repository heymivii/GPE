import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { expatriationProjectApi } from '../../../api/expatriation-project';
import type { ServiceConfig, ServiceGuide } from '../../../data/services-config';
import { getCountryContent } from '../../../data/services-content-by-country';
import { useDestination } from '../../../contexts/DestinationContext';
import { useSupportedCountries } from '../../../hooks/useSupportedCountries';
import { resolveCountry, slugify } from '../../../data/countryMappings';
import { useActiveProject } from '../../../contexts/ActiveProjectContext';

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

  // The site-wide active project: contextualise Services to its destination.
  const { activeProjectId } = useActiveProject();
  const activeProject = useMemo(() => {
    if (!projects || projects.length === 0) return undefined;
    return projects.find((p) => p.idProject === activeProjectId) ?? projects[projects.length - 1];
  }, [projects, activeProjectId]);

  const projectCountrySlug = useMemo(() => {
    const iso = activeProject?.destinationCountry?.isoCode;
    return iso ? resolveCountry(iso)?.slug ?? null : null;
  }, [activeProject]);

  const projectCitySlug = useMemo(() => {
    const name = activeProject?.destinationCity?.name;
    return name ? slugify(name) : null;
  }, [activeProject]);

  // Seed the destination from the active project. First seed of a mount only fills when
  // nothing is chosen yet (respects a ?country= deep-link / a remembered choice); a genuine
  // active-project switch afterwards overrides so Services follows the current project.
  const seededForProjectRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isAuthenticated || !activeProject || !projectCountrySlug) return;
    if (seededForProjectRef.current === activeProject.idProject) return;
    const firstSeed = seededForProjectRef.current === null;
    seededForProjectRef.current = activeProject.idProject;
    if (firstSeed) {
      if (!selectedCountry) setSelectedCountry(projectCountrySlug);
    } else {
      setSelectedCountry(projectCountrySlug);
    }
  }, [isAuthenticated, activeProject, projectCountrySlug, selectedCountry, setSelectedCountry]);

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
        // Prefer the active project's city, then the capital, then the first available.
        const projectCity = projectCitySlug
          ? availableCities.find((c) => c.slug === projectCitySlug)
          : undefined;
        const capital = availableCities.find((c) => c.isCapital);
        setSelectedCity((projectCity ?? capital ?? availableCities[0]).slug);
      }
    } else if (selectedCountry === null) {
      setSelectedCity(null);
    }
  }, [availableCities, selectedCity, selectedCountry, projectCitySlug]);

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
