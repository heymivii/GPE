import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { SearchFilters, SearchResult, SearchState } from '../types'
import { searchJobs } from '../../../api/jobOffers'
import type { AdzunaJobDto } from '../types/job'
import { enhanceSearchKeyword } from '../utils/keywordTranslation'

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Full-Stack Developer - Tech Startup Toronto',
    description: 'Join an innovative fast-growing startup. Stack: React, Node.js, PostgreSQL. Remote possible.',
    category: 'emploi',
    country: 'Canada',
    city: 'Toronto',
    price: 85000,
    currency: 'CAD',
    date: '2024-01-15',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500',
    link: '#',
    tags: ['React', 'Node.js', 'Startup', 'Remote'],
    rating: 4.8,
    provider: 'TechJobs Canada',
    urgency: 'high'
  },
  {
    id: '2',
    title: '2-Room Apartment - Downtown Paris',
    description: 'Beautiful renovated apartment in the 3rd arrondissement. Metro 2 min away, all amenities.',
    category: 'logement',
    country: 'France',
    city: 'Paris',
    price: 1800,
    currency: 'EUR',
    date: '2024-01-14',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500',
    link: '#',
    tags: ['Furnished', 'Metro', 'Downtown'],
    rating: 4.5,
    provider: 'SeLoger',
    urgency: 'medium'
  },
  {
    id: '3',
    title: 'Public Transport Guide in Berlin',
    description: 'Everything about the Berlin transport system: metro, bus, trams. Fares, passes, cards.',
    category: 'transport',
    country: 'Allemagne',
    city: 'Berlin',
    date: '2024-01-13',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500',
    link: '#',
    tags: ['U-Bahn', 'S-Bahn', 'BVG', 'Guide'],
    rating: 4.9,
    provider: 'Berlin Guide',
    urgency: 'low'
  },
  {
    id: '4',
    title: 'Opening a Bank Account in Switzerland',
    description: 'Complete procedure to open a bank account in Switzerland. Required documents, recommended banks.',
    category: 'administration',
    country: 'Suisse',
    city: 'Zurich',
    date: '2024-01-12',
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500',
    link: '#',
    tags: ['Bank', 'Administration', 'Documents'],
    rating: 4.7,
    provider: 'Swiss Info',
    urgency: 'high'
  },
  {
    id: '5',
    title: 'Private Health Insurance - Canada',
    description: 'Comparison of the best private health insurances in Canada. Coverage, rates, procedures.',
    category: 'sante',
    country: 'Canada',
    city: 'Montreal',
    price: 150,
    currency: 'CAD',
    date: '2024-01-11',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500',
    link: '#',
    tags: ['Insurance', 'Health', 'Private'],
    rating: 4.6,
    provider: 'HealthGuide CA',
    urgency: 'medium'
  },
  {
    id: '6',
    title: 'Software Engineer - Fintech Zurich',
    description: 'Unique opportunity in a leading fintech. Modern technologies, international team, attractive salary.',
    category: 'emploi',
    country: 'Suisse',
    city: 'Zurich',
    price: 120000,
    currency: 'CHF',
    date: '2024-01-10',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
    link: '#',
    tags: ['Fintech', 'Java', 'International'],
    rating: 4.9,
    provider: 'Swiss Jobs',
    urgency: 'high'
  },
  {
    id: '7',
    title: 'Furnished Studio - London Shoreditch',
    description: 'Modern studio in the trendy Shoreditch neighborhood. Near transport, shops, and nightlife.',
    category: 'logement',
    country: 'Royaume-Uni',
    city: 'Londres',
    price: 1500,
    currency: 'GBP',
    date: '2024-01-09',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
    link: '#',
    tags: ['Studio', 'Furnished', 'Shoreditch', 'Metro'],
    rating: 4.4,
    provider: 'Rightmove',
    urgency: 'high'
  },
  {
    id: '8',
    title: 'Digital Project Manager - Paris La Défense',
    description: 'Large company looking for experienced project manager. Team management, innovative projects, permanent contract.',
    category: 'emploi',
    country: 'France',
    city: 'Paris',
    price: 55000,
    currency: 'EUR',
    date: '2024-01-08',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500',
    link: '#',
    tags: ['Management', 'Digital', 'Permanent'],
    rating: 4.6,
    provider: 'Indeed France',
    urgency: 'medium'
  },
  {
    id: '9',
    title: 'UK Expatriation Guide',
    description: 'Everything you need to know to settle in the UK: visa, housing, health, bank, taxes.',
    category: 'administration',
    country: 'Royaume-Uni',
    city: 'Londres',
    date: '2024-01-07',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500',
    link: '#',
    tags: ['Guide', 'Visa', 'NHS', 'Administration'],
    rating: 4.8,
    provider: 'UK Expat Guide',
    urgency: 'low'
  },
  {
    id: '10',
    title: '3-Bedroom Flatshare - Geneva Center',
    description: 'Room in international flatshare. Quiet neighborhood, near UN and transport. Charges included.',
    category: 'logement',
    country: 'Suisse',
    city: 'Genève',
    price: 1200,
    currency: 'CHF',
    date: '2024-01-06',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500',
    link: '#',
    tags: ['Flatshare', 'International', 'Downtown'],
    rating: 4.3,
    provider: 'WG-Zimmer',
    urgency: 'medium'
  },
  {
    id: '11',
    title: 'Public Transport in Paris: Complete Guide',
    description: 'Metro, RER, bus, tram: everything about Parisian transport. Navigo fares, zones, schedules.',
    category: 'transport',
    country: 'France',
    city: 'Paris',
    date: '2024-01-05',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500',
    link: '#',
    tags: ['Metro', 'RER', 'Navigo', 'RATP'],
    rating: 4.7,
    provider: 'Paris Transport Guide',
    urgency: 'low'
  },
  {
    id: '12',
    title: 'British Health System (NHS)',
    description: 'Understanding the NHS: registration, GP, consultations, emergencies, pharmacies.',
    category: 'sante',
    country: 'Royaume-Uni',
    city: 'Londres',
    date: '2024-01-04',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500',
    link: '#',
    tags: ['NHS', 'Health', 'GP', 'Free'],
    rating: 4.5,
    provider: 'NHS Guide',
    urgency: 'high'
  }
]

