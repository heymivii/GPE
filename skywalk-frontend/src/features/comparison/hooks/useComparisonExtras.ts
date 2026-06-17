import { useQueries } from '@tanstack/react-query'
import { propertyInvestmentApi } from '../../../api/propertyInvestment'
import { qualityOfLifeApi } from '../../../api/qualityOfLife'
import type { EnrichedCountry } from './useCountriesWithData'

const STALE_MS = 30 * 60 * 1000 // 30 min client-side (server caches 24h/30d).

/**
 * Lazily fetch country-level Numbeo data (property investment + quality of life)
 * ONLY for the currently-selected country destinations — not all supported countries
 * on every page load, and nothing at all until something is selected.
 * Returns the same list with the data attached to the matching countries.
 */
export function useComparisonExtras(selected: EnrichedCountry[]): EnrichedCountry[] {
  // Country-level only: cities don't have these indices (sections are hidden for cities).
  const targets = selected.filter((c) => !c.isCity && !!c.isoCode)

  const propertyQueries = useQueries({
    queries: targets.map((c) => ({
      queryKey: ['property-investment', c.isoCode],
      queryFn: () => propertyInvestmentApi.get(c.isoCode as string),
      staleTime: STALE_MS,
    })),
  })

  const qolQueries = useQueries({
    queries: targets.map((c) => ({
      queryKey: ['quality-of-life', c.isoCode],
      queryFn: () => qualityOfLifeApi.get(c.isoCode as string),
      staleTime: STALE_MS,
    })),
  })

  return selected.map((c) => {
    const idx = targets.findIndex((t) => t.uniqueId === c.uniqueId)
    if (idx < 0) return c
    return {
      ...c,
      propertyInvestment: propertyQueries[idx]?.data ?? null,
      qualityOfLife: qolQueries[idx]?.data ?? null,
    }
  })
}
