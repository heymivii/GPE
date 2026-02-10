import { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_COUNTRIES } from '../../../data/supportedCountries';

const AVAILABLE_COUNTRIES = SUPPORTED_COUNTRIES.map(c => ({
  slug: c.slug,
  name: c.name,
  i18nKey: c.i18nKey,
  flag: c.flag
}));

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
  const { t } = useTranslation();

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
        className={`flex items-center space-x-3 px-4 py-2.5 bg-white border rounded-lg transition-all shadow-sm ${isOpen ? 'border-gray-900 ring-2 ring-gray-100' : 'border-gray-200 hover:border-gray-300'
          }`}
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <div className="flex flex-col items-start text-left">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            {t('services.countrySelector.destination')}
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {selectedCountryData
              ? `${selectedCountryData.flag} ${t(selectedCountryData.i18nKey)}`
              : `🌍 ${t('services.countrySelector.general')}`}
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
          <div className="absolute top-full mt-2 right-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2">
              {showGenericOption && (
                <button
                  onClick={() => handleSelect(null)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${!selectedCountry
                    ? 'bg-gray-900 text-white'
                    : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-lg">🌍</span>
                    <span className="font-medium">{t('services.countrySelector.generalInfo')}</span>
                  </div>
                  {!selectedCountry && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              )}

              {showGenericOption && <div className="my-2 border-t border-gray-100" />}

              <div className="space-y-1">
                {AVAILABLE_COUNTRIES.map((country) => (
                  <button
                    key={country.slug}
                    onClick={() => handleSelect(country.slug)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${selectedCountry === country.slug
                      ? 'bg-gray-900 text-white'
                      : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-lg">{country.flag}</span>
                      <span className="font-medium">{t(country.i18nKey)}</span>
                    </div>
                    {selectedCountry === country.slug && (
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