const defaultFilters: SearchFilters = {
  query: '',
  category: 'emploi',
  country: 'France',
  city: '',
  priceRange: [0, 10000],
  dateRange: ['', ''],
  sortBy: 'relevance',
  sortOrder: 'desc',
  contractType: [],
  maxDaysOld: undefined
}

const countryToAdzunaCode: Record<string, string> = {
  'France': 'fr',
  'Canada': 'ca',
  'Suisse': 'ch',
  'Allemagne': 'de',
  'États-Unis': 'us',
  'Royaume-Uni': 'gb'
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
    date: job.created_at,
    image: job.company_logo || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500',
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
  };
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

  useEffect(() => {
    const recentSearches = JSON.parse(localStorage.getItem('skywalk-recent-searches') || '[]')
    const savedFilters = JSON.parse(localStorage.getItem('skywalk-saved-filters') || '[]')

    setState(prev => ({
      ...prev,
      recentSearches,
      savedFilters
    }))
  }, [])

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      currentPage: 1
    }))
  }, [])

  const search = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      currentPage: 1,
      results: [],
      hasMore: true
    }))

    try {
      const { query, category, country, city, priceRange } = state.filters
      let filteredResults: SearchResult[] = [];

      if (category === 'emploi') {
        try {
          const adzunaCountryCode = country ? countryToAdzunaCode[country] : undefined;
          const enhancedKeyword = enhanceSearchKeyword(query || '', country, i18n.language);

          const jobSearchParams = {
            country: adzunaCountryCode || undefined,
            city: city || undefined,
            keyword: enhancedKeyword || undefined,
            page: 1,
            resultsPerPage: 20,
            sortBy: (state.filters.sortBy as 'relevance' | 'date' | 'salary') || 'relevance',
            salaryMin: priceRange[0] > 0 ? priceRange[0] : undefined,
            salaryMax: priceRange[1] < 10000 ? priceRange[1] : undefined,
            fullTime: state.filters.contractType?.includes('full_time'),
            partTime: state.filters.contractType?.includes('part_time'),
            contract: state.filters.contractType?.includes('contract'),
            permanent: state.filters.contractType?.includes('permanent'),
            max_days_old: state.filters.maxDaysOld
          };

          const adzunaResponse = await searchJobs(jobSearchParams);
          filteredResults = adzunaResponse.results.map(job => convertAdzunaJobToSearchResult(job, t));

          setState(prev => ({
            ...prev,
            results: filteredResults,
            totalResults: adzunaResponse.total,
            isLoading: false,
            currentPage: 1,
            hasMore: adzunaResponse.totalPages > 1
          }));

          if (query.trim()) {
            const recentSearches = JSON.parse(localStorage.getItem('skywalk-recent-searches') || '[]');
            const updatedSearches = [query, ...recentSearches.filter((item: string) => item !== query)].slice(0, 10);
            localStorage.setItem('skywalk-recent-searches', JSON.stringify(updatedSearches));
          }

          return;
        } catch (error) {
          console.error('Adzuna search error:', error);
          filteredResults = mockResults.filter(result => result.category === 'emploi');
        }
      } else {
        filteredResults = mockResults;

        if (query) {
          filteredResults = filteredResults.filter(result =>
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.description.toLowerCase().includes(query.toLowerCase()) ||
            result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
          )
        }

        if (category) {
          filteredResults = filteredResults.filter(result => result.category === category)
        }

        if (country) {
          filteredResults = filteredResults.filter(result => result.country === country)
        }

        if (city) {
          filteredResults = filteredResults.filter(result =>
            result.city.toLowerCase().includes(city.toLowerCase())
          )
        }

        if (priceRange[0] > 0 || priceRange[1] < 10000) {
          filteredResults = filteredResults.filter(result => {
            if (!result.price) return priceRange[0] === 0
            return result.price >= priceRange[0] && result.price <= priceRange[1]
          })
        }
      }

      const { sortBy, sortOrder } = state.filters
      filteredResults.sort((a, b) => {
        let comparison = 0

        switch (sortBy) {
          case 'date':
            comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
            break
          case 'price':
            comparison = (a.price || 0) - (b.price || 0)
            break
          case 'rating':
            comparison = (a.rating || 0) - (b.rating || 0)
            break
          case 'relevance':
          default: {
            const scoreA = (a.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 0) +
              (a.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ? 1 : 0)
            const scoreB = (b.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 0) +
              (b.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ? 1 : 0)
            comparison = scoreB - scoreA
          }
        }

        return sortOrder === 'desc' ? -comparison : comparison
      })

      setState(prev => ({
        ...prev,
        results: filteredResults,
        totalResults: filteredResults.length,
        isLoading: false,
        hasMore: false
      }))

      if (query.trim()) {
        const recentSearches = JSON.parse(localStorage.getItem('skywalk-recent-searches') || '[]')
        const updatedSearches = [query, ...recentSearches.filter((item: string) => item !== query)].slice(0, 10)
        localStorage.setItem('skywalk-recent-searches', JSON.stringify(updatedSearches))
      }

    } catch (error) {
      console.error('Search error:', error)
      setState(prev => ({
        ...prev,
        results: [],
        totalResults: 0,
        isLoading: false
      }))
    }
  }, [state.filters, t, i18n.language])

  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !state.hasMore || state.isLoading) {
      return;
    }

    isLoadingMoreRef.current = true;

    try {
      const { query, category, country, city } = state.filters;

      if (category !== 'emploi') {
        return;
      }

      const nextPage = state.currentPage + 1;
      const adzunaCountryCode = country ? countryToAdzunaCode[country] : undefined;
      const enhancedKeyword = enhanceSearchKeyword(query || '', country, i18n.language);

      const jobSearchParams = {
        country: adzunaCountryCode || undefined,
        city: city || undefined,
        keyword: enhancedKeyword || undefined,
        page: nextPage,
        resultsPerPage: 20,
        sortBy: (state.filters.sortBy as 'relevance' | 'date' | 'salary') || 'relevance'
      };

      const adzunaResponse = await searchJobs(jobSearchParams);
      const newResults = adzunaResponse.results.map(job => convertAdzunaJobToSearchResult(job, t));

      setState(prev => ({
        ...prev,
        results: [...prev.results, ...newResults],
        currentPage: nextPage,
        hasMore: nextPage < adzunaResponse.totalPages
      }));

    } catch (error) {
      console.error('Load more results error:', error);
    } finally {
      isLoadingMoreRef.current = false;
    }
  }, [state.filters, state.currentPage, state.hasMore, state.isLoading, t, i18n.language])

  const isFirstRenderRef = useRef(true)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }

    search()
  }, [state.filters.category, state.filters.country, state.filters.city, state.filters.query, search])

  const saveFilters = useCallback((name: string) => {
    const savedFilters = JSON.parse(localStorage.getItem('skywalk-saved-filters') || '[]')
    const newFilter = { name, filters: state.filters, date: new Date().toISOString() }
    const updatedFilters = [newFilter, ...savedFilters.filter((item: { name: string }) => item.name !== name)].slice(0, 5)
    localStorage.setItem('skywalk-saved-filters', JSON.stringify(updatedFilters))

    setState(prev => ({
      ...prev,
      savedFilters: updatedFilters
    }))
  }, [state.filters])

  return {
    ...state,
    updateFilters,
    search,
    loadMore,
    saveFilters
  }
}