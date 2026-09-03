import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { SearchFilters, SearchResult, SearchState } from '../types'
import { searchJobs } from '../../../api/jobOffers'
import type { AdzunaJobDto } from '../types/job'
import { enhanceSearchKeyword } from '../utils/keywordTranslation'
import { parseSmartQuery, isAdzunaSupported, getCountryCodeFromName } from '../utils/smartQueryParser'

const defaultFilters: SearchFilters = {
  query: '',
  category: 'emploi',
  country: '',
  city: '',
  priceRange: [0, 10000],
  dateRange: ['', ''],
  sortBy: 'date',
  sortOrder: 'desc',
  contractType: [],
  maxDaysOld: undefined
}

function convertAdzunaJobToSearchResult(job: AdzunaJobDto, t: (key: string) => string): SearchResult {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    category: 'emploi',
    country: job.location.country,
    city: job.location.city || t('searchPage.notSpecified'),
    price: job.salary?.min,
    currency: job.salary?.currency,
    salaryPeriod: job.salary?.period,
    date: job.created_at,
    image: job.company_logo || undefined,
    link: job.redirect_url,
    tags: [
      job.company,
      ...(job.contract_type ? [job.contract_type] : []),
      ...(job.remote ? ['Remote'] : []),
      ...(job.category ? [job.category] : [])
    ].filter(Boolean),
    rating: undefined,
    provider: 'Adzuna',
    urgency: 'medium' as const
  }
}

