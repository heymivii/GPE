import { useQuery } from '@tanstack/react-query'
import { countryApi } from '../../../api/country'
import { destinationsApi } from '../../../api/destinations'
import type { Country } from '../../../types/country'
import type { CostOfLivingData } from '../../destinations/types'
import countriesDataJson from '../../../data/countries-data.json'
import { SUPPORTED_COUNTRY_CODES } from '../../../data/supportedCountries'
import { propertyInvestmentApi, type PropertyInvestmentData } from '../../../api/propertyInvestment'
import { qualityOfLifeApi, type QualityOfLifeData } from '../../../api/qualityOfLife'

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
    utilities?: number
    transportMonthly?: number
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
  flagEmoji?: string
  capital?: string
  continent?: string
  currency?: string
  sourceCurrencyCode?: string
  exchangeRates?: Record<string, number>
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
    utilities?: number
    transportMonthly?: number
    internetMonthly?: number
    capitalCityData?: CostOfLivingData | null
  }

  climate?: {
    type?: string
    averageTemp?: {
      summer?: string
      winter?: string
    }
  }
  taxation?: {
    incomeTaxRange?: string
    vat?: string
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
  propertyInvestment?: PropertyInvestmentData | null
  qualityOfLife?: QualityOfLifeData | null
  uniqueId?: string
  isCity?: boolean
  parentId?: number
}

function extractCostOfLivingFromCache(
  capitalData: CostOfLivingData | null | undefined,
): EnrichedCountry['costOfLiving'] | undefined {
  if (!capitalData?.categories) return undefined

  const housing = capitalData.categories.housing
  const restaurants = capitalData.categories.restaurants
  const food = capitalData.categories.food
  const salary = capitalData.categories.salary

  const m = food?.markets
  const weeklyGroceries = m
    ? Math.round(
      (m.bread500g?.avg || 0) * 2 +
      (m.milk1L?.avg || 0) * 3 +
      (m.eggs12?.avg || 0) +
      (m.rice1kg?.avg || 0) +
      (m.chicken1kg?.avg || 0) +
      (m.tomato1kg?.avg || 0) +
      (m.potato1kg?.avg || 0) +
      (m.apple1kg?.avg || 0),
    )
    : undefined

  return {
    averageRent: {
      oneBedroom: housing?.rent?.oneBedroom?.cityCenter?.avg
        ? Math.round(housing.rent.oneBedroom.cityCenter.avg)
        : undefined,
      threeBedroom: housing?.rent?.threeBedroom?.cityCenter?.avg
        ? Math.round(housing.rent.threeBedroom.cityCenter.avg)
        : undefined,
    },
    averageSalary: salary?.averageMonthly?.avg
      ? Math.round(salary.averageMonthly.avg)
      : capitalData.summary?.averageSalary
        ? Math.round(capitalData.summary.averageSalary)
        : undefined,
    food: {
      restaurantMeal: restaurants?.inexpensiveMeal?.avg
        ? Math.round(restaurants.inexpensiveMeal.avg)
        : undefined,
      groceriesWeekly: weeklyGroceries,
    },
    utilities: capitalData.categories.utilities?.basic85m2?.avg
      ? Math.round(capitalData.categories.utilities.basic85m2.avg)
      : undefined,
    transportMonthly: capitalData.categories.transportation?.publicTransport?.monthlyPass?.avg
      ? Math.round(capitalData.categories.transportation.publicTransport.monthlyPass.avg)
      : undefined,
    capitalCityData: capitalData,
  }
}

