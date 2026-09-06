import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Globe, Plus, Search, X } from 'lucide-react';
import type { EnrichedCountry } from '../hooks/useCountriesWithData'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_COUNTRIES } from '../../../data/supportedCountries'

interface CountrySelectorProps {
  countries: EnrichedCountry[]
  selectedCountries: string[]
  onCountryToggle: (locationId: string) => void
  maxSelection: number
}

export default function CountrySelector({
  countries,
  selectedCountries,
  onCountryToggle,
  maxSelection
}: CountrySelectorProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const getCountryName = (country: EnrichedCountry): string => {
    if (country.isCity) return country.countryName
    const sc = SUPPORTED_COUNTRIES.find(c => c.code === country.isoCode)
    if (!sc) return country.countryName
    return t(sc.i18nKey, { defaultValue: country.countryName })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setSearchQuery('')
        setSelectedParentId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isDropdownOpen && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isDropdownOpen])

  const selectedCountriesData = countries.filter(c => selectedCountries.includes(c.uniqueId!))
  const availableCountries = countries.filter(c => !selectedCountries.includes(c.uniqueId!))

  const parentCountry = selectedParentId ? countries.find(c => c.idCountry === selectedParentId && !c.isCity) : null

  const selectionType = selectedCountriesData.length > 0 
    ? (selectedCountriesData[0].isCity ? 'city' : 'country') 
    : null;

  let listItems = []
  if (!selectedParentId) {
    listItems = availableCountries.filter(c => !c.isCity)
  } else {
    listItems = countries.filter(c =>
      (c.idCountry === selectedParentId && !c.isCity) ||
      (c.parentId === selectedParentId && c.isCity)
    ).filter(c => !selectedCountries.includes(c.uniqueId!))
  }

  const filteredItems = listItems.filter(country => {
    const name = getCountryName(country).toLowerCase()
    const continent = country.continent?.toLowerCase() || ''
    const q = searchQuery.toLowerCase()
    return name.includes(q) || continent.includes(q)
  })

  const canAddMore = selectedCountries.length < maxSelection

  return (
    <div className="space-y-4">
      {selectedCountriesData.length > 0 && (
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {selectedCountriesData.map((country) => (
            <div
              key={country.uniqueId}
              className="flex items-center gap-2 sm:gap-3 bg-white border border-brand/30 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm"
            >
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                {country.flagUrl ? (
                  <img src={country.flagUrl} alt={country.countryName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg bg-gray-100">
                    {country.flagEmoji || <Globe className="w-4 h-4 text-gray-400" />}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="block font-semibold text-sm sm:text-base text-gray-900 truncate">
                  {getCountryName(country)}
                </span>
                <span className="hidden sm:block text-xs text-gray-500">
                  {t(`comparison.data.continents.${country.continent}`, { defaultValue: country.continent || '' })}
                </span>
              </div>
              <button
                onClick={() => onCountryToggle(country.uniqueId!)}
                className="p-1 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
                aria-label={t('common.remove')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen)
              setTimeout(() => inputRef.current?.focus(), 100)
            }}
            className="w-full flex items-center gap-3 px-4 py-3 sm:py-4 bg-white border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl hover:border-brand hover:bg-brand-ink/5 transition-all text-gray-500 hover:text-brand-ink"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base font-medium">
              {selectedCountries.length === 0
                ? t('comparison.addCountry', { defaultValue: 'Sélectionner un pays' })
                : t('comparison.addAnotherCountry', { defaultValue: 'Ajouter un pays' })
              }
            </span>
            <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 sm:hidden animate-in fade-in duration-200"
                onClick={() => {
                  setIsDropdownOpen(false)
                  setSearchQuery('')
                  setSelectedParentId(null)
                }}
              />

              <div className="fixed inset-x-0 bottom-0 top-[15vh] sm:absolute sm:inset-auto sm:top-full sm:left-0 sm:right-0 sm:mt-2 bg-white rounded-t-3xl sm:rounded-2xl sm:border sm:border-gray-200 shadow-2xl z-50 sm:max-h-80 overflow-hidden flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-top-2 duration-300">

                <div className="sm:hidden flex flex-col bg-white">
                  <div className="w-full flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">
                      {t('comparison.addDestination', { defaultValue: 'Ajouter une destination' })}
                    </h3>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false)
                        setSearchQuery('')
                        setSelectedParentId(null)
                      }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-3 border-b border-gray-100 flex-shrink-0 flex items-center gap-2">
                  {selectedParentId && (
                    <button
                      onClick={() => {
                        setSelectedParentId(null)
                        setSearchQuery('')
                        inputRef.current?.focus()
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    >
                      <ChevronDown className="w-5 h-5 rotate-90" />
                    </button>
                  )}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('comparison.searchCountry', { defaultValue: 'Rechercher un pays...' })}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto flex-1">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((country) => (
                      <button
                        key={country.uniqueId}
                        onClick={() => {
                          const hasCities = !selectedParentId && !country.isCity && countries.some(c => c.parentId === country.idCountry && c.isCity)
                          
                          if (!selectedParentId && !country.isCity) {
                            if (selectionType === 'city') {
                              if (hasCities) {
                                setSelectedParentId(country.idCountry)
                                setSearchQuery('')
                                inputRef.current?.focus()
                              }
                              return;
                            } else if (selectionType !== 'country') {
                              if (hasCities) {
                                setSelectedParentId(country.idCountry)
                                setSearchQuery('')
                                inputRef.current?.focus()
                                return;
                              }
                            }
                          } else {
                            if (selectionType === 'city' && !country.isCity) return;
                            if (selectionType === 'country' && country.isCity) return;
                          }

                          onCountryToggle(country.uniqueId!)
                          setSearchQuery('')
                          if (selectedCountries.length + 1 >= maxSelection) {
                            setIsDropdownOpen(false)
                            setSelectedParentId(null)
                          } else if (selectedParentId) {
                            setSelectedParentId(null)
                          }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 shadow-sm relative">
                          {country.flagUrl ? (
                            <img src={country.flagUrl} alt={country.countryName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-base bg-gray-100">
                              {country.flagEmoji || <Globe className="w-4 h-4 text-gray-400" />}
                            </div>
                          )}
                          {country.isCity && (
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block font-medium text-sm text-gray-900 truncate">
                            {country.isCity ? country.countryName : (selectedParentId ? t('comparison.entireCountry', { defaultValue: 'Tout le pays' }) : getCountryName(country))}
                          </span>
                          <span className="text-xs text-gray-500">
                            {country.isCity ? getCountryName(parentCountry || countries.find(c => c.idCountry === country.parentId && !c.isCity)!) : t(`comparison.data.continents.${country.continent}`, { defaultValue: country.continent || '' })}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      {t('comparison.noCountryFound', { defaultValue: 'Aucune destination trouvée' })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
