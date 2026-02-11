import { Check } from 'lucide-react'
import type { EnrichedCountry } from '../hooks/useCountriesWithData'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_COUNTRIES } from '../../../data/supportedCountries'

interface CountrySelectorProps {
  countries: EnrichedCountry[]
  selectedCountries: number[]
  onCountryToggle: (countryId: number) => void
  maxSelection: number
}

export default function CountrySelector({
  countries,
  selectedCountries,
  onCountryToggle,
  maxSelection
}: CountrySelectorProps) {
  const { t } = useTranslation()

  const getCountryName = (country: EnrichedCountry): string => {
    const sc = SUPPORTED_COUNTRIES.find(c => c.code === country.isoCode)
    if (!sc) return country.countryName
    return t(sc.i18nKey, { defaultValue: country.countryName })
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {countries.map((country) => {
        const isSelected = selectedCountries.includes(country.idCountry)
        const isDisabled = !isSelected && selectedCountries.length >= maxSelection

        return (
          <button
            key={country.idCountry}
            onClick={() => !isDisabled && onCountryToggle(country.idCountry)}
            disabled={isDisabled}
            className={`
              group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
              ${isSelected 
                ? 'border-[#5EA3C0] bg-[#5EA3C0]/5 ring-1 ring-[#5EA3C0] shadow-sm' 
                : isDisabled
                ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed grayscale'
                : 'border-gray-200 bg-white hover:border-[#5EA3C0]'
              }
            `}
          >
            <div className={`
              w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm transition-transform duration-300
              ${isSelected ? 'scale-110 ring-2 ring-white' : 'group-hover:scale-105'}
            `}>
              {country.flagUrl ? (
                <img 
                  src={country.flagUrl} 
                  alt={country.countryName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-100">
                  {country.flagEmoji || '🌍'}
                </div>
              )}
            </div>

            <div className="flex-1 text-left">
              <span className={`block font-bold text-base mb-0.5 ${
                isSelected ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
              }`}>
                {getCountryName(country)}
              </span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {t(`comparison.data.continents.${country.continent}`, { defaultValue: country.continent || t('comparison.fields.destination') })}
              </span>
            </div>

            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
              ${isSelected 
                ? 'bg-[#5EA3C0] scale-100 opacity-100 shadow-sm' 
                : 'bg-gray-100 scale-75 opacity-0 group-hover:opacity-100'
              }
            `}>
              <Check className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
            </div>
          </button>
        )
      })}
    </div>
  )
}
