import { useQuery } from '@tanstack/react-query'
import { countryApi } from '../../../api/country'
import type { Country } from '../../../types/country'
import countriesDataJson from '../../../data/countries-data.json'

interface CountryDataFromJson {
  id: number
  name: string
  code: string
  currency: string
  languages: string[]
  flagUrl: string
  flagEmoji: string
  continent: string
  capital: string
  costOfLiving?: {
    averageRent?: {
      oneBedroom?: number
      threeBedroom?: number
    }
    averageSalary?: number
    food?: {
      restaurantMeal?: number
      groceriesWeekly?: number
    }
  }
  recommendations?: {
    bestFor?: string[]
    language?: string
    visaDifficulty?: string
  }
}

export interface EnrichedCountry {
  idCountry: number
  countryName: string
  countryCode?: string 
  isoCode?: string
  flagUrl?: string
  capital?: string
  continent?: string
  currency?: string
  languages?: string
  costOfLiving?: {
    averageRent?: {
      oneBedroom?: number
      threeBedroom?: number
    }
    averageSalary?: number
    food?: {
      restaurantMeal?: number
      groceriesWeekly?: number
    }
  }
  recommendations?: {
    bestFor?: string[]
    language?: string
    visaDifficulty?: string
  }
  expatProjectTemplate?: {
    steps: Array<{
      id: number
      title: string
      category: string
    }>
  }
  expatProjectTemplate?: {
    steps: Array<{
      id: number
      title: string
      category: string
    }>
  }
}

export function useCountriesWithData() {
  const { data: apiCountries, isLoading, error } = useQuery({
    queryKey: ['countries'],
    queryFn: countryApi.getAll,
  })

  const enrichedCountries: EnrichedCountry[] | undefined = apiCountries?.map((country: Country) => {
  
    const countryCode = country.isoCode
    
    const jsonData = countriesDataJson.countries.find(
      c => c.code === countryCode
    ) as CountryDataFromJson | undefined

    console.log(`🔍 Pays API: ${country.countryName} (code: "${countryCode}")`)
    console.log(`   JSON trouvé:`, jsonData ? `✅ ${jsonData.name}` : '❌ Aucun')
    if (jsonData?.costOfLiving) {
      console.log(`   Cost of living:`, jsonData.costOfLiving.averageRent?.oneBedroom)
    }

    return {
      idCountry: country.idCountry,
      countryName: country.countryName,
      countryCode: countryCode,
      isoCode: countryCode,
      flagUrl: jsonData?.flagUrl || country.flagUrl,
      capital: jsonData?.capital || country.capital,
      continent: jsonData?.continent || country.continent?.continentName,
      currency: jsonData?.currency,
      languages: jsonData?.languages?.join(', '),
      costOfLiving: jsonData?.costOfLiving,
      recommendations: jsonData?.recommendations,
      expatProjectTemplate: jsonData ? (jsonData as Record<string, unknown>).expatProjectTemplate as EnrichedCountry['expatProjectTemplate'] : undefined
    }
  })

  return {
    data: enrichedCountries,
    isLoading,
    error
  }
}