export default function useSearch() {
  const { t, i18n } = useTranslation()
  const [state, setState] = useState<SearchState>({
    filters: defaultFilters,
    results: [],
    isLoading: false,
    totalResults: 0,
    currentPage: 1,
    hasMore: true,
    recentSearches: [],
    savedFilters: []
  })

  const isLoadingMoreRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const recentSearches = JSON.parse(localStorage.getItem('skywalk-recent-searches') || '[]')
    const savedFilters = JSON.parse(localStorage.getItem('skywalk-saved-filters') || '[]')
    setState(prev => ({ ...prev, recentSearches, savedFilters }))
  }, [])

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      currentPage: 1
    }))
  }, [])

  const resolveSearchParams = useCallback((filters: SearchFilters) => {
    const parsed = parseSmartQuery(filters.query || '', filters.country || undefined)

    let countryCode = parsed.countryCode
    let countryName = parsed.countryName
    let city = parsed.city || filters.city || ''

    if (!countryCode && filters.country) {
      countryCode = getCountryCodeFromName(filters.country)
      countryName = filters.country
    }

    if (!countryCode) {
      countryCode = 'fr'
      countryName = 'France'
    }

    const keyword = parsed.keyword
    const enhanced = enhanceSearchKeyword(keyword, countryName, i18n.language)

    if (enhanced.remainingWords && !city) {
      city = enhanced.remainingWords.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }

    return { countryCode, countryName, city, keyword: enhanced.keyword || keyword }
  }, [i18n.language])

  const sortResults = useCallback((results: SearchResult[]): SearchResult[] => {
    const { sortBy, sortOrder } = state.filters
    const sorted = [...results]

    if (sortBy === 'date') {
      sorted.sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      })
    } else if (sortBy === 'salary') {
      sorted.sort((a, b) => {
        const priceA = a.price || 0
        const priceB = b.price || 0
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA
      })
    }

    return sorted
  }, [state.filters])

  const search = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setState(prev => ({
      ...prev,
      isLoading: true,
      currentPage: 1,
      results: [],
      hasMore: true
    }))

    try {
      const { priceRange } = state.filters
      const rawQuery = state.filters.query?.trim() || ''
      const { countryCode, city, keyword } = resolveSearchParams(state.filters)

      if (!isAdzunaSupported(countryCode)) {
        setState(prev => ({
          ...prev,
          results: [],
          totalResults: 0,
          isLoading: false,
          hasMore: false
        }))
        return
      }

      const contracts = state.filters.contractType || []
      const singleContract = contracts.length === 1 ? contracts[0] : null

      const jobSearchParams = {
        country: countryCode,
        city: city || undefined,
        keyword: keyword || undefined,
        page: 1,
        resultsPerPage: 20,
        sortBy: (state.filters.sortBy as 'relevance' | 'date' | 'salary') || 'relevance',
        salaryMin: priceRange[0] > 0 ? priceRange[0] : undefined,
        salaryMax: priceRange[1] < 10000 ? priceRange[1] : undefined,
        fullTime: singleContract === 'full_time' ? true : undefined,
        partTime: singleContract === 'part_time' ? true : undefined,
        contract: singleContract === 'contract' ? true : undefined,
        permanent: singleContract === 'permanent' ? true : undefined,
        max_days_old: state.filters.maxDaysOld
      }

      const adzunaResponse = await searchJobs(jobSearchParams)

      if (controller.signal.aborted) return

      const results = sortResults(adzunaResponse.results.map(job =>
        convertAdzunaJobToSearchResult(job, t)
      ))

      setState(prev => ({
        ...prev,
        results,
        totalResults: adzunaResponse.total,
        isLoading: false,
        currentPage: 1,
        hasMore: adzunaResponse.totalPages > 1
      }))

      if (rawQuery) {
        const recentSearches = JSON.parse(localStorage.getItem('skywalk-recent-searches') || '[]')
        const updatedSearches = [rawQuery, ...recentSearches.filter((s: string) => s !== rawQuery)].slice(0, 10)
        localStorage.setItem('skywalk-recent-searches', JSON.stringify(updatedSearches))
      }
    } catch (error) {
      if (controller.signal.aborted) return
      console.error('Search error:', error)
      setState(prev => ({
        ...prev,
        results: [],
        totalResults: 0,
        isLoading: false
      }))
    }
  }, [state.filters, t, resolveSearchParams, sortResults])

  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !state.hasMore || state.isLoading) return
    isLoadingMoreRef.current = true

    try {
      const { category } = state.filters
      if (category !== 'emploi') return

      const nextPage = state.currentPage + 1
      const { countryCode, city, keyword } = resolveSearchParams(state.filters)

      if (!isAdzunaSupported(countryCode)) return

      const contracts = state.filters.contractType || []
      const singleContract = contracts.length === 1 ? contracts[0] : null

      const jobSearchParams = {
        country: countryCode,
        city: city || undefined,
        keyword: keyword || undefined,
        page: nextPage,
        resultsPerPage: 20,
        sortBy: (state.filters.sortBy as 'relevance' | 'date' | 'salary') || 'relevance',
        fullTime: singleContract === 'full_time' ? true : undefined,
        partTime: singleContract === 'part_time' ? true : undefined,
        contract: singleContract === 'contract' ? true : undefined,
        permanent: singleContract === 'permanent' ? true : undefined,
      }

      const adzunaResponse = await searchJobs(jobSearchParams)
      const newResults = adzunaResponse.results.map(job =>
        convertAdzunaJobToSearchResult(job, t)
      )

      setState(prev => ({
        ...prev,
        results: sortResults([...prev.results, ...newResults]),
        currentPage: nextPage,
        hasMore: nextPage < adzunaResponse.totalPages
      }))
    } catch (error) {
      console.error('Load more results error:', error)
    } finally {
      isLoadingMoreRef.current = false
    }
  }, [state.filters, state.currentPage, state.hasMore, state.isLoading, t, resolveSearchParams, sortResults])

  const isFirstRenderRef = useRef(true)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    search()
  }, [state.filters.country, state.filters.city, state.filters.query, state.filters.contractType, state.filters.sortBy, state.filters.sortOrder, search])

  const saveFilters = useCallback((name: string) => {
    const savedFilters = JSON.parse(localStorage.getItem('skywalk-saved-filters') || '[]')
    const newFilter = { name, filters: state.filters, date: new Date().toISOString() }
    const updatedFilters = [newFilter, ...savedFilters.filter((item: { name: string }) => item.name !== name)].slice(0, 5)
    localStorage.setItem('skywalk-saved-filters', JSON.stringify(updatedFilters))
    setState(prev => ({ ...prev, savedFilters: updatedFilters }))
  }, [state.filters])

  return {
    ...state,
    updateFilters,
    search,
    loadMore,
    saveFilters
  }
}