import { useQuery } from '@tanstack/react-query'
import { countryApi } from '../../../api/country'
import { destinationsApi } from '../../../api/destinations'
import type { Country } from '../../../types/country'
import type { CostOfLivingData } from '../../destinations/types'
import countriesDataJson from '../../../data/countries-data.json'
import { SUPPORTED_COUNTRY_CODES } from '../../../data/supportedCountries'

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
  /** Display label for the currency, e.g. "EUR", "USD" */
  currency?: string
  /** ISO currency code used as source for conversion (from cost-of-living API) */
  sourceCurrencyCode?: string
  /** Exchange rates map from the cost-of-living API (relative to USD) */
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
    /** Full JSONB data from cost_of_living_cache (capital city) */
    capitalCityData?: CostOfLivingData | null
  }
  healthcare?: {
    qualityRating?: string
    system?: string
    accessibility?: string
    averageCosts?: {
      doctorVisit?: number
      emergency?: number
      insurance?: number
    }
  }
  lifestyle?: {
    safetyRating?: string
    workLifeBalance?: string
    cuisine?: string
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
}

/**
 * Extract cost of living comparison data from the real JSONB cache data.
 * Uses the capital city (or first city with data) as representative.
 */
function extractCostOfLivingFromCache(
  capitalData: CostOfLivingData | null | undefined,
): EnrichedCountry['costOfLiving'] | undefined {
  if (!capitalData?.categories) return undefined

  const housing = capitalData.categories.housing
  const restaurants = capitalData.categories.restaurants
  const food = capitalData.categories.food
  const salary = capitalData.categories.salary

  // Weekly groceries estimate from market basket
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
  // Step 1: load all countries from /api/country
  const { data: apiCountries, isLoading: isLoadingCountries, error } = useQuery({
    queryKey: ['countries'],
    queryFn: countryApi.getAll,
  })

  // Step 2: load destination details (with cost of living) for each supported country
  const { data: destinationDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['country-destinations-details'],
    queryFn: async () => {
      const results: Record<string, { capitalData: CostOfLivingData | null; currency: string; exchangeRates?: Record<string, number> }> = {}
      await Promise.all(
        SUPPORTED_COUNTRY_CODES.map(async (code) => {
          try {
            const detail = await destinationsApi.getBySlug(code)
            // Find capital city or first city with costOfLiving data
            const capitalCity =
              detail.cities.find(c => c.isCapital && c.costOfLiving) ||
              detail.cities.find(c => c.costOfLiving)
            results[code] = {
              capitalData: capitalCity?.costOfLiving ?? null,
              currency: detail.currency || 'EUR',
              exchangeRates: capitalCity?.costOfLiving?.currency?.exchangeRates,
            }
          } catch {
            results[code] = { capitalData: null, currency: 'EUR' }
          }
        }),
      )
      return results
    },
    enabled: !!apiCountries && apiCountries.length > 0,
    staleTime: 5 * 60 * 1000, // cache 5 min
  })

  const isLoading = isLoadingCountries || isLoadingDetails

  const enrichedCountries: EnrichedCountry[] | undefined = apiCountries
    ?.map((country: Country): EnrichedCountry | undefined => {
      const countryCode = country.isoCode

      // Filter to keep only MVP countries
      if (!countryCode || !SUPPORTED_COUNTRY_CODES.includes(countryCode)) {
        return undefined
      }

      const jsonData = countriesDataJson.countries.find(
        c => c.code === countryCode,
      ) as CountryDataFromJson | undefined

      // Get real cost of living data from the API cache
      const detailData = destinationDetails?.[countryCode]
      const realCostOfLiving = detailData?.capitalData
        ? extractCostOfLivingFromCache(detailData.capitalData)
        : undefined

      // Fallback to JSON static data if API data not yet available
      const costOfLiving = realCostOfLiving || jsonData?.costOfLiving

      return {
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
        healthcare: jsonData
          ? ((jsonData as unknown as Record<string, unknown>).healthcare as EnrichedCountry['healthcare'])
          : undefined,
        lifestyle: jsonData
          ? ((jsonData as unknown as Record<string, unknown>).lifestyle as EnrichedCountry['lifestyle'])
          : undefined,
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
      }
    })
    .filter((c): c is EnrichedCountry => c !== undefined)

  return {
    data: enrichedCountries,
    isLoading,
    error,
  }
}
