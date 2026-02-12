export interface SearchFilters {
  query: string
  category: string
  country: string
  city: string
  priceRange: [number, number]
  dateRange: [string, string]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  contractType: string[]
  maxDaysOld?: number
}

export interface SearchResult {
  id: string
  title: string
  description: string
  category: 'emploi' | 'logement' | 'transport' | 'administration' | 'sante'
  country: string
  city: string
  price?: number
  currency?: string
  salaryPeriod?: 'month' | 'year'
  date: string
  image?: string
  link: string
  tags: string[]
  rating?: number
  provider: string
  urgency: 'high' | 'medium' | 'low'
}

export interface Category {
  id: string
  name: string
  icon: string
  subcategories: Subcategory[]
  color: string
}

export interface Subcategory {
  id: string
  name: string
  parentId: string
}

export interface Country {
  code: string
  name: string
  flag: string
  cities: string[]
}

export interface SearchState {
  filters: SearchFilters
  results: SearchResult[]
  isLoading: boolean
  totalResults: number
  currentPage: number
  hasMore: boolean
  recentSearches: string[]
  savedFilters: SearchFilters[]
}