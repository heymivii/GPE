import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import Widget from './Widget';

interface LocalTimeWidgetProps {
  countryCode: string;
  countryName: string;
  onHide?: () => void;
}

// Mapping des pays vers leurs fuseaux horaires
const TIMEZONE_MAP: Record<string, string> = {
  'FR': 'Europe/Paris',
  'CA': 'America/Toronto',
  'CH': 'Europe/Zurich',
  'DE': 'Europe/Berlin',
  'GB': 'Europe/London',
  'US': 'America/New_York',
  'ES': 'Europe/Madrid',
  'IT': 'Europe/Rome',
  'JP': 'Asia/Tokyo',
  'AU': 'Australia/Sydney',
  'BE': 'Europe/Brussels',
  'NL': 'Europe/Amsterdam',
  'PT': 'Europe/Lisbon',
  'SE': 'Europe/Stockholm',
};

export default function LocalTimeWidget({ 
  countryCode, 
  countryName, 
  onHide 
}: LocalTimeWidgetProps) {
  const [localTime, setLocalTime] = useState<Date>(new Date());
  const [destinationTime, setDestinationTime] = useState<Date>(new Date());
  
  const timezone = TIMEZONE_MAP[countryCode] || 'UTC';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(now);
      
      // Calculer l'heure dans le pays de destination
      const destTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      setDestinationTime(destTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [timezone]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTimeDifference = () => {
    const diff = Math.round((destinationTime.getTime() - localTime.getTime()) / (1000 * 60 * 60));
    if (diff === 0) return 'Même fuseau horaire';
    if (diff > 0) return `+${diff}h`;
    return `${diff}h`;
  };

  return (
    <Widget 
      title="Heure locale" 
      icon={Clock}
      onHide={onHide}
    >
      <div className="space-y-6">
        {/* Heure destination */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600 flex items-center">
              <span className="mr-2">📍</span>
              {countryName}
            </h3>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {getTimeDifference()}
            </span>
          </div>
          
          <div className="text-4xl font-bold text-gray-900 font-outfit mb-2 tracking-tight">
            {formatTime(destinationTime)}
          </div>
          
          <p className="text-sm text-gray-500 capitalize">
            {formatDate(destinationTime)}
          </p>
        </div>

        {/* Heure locale (votre fuseau) */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            Votre heure locale
          </h4>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold text-gray-700 font-outfit">
              {formatTime(localTime)}
            </div>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </Widget>
  );
}
