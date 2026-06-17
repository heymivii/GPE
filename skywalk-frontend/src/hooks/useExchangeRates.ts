import { useQuery } from '@tanstack/react-query'

/**
 * Live USD-based exchange rates: `rates[code]` = units of `code` per 1 USD
 * (e.g. EUR ≈ 0.86, JPY ≈ 160). This is exactly the shape CurrencyContext's
 * `convert` expects — it pivots through USD (amount / rate[src] * rate[target]).
 *
 * Source: open.er-api.com (key-free, CORS-enabled, includes USD:1 in the map).
 */
const FX_URL = 'https://open.er-api.com/v6/latest/USD'

interface ErApiResponse {
  result: string
  base_code: string
  rates: Record<string, number>
}

export function useExchangeRates() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['exchange-rates', 'USD'],
    queryFn: async (): Promise<Record<string, number>> => {
      const res = await fetch(FX_URL)
      if (!res.ok) throw new Error(`FX fetch failed: ${res.status}`)
      const json: ErApiResponse = await res.json()
      if (json.result !== 'success' || !json.rates) {
        throw new Error('FX response malformed')
      }
      return json.rates
    },
    // FX is stable enough for cost comparison; refetch at most every 6h.
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  })

  return { rates: data, isLoading, error }
}
