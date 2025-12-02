import { useState, useEffect } from 'react'
import { Search, Filter, Grid, List, ChevronDown } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import FilterSection from '../components/FilterSection'
import ResultsSection from '../components/ResultsSection'
import useSearch from '../hooks/useSearch'
import type { SearchFilters } from '../types'
import { useAuth } from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../../components/PageHeader'
import { PageSearch } from '../../../components/PageSearch'

export default function SearchPage() {
  const { isAuthenticated } = useAuth();
  const {
    filters,
    results,
    isLoading,
    totalResults,
    updateFilters,
    search,
    loadMore
  } = useSearch()

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Limit to 10 results for non-authenticated users
  const displayedResults = !isAuthenticated ? results.slice(0, 10) : results;
  const hasMoreResults = !isAuthenticated && results.length > 10;

  useEffect(() => {
    const onboardingData = localStorage.getItem('skywalk-onboarding-data')
    if (onboardingData) {
      const data = JSON.parse(onboardingData)
      const destination = data.destination
      const profile = data.profile
      
      const defaultFilters: Partial<SearchFilters> = {}
      
      if (destination?.country) {
        defaultFilters.country = destination.country
      }
      if (destination?.city) {
        defaultFilters.city = destination.city
      }
      
      const priorities = data.needs?.priorities || []
      if (priorities.includes('Emploi')) {
        defaultFilters.category = 'emploi'
      } else if (priorities.includes('Logement')) {
        defaultFilters.category = 'logement'
      }
      
      if (Object.keys(defaultFilters).length > 0) {
        updateFilters(defaultFilters)
      }
    }
  }, [updateFilters])

  const handleSearch = (searchQuery: string) => {
    updateFilters({ query: searchQuery })
    search()
  }

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    updateFilters(newFilters)
    search()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Recherche Avancée" 
        description="Trouvez des emplois, logements et services adaptés à votre projet d'expatriation."
      />

      <PageSearch>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-2xl">
            <SearchBar
              initialQuery={filters.query}
              onSearch={handleSearch}
              placeholder="Rechercher emplois, logements, transports..."
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </PageSearch>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Résultats de recherche
            </h1>
            {totalResults > 0 && (
              <span className="text-sm text-gray-600">
                {totalResults.toLocaleString('fr-FR')} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Trier par:</span>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                handleFilterChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' })
              }}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="relevance-desc">Pertinence</option>
              <option value="date-desc">Plus récent</option>
              <option value="date-asc">Plus ancien</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="rating-desc">Mieux noté</option>
            </select>
          </div>
        </div>

        <ResultsSection
          results={displayedResults}
          isLoading={isLoading}
          viewMode={viewMode}
          onLoadMore={loadMore}
        />

        {/* Limit prompt for non-authenticated users */}
        {hasMoreResults && (
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-[#5EA3C0] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Découvrez {results.length - 10}+ résultats supplémentaires</h3>
              <p className="text-gray-600 mb-6">
                Créez un compte gratuit pour accéder à tous les résultats, sauvegarder vos recherches et recevoir des alertes personnalisées.
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  to="/auth/register"
                  className="px-6 py-3 bg-[#5EA3C0] text-white font-semibold rounded-full hover:bg-[#4d8a9d] transition-colors"
                >
                  Créer un compte gratuit
                </Link>
                <Link
                  to="/auth/login"
                  className="px-6 py-3 bg-white text-[#5EA3C0] font-semibold rounded-full border-2 border-[#5EA3C0] hover:bg-blue-50 transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        )}

      
        {!isLoading && results.length === 0 && filters.query && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun résultat trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier vos critères de recherche ou vos filtres.
            </p>
            <button
              onClick={() => {
                updateFilters({
                  query: '',
                  category: '',
                  country: '',
                  city: '',
                  priceRange: [0, 10000],
                  dateRange: ['', '']
                })
                search()
              }}
              className="text-[#5EA3C0] hover:text-[#4A8299] font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  )
}