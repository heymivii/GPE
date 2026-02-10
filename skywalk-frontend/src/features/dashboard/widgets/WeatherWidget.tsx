import { Cloud, Sun, CloudRain, Wind, Droplets, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Widget from './Widget';
import { useTranslation } from 'react-i18next';
import type { WidgetSize } from '../hooks/useDashboardPreferences';

interface WeatherWidgetProps {
  countryName: string;
  cityName?: string;
  onHide?: () => void;
  onResize?: (size: WidgetSize) => void;
  currentSize?: WidgetSize;
}

interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  feelsLike: number;
}

export default function WeatherWidget({ 
  countryName, 
  cityName = '',
  onHide,
  onResize,
  currentSize,
}: WeatherWidgetProps) {
  const { t, i18n } = useTranslation()
  const location = cityName || countryName;
  const weatherLang = i18n.language === 'fr' ? 'fr' : 'en';

  const { data: weather, isLoading: loading, isError: error } = useQuery({
    queryKey: ['weather', location, weatherLang],
    queryFn: async () => {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric&lang=${weatherLang}`
      );
      
      if (!response.ok) throw new Error('Weather API error');
      
      const data = await response.json();
      
      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // m/s vers km/h
        icon: data.weather[0].icon,
        feelsLike: Math.round(data.main.feels_like),
      } as WeatherData;
    },
    staleTime: 10 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="w-12 h-12 text-gray-400" />;
    
    const icon = weather.icon;
    if (icon.includes('01')) return <Sun className="w-12 h-12 text-yellow-500" />;
    if (icon.includes('09') || icon.includes('10')) return <CloudRain className="w-12 h-12 text-blue-500" />;
    return <Cloud className="w-12 h-12 text-gray-500" />;
  };

  if (loading) {
    return (
      <Widget title={t('dashboard.personalized.widgets.weather.title')} icon={Cloud} onHide={onHide} onResize={onResize} currentSize={currentSize}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Widget>
    );
  }

  if (error || !weather) {
    return (
      <Widget title={t('dashboard.personalized.widgets.weather.title')} icon={Cloud} onHide={onHide} onResize={onResize} currentSize={currentSize}>
        <div className="text-center py-8">
          <Cloud className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            {t('dashboard.personalized.widgets.weather.error.title')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t('dashboard.personalized.widgets.weather.error.message')}
          </p>
        </div>
      </Widget>
    );
  }

  return (
    <Widget title={t('dashboard.personalized.widgets.weather.title')} icon={Cloud} onHide={onHide} onResize={onResize} currentSize={currentSize}>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {cityName || countryName}
              </h3>
              <p className="text-xs text-gray-500 capitalize">
                {weather.description}
              </p>
            </div>
            {getWeatherIcon()}
          </div>
          
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-bold text-gray-900 font-outfit">
              {weather.temperature}°
            </span>
            <span className="text-lg text-gray-500">C</span>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            {t('dashboard.personalized.widgets.weather.feelsLike', { temp: weather.feelsLike })}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center mb-2">
              <Droplets className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-xs text-gray-500">{t('dashboard.personalized.widgets.weather.humidity')}</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 font-outfit">
              {weather.humidity}%
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center mb-2">
              <Wind className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-xs text-gray-500">{t('dashboard.personalized.widgets.weather.wind')}</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 font-outfit">
              {weather.windSpeed} km/h
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center mb-2">
              <Eye className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-xs text-gray-500">{t('dashboard.personalized.widgets.weather.temp')}</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 font-outfit">
              {weather.feelsLike}°
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          {t('dashboard.personalized.widgets.weather.updated')}
        </p>
      </div>
    </Widget>
  );
}
