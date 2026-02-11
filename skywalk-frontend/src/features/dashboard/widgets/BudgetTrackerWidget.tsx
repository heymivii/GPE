import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, AlertCircle, ArrowRightLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { CountryData } from '../../../hooks/useCountryData'
import { costOfLivingApi, type CleanedCostOfLivingData } from '../../../api/costOfLiving'
import Widget from './Widget'
import { useTranslation } from 'react-i18next'
import type { WidgetSize } from '../hooks/useDashboardPreferences'

interface BudgetTrackerWidgetProps {
  housingBudget: string
  countryData?: CountryData | null
  originCountryData?: CountryData | null
  onEdit?: () => void
  onHide?: () => void
  onResize?: (size: WidgetSize) => void
  currentSize?: WidgetSize
}

const rateCache: Record<string, { rate: number; ts: number }> = {}

async function fetchExchangeRate(from: string, to: string): Promise<number | null> {
  if (from === to) return 1
  const key = `${from}_${to}`
  const cached = rateCache[key]
  if (cached && Date.now() - cached.ts < 3600_000) return cached.rate

  try {
    const res = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from.toLowerCase()}.json`)
    if (!res.ok) return null
    const data = await res.json()
    const rate = data?.[from.toLowerCase()]?.[to.toLowerCase()]
    if (rate) {
      rateCache[key] = { rate, ts: Date.now() }
      return rate
    }
    return null
  } catch {
    return null
  }
}

const COUNTRY_CAPITAL_MAP: Record<string, { city: string; apiCountry: string }> = {
  FR: { city: 'Paris', apiCountry: 'France' },
  US: { city: 'New York', apiCountry: 'United States' },
  JP: { city: 'Tokyo', apiCountry: 'Japan' },
  CH: { city: 'Geneva', apiCountry: 'Switzerland' },
  CA: { city: 'Toronto', apiCountry: 'Canada' },
  DE: { city: 'Berlin', apiCountry: 'Germany' },
  GB: { city: 'London', apiCountry: 'United Kingdom' },
  ES: { city: 'Madrid', apiCountry: 'Spain' },
  IT: { city: 'Rome', apiCountry: 'Italy' },
  AU: { city: 'Sydney', apiCountry: 'Australia' },
  BE: { city: 'Brussels', apiCountry: 'Belgium' },
  NL: { city: 'Amsterdam', apiCountry: 'Netherlands' },
  PT: { city: 'Lisbon', apiCountry: 'Portugal' },
  SE: { city: 'Stockholm', apiCountry: 'Sweden' },
}

export default function BudgetTrackerWidget({ 
  housingBudget, 
  countryData,
  originCountryData,
  onEdit, 
  onHide,
  onResize,
  currentSize,
}: BudgetTrackerWidgetProps) {
  const { t } = useTranslation()
  const budget = parseFloat(housingBudget)
  const originCurrency = originCountryData?.currency || 'EUR'
  const destCode = countryData?.code || ''
  const capitalInfo = COUNTRY_CAPITAL_MAP[destCode]

  const { data: liveColData } = useQuery<CleanedCostOfLivingData>({
    queryKey: ['cost-of-living-widget', capitalInfo?.city, capitalInfo?.apiCountry],
    queryFn: () => costOfLivingApi.getCostOfLiving(capitalInfo!.city, capitalInfo!.apiCountry),
    enabled: !!capitalInfo,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  })

  const liveCurrency = liveColData?.currency?.code || countryData?.costOfLiving?.currency || countryData?.currency || 'EUR'
  const liveRent1 = liveColData?.categories?.housing?.rent?.oneBedroom?.cityCenter?.avg
  const liveRent3 = liveColData?.categories?.housing?.rent?.threeBedroom?.cityCenter?.avg
  const liveAvgSalary = liveColData?.summary?.averageSalary || countryData?.costOfLiving?.averageSalary || 0
  const isLiveData = !!liveColData

  const destCurrency = liveCurrency
  const sameCurrency = originCurrency === destCurrency

  const [exchangeRate, setExchangeRate] = useState<number | null>(sameCurrency ? 1 : null)

  useEffect(() => {
    if (sameCurrency) {
      setExchangeRate(1)
      return
    }
    fetchExchangeRate(originCurrency, destCurrency).then(r => setExchangeRate(r))
  }, [originCurrency, destCurrency, sameCurrency])

  const budgetInDest = exchangeRate ? Math.round(budget * exchangeRate) : null

  const rents = {
    oneBedroom: liveRent1 || countryData?.costOfLiving?.averageRent?.oneBedroom || 0,
    threeBedroom: liveRent3 || countryData?.costOfLiving?.averageRent?.threeBedroom || 0
  }

  const getCoverage = (rentPrice: number) => {
    if (!rentPrice || !budgetInDest) return 0
    return Math.min(100, Math.round((budgetInDest / rentPrice) * 100))
  }

  const oneBedroomCoverage = getCoverage(rents.oneBedroom)
  const threeBedroomCoverage = getCoverage(rents.threeBedroom)

  return (
    <Widget
      title={t('dashboard.personalized.widgets.budgetTracker.title')}
      subtitle={t('dashboard.personalized.widgets.budgetTracker.subtitle', { destination: countryData?.name || 'destination' })}
      icon={Wallet}
      iconColor="text-purple-600"
      onEdit={onEdit}
      onHide={onHide}
      onResize={onResize}
      currentSize={currentSize}
    >
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{budget.toLocaleString()}</span>
          <span className="text-lg font-medium text-gray-500">{originCurrency}</span>
        </div>
        <p className="text-sm text-gray-500">{t('dashboard.personalized.widgets.budgetTracker.monthlyBudget')}</p>
        
        {!sameCurrency && budgetInDest && (
          <div className="flex items-center gap-1.5 mt-2 text-sm text-blue-600">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>≈ {budgetInDest.toLocaleString()} {destCurrency}</span>
          </div>
        )}
      </div>

      {countryData?.costOfLiving ? (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">
                {t('dashboard.personalized.widgets.budgetTracker.apartment.oneBedroom', { 
                  price: rents.oneBedroom.toLocaleString(), 
                  currency: destCurrency 
                })}
              </span>
              <span className={`font-medium ${oneBedroomCoverage >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                {!budgetInDest
                  ? '—'
                  : oneBedroomCoverage >= 100 
                    ? t('dashboard.personalized.widgets.budgetTracker.covered') 
                    : t('dashboard.personalized.widgets.budgetTracker.coverage', { percentage: oneBedroomCoverage })}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${oneBedroomCoverage >= 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                style={{ width: `${budgetInDest ? oneBedroomCoverage : 0}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">
                {t('dashboard.personalized.widgets.budgetTracker.apartment.threeBedroom', { 
                  price: rents.threeBedroom.toLocaleString(), 
                  currency: destCurrency 
                })}
              </span>
              <span className={`font-medium ${threeBedroomCoverage >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                {!budgetInDest
                  ? '—'
                  : threeBedroomCoverage >= 100 
                    ? t('dashboard.personalized.widgets.budgetTracker.covered') 
                    : t('dashboard.personalized.widgets.budgetTracker.coverage', { percentage: threeBedroomCoverage })}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${threeBedroomCoverage >= 100 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${budgetInDest ? threeBedroomCoverage : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800 leading-relaxed">
              {!budgetInDest
                ? t('dashboard.personalized.widgets.budgetTracker.advice.tight')
                : budgetInDest >= rents.threeBedroom
                  ? t('dashboard.personalized.widgets.budgetTracker.advice.excellent')
                  : budgetInDest >= rents.oneBedroom
                    ? t('dashboard.personalized.widgets.budgetTracker.advice.good')
                    : t('dashboard.personalized.widgets.budgetTracker.advice.tight')}
            </p>
          </div>

          {liveAvgSalary > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">
                {t('dashboard.personalized.widgets.budgetTracker.avgSalary')}
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {liveAvgSalary.toLocaleString()} {destCurrency}
                <span className="text-xs font-normal text-gray-400 ml-1">/ {t('dashboard.personalized.widgets.jobOpportunities.month')}</span>
              </p>
            </div>
          )}

          <p className="text-[10px] text-gray-400 text-right mt-2">
            {isLiveData
              ? t('dashboard.personalized.widgets.budgetTracker.sourceLive', { city: capitalInfo?.city || '' })
              : t('dashboard.personalized.widgets.budgetTracker.sourceStatic')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <AlertCircle className="w-8 h-8 mb-2 text-gray-400" />
          <p className="text-sm">{t('dashboard.personalized.widgets.budgetTracker.noData.message')}</p>
        </div>
      )}
    </Widget>
  )
}