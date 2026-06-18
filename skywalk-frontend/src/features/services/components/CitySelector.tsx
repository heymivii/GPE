import { useState } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ServiceCity } from '../hooks/useServiceContent';

interface CitySelectorProps {
    selectedCity: string | null;
    onCityChange: (citySlug: string) => void;
    availableCities: ServiceCity[];
}

export default function CitySelector({
    selectedCity,
    onCityChange,
    availableCities,
}: CitySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    if (!availableCities || availableCities.length <= 1) {
        return null;
    }

    const selectedCityData = availableCities.find((c) => c.slug === selectedCity);

    const handleSelect = (citySlug: string) => {
        onCityChange(citySlug);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-3 px-4 py-2.5 bg-white border rounded-lg transition-all shadow-sm ${isOpen ? 'border-gray-900 ring-2 ring-gray-100' : 'border-gray-200 hover:border-gray-300'
                    }`}
            >
                <MapPin className="w-4 h-4 text-gray-600" />
                <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {t('services.citySelector.city', { defaultValue: 'Ville' })}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                        {selectedCityData ? selectedCityData.name : t('services.citySelector.select', { defaultValue: 'Sélectionner' })}
                    </span>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ml-auto ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full mt-2 right-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-64 overflow-y-auto">
                        <div className="p-2">
                            <div className="space-y-1">
                                {availableCities.map((city) => (
                                    <button
                                        key={city.slug}
                                        onClick={() => handleSelect(city.slug)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${selectedCity === city.slug
                                            ? 'bg-gray-900 text-white'
                                            : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex flex-col items-start px-1">
                                            <span className="font-medium">{city.name}</span>
                                        </div>
                                        {selectedCity === city.slug && (
                                            <Check className="w-4 h-4" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
