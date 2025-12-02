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

  // Mettre à jour le pays sélectionné si un paramètre d'URL est présent
  useEffect(() => {
    const countryParam = searchParams.get('country');
    if (countryParam) {
      setSelectedCountry(countryParam.toLowerCase());
    }
  }, [searchParams]);

  // Récupérer le projet actif de l'utilisateur
  const { data: projects } = useQuery({
    queryKey: ['expatriation-projects'],
    queryFn: expatriationProjectApi.getAll,
    enabled: isAuthenticated,
  });

  // Déterminer le pays par défaut à partir du projet si pas de paramètre d'URL
  useEffect(() => {
    const countryParam = searchParams.get('country');
    if (!countryParam && projects && projects.length > 0 && !selectedCountry) {
      // TODO: Mapper l'ID pays vers le nom du pays
      // Pour l'instant, on ne peut pas faire le mapping sans l'info du pays
      // Cette fonctionnalité sera ajoutée quand les projets incluront les détails du pays
    }
  }, [projects, selectedCountry, searchParams]);

  // Combiner contenu générique + contenu spécifique pays
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

    // Fusionner les guides génériques + guides spécifiques
    const combinedGuides: ServiceGuide[] = [
      ...service.guides,
      ...(countryContent.specificGuides || []),
    ];

    // Fusionner les tips
    const combinedTips = [
      ...service.tips,
      ...(countryContent.tips || []),
    ];

    // Utiliser les stats du pays si disponibles
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

  // Déterminer le mode d'affichage
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
