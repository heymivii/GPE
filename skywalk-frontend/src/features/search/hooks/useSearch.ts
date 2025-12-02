import { useState, useCallback, useEffect } from 'react'
import type { SearchFilters, SearchResult, SearchState } from '../types'

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Développeur Full-Stack - Startup Tech Toronto',
    description: 'Rejoignez une startup innovante en pleine croissance. Stack: React, Node.js, PostgreSQL. Télétravail possible.',
    category: 'emploi',
    country: 'Canada',
    city: 'Toronto',
    price: 85000,
    currency: 'CAD',
    date: '2024-01-15',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500',
    link: '#',
    tags: ['React', 'Node.js', 'Startup', 'Télétravail'],
    rating: 4.8,
    provider: 'TechJobs Canada',
    urgency: 'haute'
  },
  {
    id: '2',
    title: 'Appartement 2 pièces - Centre-ville Paris',
    description: 'Magnifique appartement rénové dans le 3ème arrondissement. Métro à 2 min, toutes commodités.',
    category: 'logement',
    country: 'France',
    city: 'Paris',
    price: 1800,
    currency: 'EUR',
    date: '2024-01-14',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500',
    link: '#',
    tags: ['Meublé', 'Métro', 'Centre-ville'],
    rating: 4.5,
    provider: 'SeLoger',
    urgency: 'moyenne'
  },
  {
    id: '3',
    title: 'Guide des transports publics à Berlin',
    description: 'Tout savoir sur le système de transport berlinois : métro, bus, trams. Tarifs, abonnements, cartes.',
    category: 'transport',
    country: 'Allemagne',
    city: 'Berlin',
    date: '2024-01-13',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500',
    link: '#',
    tags: ['U-Bahn', 'S-Bahn', 'BVG', 'Guide'],
    rating: 4.9,
    provider: 'Berlin Guide',
    urgency: 'faible'
  },
  {
    id: '4',
    title: 'Ouverture de compte bancaire en Suisse',
    description: 'Procédure complète pour ouvrir un compte bancaire en Suisse. Documents requis, banques recommandées.',
    category: 'administration',
    country: 'Suisse',
    city: 'Zurich',
    date: '2024-01-12',
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500',
    link: '#',
    tags: ['Banque', 'Administration', 'Documents'],
    rating: 4.7,
    provider: 'Swiss Info',
    urgency: 'haute'
  },
  {
    id: '5',
    title: 'Assurance santé privée - Canada',
    description: 'Comparatif des meilleures assurances santé privées au Canada. Couverture, tarifs, procédures.',
    category: 'sante',
    country: 'Canada',
    city: 'Montreal',
    price: 150,
    currency: 'CAD',
    date: '2024-01-11',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500',
    link: '#',
    tags: ['Assurance', 'Santé', 'Privé'],
    rating: 4.6,
    provider: 'HealthGuide CA',
    urgency: 'moyenne'
  },
  {
    id: '6',
    title: 'Ingénieur Logiciel - Fintech Zurich',
    description: 'Opportunité unique dans une fintech leader. Technologies modernes, équipe internationale, salaire attractif.',
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
    urgency: 'haute'
  },
  {
    id: '7',
    title: 'Studio meublé - Londres Shoreditch',
    description: 'Studio moderne dans le quartier branché de Shoreditch. Proche transports, commerces et vie nocturne.',
    category: 'logement',
    country: 'Royaume-Uni',
    city: 'Londres',
    price: 1500,
    currency: 'GBP',
    date: '2024-01-09',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
    link: '#',
    tags: ['Studio', 'Meublé', 'Shoreditch', 'Métro'],
    rating: 4.4,
    provider: 'Rightmove',
    urgency: 'haute'
  },
  {
    id: '8',
    title: 'Chef de Projet Digital - Paris La Défense',
    description: 'Grande entreprise recherche chef de projet expérimenté. Gestion d\'équipe, projets innovants, CDI.',
    category: 'emploi',
    country: 'France',
    city: 'Paris',
    price: 55000,
    currency: 'EUR',
    date: '2024-01-08',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500',
    link: '#',
    tags: ['Management', 'Digital', 'CDI'],
    rating: 4.6,
    provider: 'Indeed France',
    urgency: 'moyenne'
  },
  {
    id: '9',
    title: 'Guide expatriation au Royaume-Uni',
    description: 'Tout ce qu\'il faut savoir pour s\'installer au UK : visa, logement, santé, banque, impôts.',
    category: 'administration',
    country: 'Royaume-Uni',
    city: 'Londres',
    date: '2024-01-07',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500',
    link: '#',
    tags: ['Guide', 'Visa', 'NHS', 'Administration'],
    rating: 4.8,
    provider: 'UK Expat Guide',
    urgency: 'faible'
  },
  {
    id: '10',
    title: 'Colocation 3 chambres - Genève centre',
    description: 'Chambre dans colocation internationale. Quartier calme, proche ONU et transports. Charges incluses.',
    category: 'logement',
    country: 'Suisse',
    city: 'Genève',
    price: 1200,
    currency: 'CHF',
    date: '2024-01-06',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500',
    link: '#',
    tags: ['Colocation', 'International', 'Centre-ville'],
    rating: 4.3,
    provider: 'WG-Zimmer',
    urgency: 'moyenne'
  },
  {
    id: '11',
    title: 'Transports publics à Paris : Guide complet',
    description: 'Métro, RER, bus, tram : tout savoir sur les transports parisiens. Tarifs Navigo, zones, horaires.',
    category: 'transport',
    country: 'France',
    city: 'Paris',
    date: '2024-01-05',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500',
    link: '#',
    tags: ['Métro', 'RER', 'Navigo', 'RATP'],
    rating: 4.7,
    provider: 'Paris Transport Guide',
    urgency: 'faible'
  },
  {
    id: '12',
    title: 'Système de santé britannique (NHS)',
    description: 'Comprendre le NHS : inscription, médecin traitant, consultations, urgences, pharmacies.',
    category: 'sante',
    country: 'Royaume-Uni',
    city: 'Londres',
    date: '2024-01-04',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500',
    link: '#',
    tags: ['NHS', 'Santé', 'GP', 'Gratuit'],
    rating: 4.5,
    provider: 'NHS Guide',
    urgency: 'haute'
  }
]

