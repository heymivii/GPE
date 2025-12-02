import { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface Country {
  slug: string;
  name: string;
  flag: string;
}

const AVAILABLE_COUNTRIES: Country[] = [
  { slug: 'canada', name: 'Canada', flag: '🇨🇦' },
  { slug: 'france', name: 'France', flag: '🇫🇷' },
  { slug: 'allemagne', name: 'Allemagne', flag: '🇩🇪' },
  { slug: 'espagne', name: 'Espagne', flag: '🇪🇸' },
  { slug: 'royaume-uni', name: 'Royaume-Uni', flag: '🇬🇧' },
];

interface CountrySelectorProps {
  selectedCountry: string | null;
  onCountryChange: (countrySlug: string | null) => void;
  showGenericOption?: boolean;
}

export default function CountrySelector({
  selectedCountry,
  onCountryChange,
  showGenericOption = false,
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCountryData = AVAILABLE_COUNTRIES.find(
    (c) => c.slug === selectedCountry
  );

  const handleSelect = (countrySlug: string | null) => {
    onCountryChange(countrySlug);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-3 px-5 py-3 bg-white border rounded-xl transition-all duration-200 shadow-sm ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'
        }`}
      >
        <div className="p-1.5 bg-gray-50 rounded-lg">
          <Globe className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Pays sélectionné
          </span>
          <span className="font-bold text-gray-900">
            {selectedCountryData
              ? `${selectedCountryData.flag} ${selectedCountryData.name}`
              : '🌍 Informations générales'}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ml-2 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-3 right-0 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2">
              {showGenericOption && (
                <button
                  onClick={() => handleSelect(null)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    !selectedCountry 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl filter grayscale opacity-80">🌍</span>
                    <span className="font-semibold">Informations générales</span>
                  </div>
                  {!selectedCountry && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              )}

              <div className="my-2 border-t border-gray-100 mx-2" />

              <div className="space-y-1">
                {AVAILABLE_COUNTRIES.map((country) => (
                  <button
                    key={country.slug}
                    onClick={() => handleSelect(country.slug)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      selectedCountry === country.slug 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl shadow-sm rounded-sm">{country.flag}</span>
                      <span className="font-semibold">{country.name}</span>
                    </div>
                    {selectedCountry === country.slug && (
                      <Check className="w-5 h-5 text-blue-600" />
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
