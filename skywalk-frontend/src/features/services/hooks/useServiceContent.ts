import { useState, useEffect, useMemo } from 'react';
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
  const { isAuthenticated, user } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Récupérer le projet actif de l'utilisateur
  const { data: projects } = useQuery({
    queryKey: ['expatriation-projects'],
    queryFn: expatriationProjectApi.getAll,
    enabled: isAuthenticated,
  });

  // Déterminer le pays par défaut
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedCountry) {
      // Prendre le pays du premier projet (ou projet actif)
      const activeProject = projects[0];
      if (activeProject.idDestinationCountry) {
        // Mapper l'ID pays vers le slug (à adapter selon votre data)
        // Pour l'instant, on utilise le nom du pays en lowercase
        setSelectedCountry(activeProject.destinationCountry?.name?.toLowerCase() || null);
      }
    }
  }, [projects, selectedCountry]);

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