const defaultFilters: SearchFilters = {
  query: '',
  category: '',
  country: '',
  city: '',
  priceRange: [0, 10000],
  dateRange: ['', ''],
  sortBy: 'relevance',
  sortOrder: 'desc'
}

export default function useSearch() {
  const [state, setState] = useState<SearchState>({
    filters: defaultFilters,
    results: mockResults, // Afficher les résultats par défaut au chargement
    isLoading: false,
    totalResults: mockResults.length,
    currentPage: 1,
    hasMore: true,
    recentSearches: [],
    savedFilters: []
  })

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
    setState(prev => ({ ...prev, isLoading: true }))

    await new Promise(resolve => setTimeout(resolve, 800))

    try {
      let filteredResults = mockResults

      const { query, category, country, city, priceRange } = state.filters

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
          default:
            const scoreA = (a.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 0) +
                          (a.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ? 1 : 0)
            const scoreB = (b.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 0) +
                          (b.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ? 1 : 0)
            comparison = scoreB - scoreA
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
      console.error('Erreur lors de la recherche:', error)
      setState(prev => ({
        ...prev,
        results: [],
        totalResults: 0,
        isLoading: false
      }))
    }
  }, [state.filters])

  const loadMore = useCallback(async () => {
    console.log('Charger plus de résultats...')
  }, [])

  const saveFilters = useCallback((name: string) => {
    const savedFilters = JSON.parse(localStorage.getItem('skywalk-saved-filters') || '[]')
    const newFilter = { name, filters: state.filters, date: new Date().toISOString() }
    const updatedFilters = [newFilter, ...savedFilters.filter((item: any) => item.name !== name)].slice(0, 5)
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