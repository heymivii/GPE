import { useState, useEffect } from 'react';

export type WidgetSize = 'small' | 'medium' | 'large';

interface DashboardPreferences {
  hiddenWidgets: string[];
  layout?: string[];
  widgetSizes?: Record<string, WidgetSize>;
}

const STORAGE_KEY = 'skywalk-dashboard-preferences';

const DEFAULT_WIDGET_SIZES: Record<string, WidgetSize> = {
  'profile-summary': 'medium',
  'local-time': 'small',
  'weather': 'small',
  'checklist': 'large',
  'budget-tracker': 'medium',
  'recommendations': 'large',
  'currency-converter': 'medium',
  'job-opportunities': 'medium',
};

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

  const getWidgetSize = (widgetId: string): WidgetSize => {
    return preferences.widgetSizes?.[widgetId] || DEFAULT_WIDGET_SIZES[widgetId] || 'medium';
  };

  const setWidgetSize = (widgetId: string, size: WidgetSize) => {
    setPreferences(prev => ({
      ...prev,
      widgetSizes: {
        ...prev.widgetSizes,
        [widgetId]: size,
      }
    }));
  };

  const cycleWidgetSize = (widgetId: string) => {
    const current = getWidgetSize(widgetId);
    const next: WidgetSize = current === 'small' ? 'medium' : current === 'medium' ? 'large' : 'small';
    setWidgetSize(widgetId, next);
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
    updateWidgetOrder,
    getWidgetSize,
    setWidgetSize,
    cycleWidgetSize,
  };
}
