import { useState, useEffect } from 'react';

interface DashboardPreferences {
  hiddenWidgets: string[];
  layout?: string[];
}

const STORAGE_KEY = 'skywalk-dashboard-preferences';

/**
 * Hook pour gérer les préférences du dashboard (localStorage pour l'instant)
 * TODO: Migrer vers la BDD pour la synchronisation multi-appareils
 */
export function useDashboardPreferences() {
  const [preferences, setPreferences] = useState<DashboardPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing dashboard preferences:', error);
        return { hiddenWidgets: [] };
      }
    }
    return { hiddenWidgets: [] };
  });

  // Sauvegarder automatiquement dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const hideWidget = (widgetId: string) => {
    setPreferences(prev => ({
      ...prev,
      hiddenWidgets: [...prev.hiddenWidgets, widgetId]
    }));
  };

  const showWidget = (widgetId: string) => {
    setPreferences(prev => ({
      ...prev,
      hiddenWidgets: prev.hiddenWidgets.filter(id => id !== widgetId)
    }));
  };

  const toggleWidget = (widgetId: string) => {
    setPreferences(prev => ({
      ...prev,
      hiddenWidgets: prev.hiddenWidgets.includes(widgetId)
        ? prev.hiddenWidgets.filter(id => id !== widgetId)
        : [...prev.hiddenWidgets, widgetId]
    }));
  };

  const resetPreferences = () => {
    setPreferences({ hiddenWidgets: [] });
    localStorage.removeItem(STORAGE_KEY);
  };

  const isWidgetHidden = (widgetId: string): boolean => {
    return preferences.hiddenWidgets.includes(widgetId);
  };

  const updateWidgetOrder = (newOrder: string[]) => {
    setPreferences(prev => ({
      ...prev,
      layout: newOrder
    }));
  };

  return {
    preferences,
    hiddenWidgets: preferences.hiddenWidgets,
    widgetOrder: preferences.layout,
    hideWidget,
    showWidget,
    toggleWidget,
    resetPreferences,
    isWidgetHidden,
    updateWidgetOrder
  };
}
