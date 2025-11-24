import { useState } from 'react'
import { MapPin, Calendar, DollarSign, Tag, X } from 'lucide-react'
import type { SearchFilters } from '../types'

interface FilterSectionProps {
  filters: SearchFilters
  onFiltersChange: (filters: Partial<SearchFilters>) => void
}

const categories = [
  { id: 'emploi', name: 'Emploi', color: 'bg-blue-100 text-blue-800' },
  { id: 'logement', name: 'Logement', color: 'bg-green-100 text-green-800' },
  { id: 'transport', name: 'Transport', color: 'bg-purple-100 text-purple-800' },
  { id: 'administration', name: 'Administration', color: 'bg-orange-100 text-orange-800' },
  { id: 'sante', name: 'Santé', color: 'bg-red-100 text-red-800' }
]

const countries = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' }
]

export default function FilterSection({ filters, onFiltersChange }: FilterSectionProps) {
  const [isPriceExpanded, setIsPriceExpanded] = useState(false)
  const [isDateExpanded, setIsDateExpanded] = useState(false)

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategory = filters.category
    const newCategory = currentCategory === categoryId ? '' : categoryId
    onFiltersChange({ category: newCategory })
  }

  const handleCountryChange = (countryName: string) => {
    onFiltersChange({ country: countryName === filters.country ? '' : countryName })
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
      dateRange: ['', '']
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
          Filtres {activeFiltersCount > 0 && <span className="text-sm text-gray-500">({activeFiltersCount})</span>}
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Tout effacer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <label className="font-medium text-gray-700">Catégorie</label>
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryToggle(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filters.category === category.id
                    ? category.color
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <label className="font-medium text-gray-700">Pays</label>
          </div>
          <div className="space-y-2">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCountryChange(country.name)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                  filters.country === country.name
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <label className="font-medium text-gray-700">Budget</label>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setIsPriceExpanded(!isPriceExpanded)}
              className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              {filters.priceRange[0] === 0 && filters.priceRange[1] === 10000
                ? 'Tous les prix'
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
            <label className="font-medium text-gray-700">Période</label>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => setIsDateExpanded(!isDateExpanded)}
              className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              {!filters.dateRange[0] && !filters.dateRange[1]
                ? 'Toutes les dates'
                : `${filters.dateRange[0] || 'Début'} - ${filters.dateRange[1] || 'Fin'}`}
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
                  {['Aujourd\'hui', 'Cette semaine', 'Ce mois'].map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0]
                        const ranges = {
                          'Aujourd\'hui': [today, today],
                          'Cette semaine': [today, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]],
                          'Ce mois': [today, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]
                        }
                        onFiltersChange({ dateRange: ranges[period as keyof typeof ranges] })
                      }}
                      className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center gap-4">
          <label className="font-medium text-gray-700">Ville:</label>
          <input
            type="text"
            value={filters.city}
            onChange={(e) => onFiltersChange({ city: e.target.value })}
            placeholder="Entrez une ville..."
            className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  )
}