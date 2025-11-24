import { Check } from 'lucide-react'
import type { EnrichedCountry } from '../hooks/useCountriesWithData'

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
              group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
              ${isSelected 
                ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-md' 
                : isDisabled
                ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed grayscale'
                : 'border-gray-200 hover:border-blue-300 hover:bg-white hover:shadow-lg hover:-translate-y-0.5 cursor-pointer bg-white'
              }
            `}
          >
            <div className={`
              w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm
              ${isSelected ? 'ring-2 ring-white' : ''}
            `}>
              {country.flagUrl ? (
                <img 
                  src={country.flagUrl} 
                  alt={country.countryName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-50">
                  {country.flagEmoji || '🌍'}
                </div>
              )}
            </div>

            <div className="flex-1 text-left">
              <span className={`block font-semibold text-base ${
                isSelected ? 'text-blue-900' : 'text-gray-700 group-hover:text-gray-900'
              }`}>
                {country.countryName}
              </span>
              <span className="text-xs text-gray-500">
                {country.continent || 'Destination'}
              </span>
            </div>

            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
              ${isSelected 
                ? 'bg-blue-600 scale-100 opacity-100' 
                : 'bg-gray-100 scale-90 opacity-0 group-hover:opacity-100'
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
