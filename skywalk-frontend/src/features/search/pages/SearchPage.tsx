import { useState, useEffect, useRef } from 'react'
import { Briefcase, ChevronDown, Filter, Grid, Home, List, Search, TrainFront } from 'lucide-react';
import { useTranslation } from 'react-i18next'
import SearchBar from '../components/SearchBar'
import FilterSection from '../components/FilterSection'
import ResultsSection from '../components/ResultsSection'
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger'
import useSearch from '../hooks/useSearch'
import type { SearchFilters } from '../types'
import { useAuth } from '../../../hooks/useAuth'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../../components/PageHeader'
import { PageSearch } from '../../../components/PageSearch'

export default function SearchPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const {
    filters,
    results,
    isLoading,
    totalResults,
    hasMore,
    updateFilters,
    search,
    loadMore
  } = useSearch()

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const hasInitialized = useRef(false)

  const displayedResults = !isAuthenticated ? results.slice(0, 10) : results;
  const hasMoreResults = !isAuthenticated && results.length > 10;

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.query) params.set('query', filters.query)
    if (filters.country) params.set('country', filters.country)
    if (filters.category) params.set('category', filters.category)
    if (filters.city) params.set('city', filters.city)
    setSearchParams(params, { replace: true })
  }, [filters.query, filters.country, filters.category, filters.city, setSearchParams])

  useEffect(() => {
    if (hasInitialized.current) return;
    
    const urlFilters: Partial<SearchFilters> = {};
    
    const country = searchParams.get('country');
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    
    if (country) urlFilters.country = country;
    if (category) urlFilters.category = category;
    if (query) urlFilters.query = query;
    
    if (Object.keys(urlFilters).length > 0) {
      updateFilters(urlFilters);
      hasInitialized.current = true;
      return;
    }
    
    const onboardingData = localStorage.getItem('skywalk-onboarding-data')
    if (onboardingData) {
      const data = JSON.parse(onboardingData)
      const destination = data.destination
      
      const defaultFilters: Partial<SearchFilters> = {}
      
      if (destination?.country) {
        defaultFilters.country = destination.country
      }
      if (destination?.city) {
        defaultFilters.city = destination.city
      }
      
      const priorities = data.needs?.priorities || []
      if (priorities.includes('employment')) {
        defaultFilters.category = 'emploi'
      } else if (priorities.includes('housing')) {
        defaultFilters.category = 'logement'
      }
      
      if (Object.keys(defaultFilters).length > 0) {
        updateFilters(defaultFilters)
      }
    }
    
    search()
    hasInitialized.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (searchQuery: string) => {
    updateFilters({ query: searchQuery })
  }

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    updateFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={t('searchPage.title')} 
        description={t('searchPage.description')}
      />

      <PageSearch>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-2xl">
            <SearchBar
              initialQuery={filters.query}
              onSearch={handleSearch}
              placeholder={t('searchPage.placeholder')}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>{t('searchPage.filters')}</span>
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
        {isFilterOpen && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
            <FilterSection
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {filters.query || filters.category || filters.country 
                ? t('searchPage.searchResults')
                : t('searchPage.popularDestinations')
              }
            </h1>
            {totalResults > 0 && (
              <span className="text-sm text-gray-600">
                {t('searchPage.resultCount', { count: totalResults, context: filters.query || filters.category || filters.country ? t(totalResults > 1 ? 'searchPage.founds' : 'searchPage.found') : t(totalResults > 1 ? 'searchPage.availables' : 'searchPage.available') })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('searchPage.sortBy')}</span>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                handleFilterChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' })
              }}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="relevance-desc">{t('searchPage.relevance')}</option>
              <option value="date-desc">{t('searchPage.mostRecent')}</option>
              <option value="date-asc">{t('searchPage.oldest')}</option>
              <option value="salary-asc">{t('searchPage.priceAsc')}</option>
              <option value="salary-desc">{t('searchPage.priceDesc')}</option>
            </select>
          </div>
        </div>

        {!filters.query && !filters.category && !filters.country && (
          <div className="mb-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    {t('searchPage.discoverDestinations')}
                  </h3>
                  <p className="text-sm text-blue-800">
                    {t('searchPage.discoverDestinationsDesc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 font-medium">{t('searchPage.popularSearches')}</span>
              {[
                // Les drapeaux restent : ils identifient un pays, ils ne décorent pas.
                { label: `🇫🇷 ${t('searchPage.france')}`, icon: undefined, filters: { country: 'France' } },
                { label: `🇬🇧 ${t('searchPage.unitedKingdom')}`, icon: undefined, filters: { country: 'Royaume-Uni' } },
                { label: `🇨🇭 ${t('searchPage.switzerland')}`, icon: undefined, filters: { country: 'Suisse' } },
                { label: `🇨🇦 ${t('searchPage.canada')}`, icon: undefined, filters: { country: 'Canada' } },
                { label: t('searchPage.jobs'), icon: Briefcase, filters: { category: 'emploi' } },
                { label: t('searchPage.housing'), icon: Home, filters: { category: 'logement' } },
                { label: t('searchPage.transport'), icon: TrainFront, filters: { category: 'transport' } },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleFilterChange(item.filters);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50 hover:border-[#5EA3C0] hover:text-[#5EA3C0] transition-colors"
                >
                  {item.icon && <item.icon className="w-3.5 h-3.5" />}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <ResultsSection
          results={displayedResults}
          isLoading={isLoading}
          viewMode={viewMode}
          onLoadMore={loadMore}
          showLoadMore={isAuthenticated}
        />

        {isAuthenticated && filters.category === 'emploi' && (
          <InfiniteScrollTrigger
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoading}
          />
        )}

        {hasMoreResults && (
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-[#5EA3C0] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('searchPage.discoverMore', { count: results.length - 10 })}</h3>
              <p className="text-gray-600 mb-6">
                {t('searchPage.createAccountDesc')}
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  to="/auth/register"
                  className="px-6 py-3 bg-[#5EA3C0] text-white font-semibold rounded-full hover:bg-[#4d8a9d] transition-colors"
                >
                  {t('searchPage.createFreeAccount')}
                </Link>
                <Link
                  to="/auth/login"
                  className="px-6 py-3 bg-white text-[#5EA3C0] font-semibold rounded-full border-2 border-[#5EA3C0] hover:bg-blue-50 transition-colors"
                >
                  {t('searchPage.login')}
                </Link>
              </div>
            </div>
          </div>
        )}

      
        {!isLoading && results.length === 0 && filters.query && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('searchPage.noResults')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('searchPage.noResultsDesc')}
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
              {t('searchPage.resetFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}