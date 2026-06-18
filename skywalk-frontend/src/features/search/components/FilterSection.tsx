import { useState, useRef, useCallback } from 'react'
import { MapPin, Calendar, DollarSign, Tag, X, Briefcase } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { SearchFilters } from '../types'
import { useSupportedCountries } from '../../../hooks/useSupportedCountries'

interface FilterSectionProps {
  filters: SearchFilters
  onFiltersChange: (filters: Partial<SearchFilters>) => void
}

const categoryIds = ['emploi', 'logement', 'transport', 'administration', 'sante'] as const

const categoryAvailable: Record<string, boolean> = {
  emploi: true,
  logement: false,
  transport: false,
  administration: false,
  sante: false,
}

const categoryColors: Record<string, string> = {
  emploi: 'bg-blue-100 text-blue-800',
  logement: 'bg-green-100 text-green-800',
  transport: 'bg-purple-100 text-purple-800',
  administration: 'bg-orange-100 text-orange-800',
  sante: 'bg-red-100 text-red-800'
}

const contractTypeIds = ['permanent', 'contract', 'full_time', 'part_time'] as const

export default function FilterSection({ filters, onFiltersChange }: FilterSectionProps) {
  const { t } = useTranslation()
  const { countries: supportedCountries, citiesByCountry } = useSupportedCountries()
  const countries = supportedCountries.map(c => ({
    code: c.code,
    name: c.name,
    i18nKey: c.i18nKey,
    flag: c.flag,
  }))
  const [isPriceExpanded, setIsPriceExpanded] = useState(false)
  const [isDateExpanded, setIsDateExpanded] = useState(false)
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCityChange = useCallback((value: string) => {
    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current)
    onFiltersChange({ city: value })
  }, [onFiltersChange])

  const categories = categoryIds.map(id => ({
    id,
    name: t(`searchPage.filter.categories.${id}`),
    color: categoryColors[id],
    disabled: !categoryAvailable[id],
  }))

  const contractTypes = contractTypeIds.map(id => ({
    id,
    name: t(`searchPage.filter.contracts.${id}`)
  }))

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategory = filters.category
    const newCategory = currentCategory === categoryId ? '' : categoryId
    onFiltersChange({ category: newCategory })
  }

  const handleCountryChange = (countryName: string) => {
    onFiltersChange({ country: countryName === filters.country ? '' : countryName })
  }

  const handleContractTypeToggle = (typeId: string) => {
    const currentTypes = filters.contractType || []
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter(t => t !== typeId)
      : [...currentTypes, typeId]
    onFiltersChange({ contractType: newTypes })
  }

  const handlePriceRangeChange = (min: number, max: number) => {
    onFiltersChange({ priceRange: [min, max] })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      category: '',
      country: '',
      city: '',
      priceRange: [0, 10000],
      dateRange: ['', ''],
      contractType: [],
      sortBy: 'relevance'
    })
  }

  const activeFiltersCount = [
    filters.category,
    filters.country,
    filters.city,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 10000,
    filters.dateRange[0] || filters.dateRange[1]
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('searchPage.filter.title')} {activeFiltersCount > 0 && <span className="text-sm text-gray-500">({activeFiltersCount})</span>}
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            {t('searchPage.filter.clearAll')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <label className="font-medium text-gray-700">{t('searchPage.filter.category')}</label>
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => !category.disabled && handleCategoryToggle(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${category.disabled
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    : filters.category === category.id
                      ? category.color
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <span className="flex items-center justify-between">
                  {category.name}
                  {category.disabled && (
                    <span className="text-[10px] text-gray-400 italic">{t('common.comingSoon')}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <label className="font-medium text-gray-700">{t('searchPage.filter.country')}</label>
          </div>
          <div className="space-y-2">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCountryChange(country.name)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${filters.country === country.name
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <span>{country.flag}</span>
                <span>{t(country.i18nKey)}</span>
              </button>
            ))}
          </div>
        </div>



        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <label className="font-medium text-gray-700">{t('searchPage.filter.contractType')}</label>
          </div>
          <div className="space-y-2">
            {contractTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleContractTypeToggle(type.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${filters.contractType?.includes(type.id)
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${filters.contractType?.includes(type.id)
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-400 bg-white'
                  }`}>
                  {filters.contractType?.includes(type.id) && <span className="text-[10px]">✓</span>}
                </div>
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <label className="font-medium text-gray-700">{t('searchPage.filter.budget')}</label>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setIsPriceExpanded(!isPriceExpanded)}
              className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              {filters.priceRange[0] === 0 && filters.priceRange[1] === 10000
                ? t('searchPage.filter.allPrices')
                : `${filters.priceRange[0]}€ - ${filters.priceRange[1]}€`}
            </button>

            {isPriceExpanded && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0] || ''}
                    onChange={(e) => handlePriceRangeChange(Number(e.target.value) || 0, filters.priceRange[1])}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1] === 10000 ? '' : filters.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(filters.priceRange[0], Number(e.target.value) || 10000)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div className="flex gap-1">
                  {[500, 1000, 2000, 5000].map((price) => (
                    <button
                      key={price}
                      onClick={() => handlePriceRangeChange(0, price)}
                      className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      &lt;{price}€
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <label className="font-medium text-gray-700">{t('searchPage.filter.period')}</label>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => setIsDateExpanded(!isDateExpanded)}
              className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              {!filters.dateRange[0] && !filters.dateRange[1]
                ? t('searchPage.filter.allDates')
                : `${filters.dateRange[0] || t('searchPage.filter.start')} - ${filters.dateRange[1] || t('searchPage.filter.end')}`}
            </button>

            {isDateExpanded && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.dateRange[0]}
                    onChange={(e) => onFiltersChange({ dateRange: [e.target.value, filters.dateRange[1]] })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <input
                    type="date"
                    value={filters.dateRange[1]}
                    onChange={(e) => onFiltersChange({ dateRange: [filters.dateRange[0], e.target.value] })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div className="flex gap-1">
                  {(['today', 'thisWeek', 'thisMonth'] as const).map((periodKey) => {
                    const today = new Date().toISOString().split('T')[0]
                    const ranges: Record<string, [string, string]> = {
                      today: [today, today],
                      thisWeek: [today, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]],
                      thisMonth: [today, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]
                    }
                    return (
                      <button
                        key={periodKey}
                        onClick={() => {
                          onFiltersChange({ dateRange: ranges[periodKey] })
                        }}
                        className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        {t(`searchPage.filter.${periodKey}`)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {filters.country && (citiesByCountry[filters.country]?.length ?? 0) > 0 && (
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-500" />
            <label className="font-medium text-gray-700">{t('searchPage.filter.city')}</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {citiesByCountry[filters.country].map((city) => (
              <button
                key={city}
                onClick={() => handleCityChange(filters.city === city ? '' : city)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${filters.city === city
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div >
  )
}