export function useCountriesWithData() {
  const { data: apiCountries, isLoading: isLoadingCountries, error, refetch } = useQuery({
    queryKey: ['countries'],
    queryFn: countryApi.getAll,
  })

  const { data: destinationDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['country-destinations-details'],
    queryFn: async () => {
      const results: Record<string, { capitalData: CostOfLivingData | null; currency: string; exchangeRates?: Record<string, number>; cities?: import('../../destinations/types').CityDestination[]; propertyInvestment?: PropertyInvestmentData | null; qualityOfLife?: QualityOfLifeData | null }> = {}
      await Promise.all(
        SUPPORTED_COUNTRY_CODES.map(async (code) => {
          // Independent fetches: one source failing must not drop the others.
          const [detailRes, piRes, qolRes] = await Promise.allSettled([
            destinationsApi.getBySlug(code),
            propertyInvestmentApi.get(code),
            qualityOfLifeApi.get(code),
          ])
          const propertyInvestment = piRes.status === 'fulfilled' ? piRes.value : null
          const qualityOfLife = qolRes.status === 'fulfilled' ? qolRes.value : null
          if (detailRes.status === 'fulfilled') {
            const detail = detailRes.value
            const capitalCity =
              detail.cities.find(c => c.isCapital && c.costOfLiving) ||
              detail.cities.find(c => c.costOfLiving)
            results[code] = {
              capitalData: capitalCity?.costOfLiving ?? null,
              currency: detail.currency || 'EUR',
              exchangeRates: capitalCity?.costOfLiving?.currency?.exchangeRates,
              cities: detail.cities,
              propertyInvestment,
              qualityOfLife,
            }
          } else {
            results[code] = { capitalData: null, currency: 'EUR', cities: [], propertyInvestment, qualityOfLife }
          }
        }),
      )
      return results
    },
    enabled: !!apiCountries && apiCountries.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  const isLoading = isLoadingCountries || isLoadingDetails

  const enrichedCountries: EnrichedCountry[] = []

  apiCountries?.forEach((country: Country) => {
    const countryCode = country.isoCode

    if (!countryCode || !SUPPORTED_COUNTRY_CODES.includes(countryCode)) {
      return
    }

    const jsonData = countriesDataJson.countries.find(
      c => c.code === countryCode,
    ) as CountryDataFromJson | undefined

    const detailData = destinationDetails?.[countryCode]
    const realCostOfLiving = detailData?.capitalData
      ? extractCostOfLivingFromCache(detailData.capitalData)
      : undefined

    const costOfLiving = realCostOfLiving || undefined

    const baseCountry: EnrichedCountry = {
      uniqueId: `country-${country.idCountry}`,
      isCity: false,
      idCountry: country.idCountry,
      countryName: country.countryName,
      countryCode: countryCode,
      isoCode: countryCode,
      flagUrl: jsonData?.flagUrl || country.flagUrl,
      flagEmoji: jsonData?.flagEmoji,
      capital: jsonData?.capital || country.capital,
      continent: jsonData?.continent || country.continent?.continentName,
      currency: jsonData?.currency,
      sourceCurrencyCode: detailData?.capitalData?.currency?.code || jsonData?.currency || 'EUR',
      exchangeRates: detailData?.exchangeRates,
      languages: jsonData?.languages?.join(', '),
      costOfLiving,

      climate: jsonData
        ? ((jsonData as unknown as Record<string, unknown>).climate as EnrichedCountry['climate'])
        : undefined,
      taxation: jsonData
        ? ((jsonData as unknown as Record<string, unknown>).taxation as EnrichedCountry['taxation'])
        : undefined,
      recommendations: jsonData?.recommendations,
      expatProjectTemplate: jsonData
        ? ((jsonData as unknown as Record<string, unknown>).expatProjectTemplate as EnrichedCountry['expatProjectTemplate'])
        : undefined,
      propertyInvestment: detailData?.propertyInvestment ?? null,
      qualityOfLife: detailData?.qualityOfLife ?? null,
    }

    enrichedCountries.push(baseCountry)

    detailData?.cities?.forEach((city) => {
      if (!city.costOfLiving) return
      // Stable, deterministic id. The backend returns `idCity`; fall back to a
      // name+country composite — never Math.random(), which would change the
      // uniqueId on every render and break selection / URL hydration.
      const cityKey = city.idCity ?? city.id ?? city.city_id ?? `${countryCode}-${city.name}`

      enrichedCountries.push({
        ...baseCountry,
        uniqueId: `city-${cityKey}`,
        isCity: true,
        parentId: country.idCountry,
        countryName: city.name,
        costOfLiving: extractCostOfLivingFromCache(city.costOfLiving),

        climate: undefined,
        taxation: undefined,
        recommendations: undefined,
      })
    })
  })

  return {
    data: enrichedCountries,
    isLoading,
    error,
    refetch,
  }
}
