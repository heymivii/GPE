import { useMemo, useCallback } from 'react'
import {
  MapPin, DollarSign, Globe, TrendingUp, Lock,
  Thermometer, Receipt, Zap, Users, Home, Activity
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { EnrichedCountry } from '../hooks/useCountriesWithData'
import { ComparisonSection } from './ComparisonSection'
import { ComparisonRow } from './rows/ComparisonRow'
import { ComparisonRowWithBar } from './rows/ComparisonRowWithBar'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '../../../contexts/CurrencyContext'
import { useMigrationData } from '../hooks/useMigrationData'
import { getLocale, SUPPORTED_COUNTRIES } from '../../../data/supportedCountries'

interface ComparisonTableProps {
  countries: EnrichedCountry[]
  isAuthenticated?: boolean
  // Full pool of available destinations — used as the absolute reference scale for the radar.
  allDestinations?: EnrichedCountry[]
}


interface RadarDataPoint {
  label: string
  values: number[]
}

const RADAR_COLORS = ['#5EA3C0', '#F59E0B', '#10B981']

function RadarChart({ data, countryNames, colors }: {
  data: RadarDataPoint[]
  countryNames: string[]
  colors: string[]
}) {
  const cx = 150, cy = 150, R = 110
  const n = data.length
  if (n < 3) return null

  const angleStep = (2 * Math.PI) / n

  const point = (i: number, r: number) => {
    const angle = -Math.PI / 2 + i * angleStep
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  const gridLevels = [0.25, 0.5, 0.75, 1]

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="-60 -60 420 420"
        className="w-full max-w-md overflow-visible"
        role="img"
        aria-label={`Radar — ${countryNames.join(' / ')}`}
      >
        <title>{`Radar — ${countryNames.join(' / ')}`}</title>
        {gridLevels.map(level => (
          <polygon
            key={`grid-${level}`}
            points={Array.from({ length: n }, (_, i) => {
              const p = point(i, R * level)
              return `${p.x},${p.y}`
            }).join(' ')}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={level === 1 ? 1.5 : 0.8}
          />
        ))}
        {Array.from({ length: n }, (_, i) => {
          const p = point(i, R)
          return <line key={`axis-${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth={0.8} />
        })}
        {countryNames.map((_, ci) => {
          const pts = data.map((d, i) => {
            const r = (d.values[ci] / 100) * R
            const p = point(i, r)
            return `${p.x},${p.y}`
          }).join(' ')
          return (
            <polygon
              key={`area-${ci}`}
              points={pts}
              fill={colors[ci]}
              fillOpacity={0.15}
              stroke={colors[ci]}
              strokeWidth={2}
            />
          )
        })}
        {countryNames.map((_, ci) =>
          data.map((d, i) => {
            const r = (d.values[ci] / 100) * R
            const p = point(i, r)
            return <circle key={`dot-${ci}-${i}`} cx={p.x} cy={p.y} r={3} fill={colors[ci]} />
          })
        )}
        {data.map((d, i) => {
          const p = point(i, R + 30)
          return (
            <text
              key={`label-${i}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs sm:text-sm fill-gray-500 font-medium"
            >
              {d.label}
            </text>
          )
        })}
      </svg>

      <div className="flex gap-4 mt-2 flex-wrap justify-center">
        {countryNames.map((name, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] }} />
            <span className="text-xs font-medium text-gray-600">{name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}




export default function ComparisonTable({ countries, isAuthenticated = true, allDestinations = [] }: ComparisonTableProps) {
  const { t, i18n } = useTranslation()
  const { displaySymbol, convert } = useCurrency()
  const { getByIso2 } = useMigrationData()
  const colClass = countries.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
  const locale = getLocale(i18n.language)

  const td = useCallback((category: string, value: string | undefined): string => {
    if (!value) return t('comparison.fields.notSpecified')
    const key = `comparison.data.${category}.${value}`
    const result = t(key, { defaultValue: '' })
    return result || value
  }, [t])

  const tdLangs = useCallback((raw: string | undefined): string => {
    if (!raw) return t('comparison.fields.notSpecified')
    return raw.split(', ').map(lang => {
      const key = `comparison.data.languages.${lang.trim()}`
      const result = t(key, { defaultValue: '' })
      return result || lang.trim()
    }).join(', ')
  }, [t])

  const tdBestFor = useCallback((items: string[] | undefined): string => {
    if (!items || items.length === 0) return t('comparison.fields.notSpecified')
    return items.map(item => {
      const key = `comparison.data.bestFor.${item}`
      const result = t(key, { defaultValue: '' })
      return result || item
    }).join(', ')
  }, [t])

  const tdByCode = useCallback((category: string, code: string | undefined): string => {
    if (!code) return t('comparison.fields.notSpecified')
    const key = `comparison.data.${category}.${code}`
    const result = t(key, { defaultValue: '' })
    return result || t('comparison.fields.notSpecified')
  }, [t])

  const tdCountryName = useCallback((country: EnrichedCountry): string => {
    if (country.isCity) return country.countryName
    if (!country.isoCode) return country.countryName
    const sc = SUPPORTED_COUNTRIES.find(c => c.code === country.isoCode)
    if (!sc) return country.countryName
    return t(sc.i18nKey, { defaultValue: country.countryName })
  }, [t])

  const convertAmount = useCallback((amount: number | undefined | null, country: EnrichedCountry): number | null => {
    if (amount == null) return null
    const src = country.sourceCurrencyCode || country.currency || 'EUR'
    return convert(amount, src)
  }, [convert])

  const fmt = useCallback((amount: number | undefined | null, country: EnrichedCountry): string => {
    if (amount == null) return t('comparison.fields.notSpecified')
    const converted = convertAmount(amount, country)
    if (converted == null) {
      return `${amount.toLocaleString(locale)} ${country.currency || ''}`
    }
    return `${Math.round(converted).toLocaleString(locale)} ${displaySymbol}`
  }, [convertAmount, displaySymbol, locale, t])

  const fmtNum = useCallback((value: number | undefined | null): string => {
    if (value == null) return t('comparison.fields.notSpecified')
    return value.toLocaleString(locale)
  }, [locale, t])

  // Property-investment formatters (ratios, percentages, GDP→display currency).
  const pi = (c: EnrichedCountry) => c.propertyInvestment
  const qol = (c: EnrichedCountry) => c.qualityOfLife
  const fmtIndex = (v: number | null | undefined): string =>
    v == null ? t('comparison.fields.notSpecified') : v.toLocaleString(locale)
  const fmtRatio = (v: number | null | undefined): string =>
    v == null ? t('comparison.fields.notSpecified') : v.toLocaleString(locale)
  const fmtPct = (v: number | null | undefined): string =>
    v == null ? t('comparison.fields.notSpecified') : `${v.toLocaleString(locale)} %`
  const fmtGdp = (v: number | null | undefined): string => {
    if (v == null) return t('comparison.fields.notSpecified')
    const converted = convert(v, 'USD')
    return converted == null
      ? `${v.toLocaleString(locale)} $`
      : `${Math.round(converted).toLocaleString(locale)} ${displaySymbol}`
  }

  const radarData = useMemo<RadarDataPoint[]>(() => {
    // Absolute reference: all available destinations of the SAME type (cities vs
    // countries) as the current selection — so each axis reflects a destination's
    // real standing across the whole dataset, not just a relative duel.
    const sel0 = countries[0]
    const basePool = allDestinations.length ? allDestinations : countries
    const pool = sel0 ? basePool.filter(c => c.isCity === sel0.isCity) : basePool

    const refMax = (pick: (c: EnrichedCountry) => number | undefined | null): number => {
      const vals = pool.map(c => convertAmount(pick(c), c) ?? 0).filter(v => v > 0)
      return vals.length ? Math.max(...vals) : 0
    }
    const refSalary = refMax(c => c.costOfLiving?.averageSalary)
    const refRent = refMax(c => c.costOfLiving?.averageRent?.oneBedroom)
    const refFood = refMax(c => c.costOfLiving?.food?.restaurantMeal)
    const refTransport = refMax(c => c.costOfLiving?.transportMonthly)

    // Consistent 0–100 scaling against the absolute reference max.
    const higher = (v: number, ref: number) => (ref ? Math.min(v / ref, 1) * 100 : 0) // more = better (salary)
    const lower = (v: number, ref: number) => (ref ? (1 - Math.min(v / ref, 1)) * 100 : 0) // less = better (cost)

    const sal = (c: EnrichedCountry) => convertAmount(c.costOfLiving?.averageSalary, c) ?? 0
    const rent = (c: EnrichedCountry) => convertAmount(c.costOfLiving?.averageRent?.oneBedroom, c) ?? 0
    const food = (c: EnrichedCountry) => convertAmount(c.costOfLiving?.food?.restaurantMeal, c) ?? 0
    const transport = (c: EnrichedCountry) => convertAmount(c.costOfLiving?.transportMonthly, c) ?? 0

    return [
      {
        label: t('comparison.radar.salary', { defaultValue: 'Salaire' }),
        values: countries.map(c => higher(sal(c), refSalary)),
      },
      {
        label: t('comparison.radar.affordability', { defaultValue: 'Logement' }),
        values: countries.map(c => lower(rent(c), refRent)),
      },
      {
        label: t('comparison.radar.food', { defaultValue: 'Nourriture' }),
        values: countries.map(c => lower(food(c), refFood)),
      },
      {
        label: t('comparison.radar.transport', { defaultValue: 'Transport' }),
        values: countries.map(c => lower(transport(c), refTransport)),
      },
    ]
  }, [countries, allDestinations, t, convertAmount])

  return (
    <div className="space-y-8">
      {/* Mobile-only sticky header: keeps each column's country identity visible while scrolling the long table. */}
      <div className="sm:hidden sticky top-16 z-20 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] -mx-4 px-4 py-3">
        <div className={`grid gap-3 ${colClass}`}>
          {countries.map((country, idx) => (
            <div key={country.uniqueId} className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg overflow-hidden shadow-sm ring-1 ring-gray-900/5 bg-white p-0.5 flex-shrink-0">
                <div className="w-full h-full rounded-md overflow-hidden">
                  {country.flagUrl ? (
                    <img src={country.flagUrl} alt={country.countryName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-sm">
                      {country.flagEmoji || '🌍'}
                    </div>
                  )}
                </div>
              </div>
              <span
                className="w-2 h-2 rounded-full flex-shrink-0 ring-2 ring-white"
                style={{ backgroundColor: RADAR_COLORS[idx] }}
              />
              <span className="font-bold text-xs text-gray-900 truncate">{tdCountryName(country)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden sm:block sticky top-16 md:top-20 z-20 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] py-4 sm:py-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-all overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] lg:grid-cols-[200px_1fr] gap-4 sm:gap-8 max-w-7xl mx-auto items-end min-w-0 px-4 sm:px-8">
          <div className="hidden sm:block pb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            {t('comparison.tableHeader')}
          </div>
          <div className={`grid gap-4 sm:gap-8 ${colClass}`}>
            {countries.map((country, idx) => (
              <div key={country.uniqueId} className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm ring-1 ring-gray-900/5 bg-white p-0.5">
                    <div className="w-full h-full rounded-lg sm:rounded-xl overflow-hidden">
                      {country.flagUrl ? (
                        <img src={country.flagUrl} alt={country.countryName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-lg">
                          {country.flagEmoji || '🌍'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: RADAR_COLORS[idx] }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-xl text-gray-900 tracking-tight leading-tight sm:leading-none mb-0 sm:mb-1 truncate">
                    {tdCountryName(country)}
                  </h3>
                  <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                    {td('continents', country.continent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-1.5 sm:p-2 bg-white rounded-lg text-[#5EA3C0] shadow-sm border border-gray-100">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{t('comparison.sections.overview')}</h3>
        </div>
        <RadarChart
          data={radarData}
          countryNames={countries.map(c => tdCountryName(c))}
          colors={RADAR_COLORS.slice(0, countries.length)}
        />
      </div>

      <ComparisonSection
        title={t('comparison.sections.general')}
        icon={<Globe className="w-5 h-5" />}
      >
        <ComparisonRow countries={countries}
          label={t('comparison.fields.continent')}
          values={countries.map(c => td('continents', c.continent))}
          colClass={colClass}
        />
        <ComparisonRow countries={countries}
          label={t('comparison.fields.capital')}
          values={countries.map(c => td('capitals', c.capital))}
          colClass={colClass}
        />
        <ComparisonRow countries={countries}
          label={t('comparison.fields.languages')}
          values={countries.map(c => tdLangs(c.languages))}
          colClass={colClass}
        />
        <ComparisonRow countries={countries}
          label={t('comparison.fields.currency')}
          values={countries.map(c => c.currency || t('comparison.fields.notSpecifiedFeminine'))}
          colClass={colClass}
        />
      </ComparisonSection>

      {isAuthenticated ? (
        <>
          <ComparisonSection
            title={t('comparison.sections.costOfLiving')}
            icon={<DollarSign className="w-5 h-5" />}
          >
            <ComparisonRowWithBar countries={countries}
              label={t('comparison.fields.averageSalary')}
              values={countries.map(c => ({
                raw: convertAmount(c.costOfLiving?.averageSalary, c),
                display: fmt(c.costOfLiving?.averageSalary, c),
              }))}
              highlightBest="highest"
              colClass={colClass}
              colors={RADAR_COLORS}
            />
            <ComparisonRowWithBar countries={countries}
              label={t('comparison.fields.rentOneRoom')}
              values={countries.map(c => ({
                raw: convertAmount(c.costOfLiving?.averageRent?.oneBedroom, c),
                display: fmt(c.costOfLiving?.averageRent?.oneBedroom, c),
              }))}
              highlightBest="lowest"
              colClass={colClass}
              colors={RADAR_COLORS}
            />
            <ComparisonRowWithBar countries={countries}
              label={t('comparison.fields.rentThreeRooms')}
              values={countries.map(c => ({
                raw: convertAmount(c.costOfLiving?.averageRent?.threeBedroom, c),
                display: fmt(c.costOfLiving?.averageRent?.threeBedroom, c),
              }))}
              highlightBest="lowest"
              colClass={colClass}
              colors={RADAR_COLORS}
            />
            <ComparisonRowWithBar countries={countries}
              label={t('comparison.fields.restaurantMeal')}
              values={countries.map(c => ({
                raw: convertAmount(c.costOfLiving?.food?.restaurantMeal, c),
                display: fmt(c.costOfLiving?.food?.restaurantMeal, c),
              }))}
              highlightBest="lowest"
              colClass={colClass}
              colors={RADAR_COLORS}
            />
            <ComparisonRowWithBar countries={countries}
              label={t('comparison.fields.groceries')}
              values={countries.map(c => ({
                raw: convertAmount(c.costOfLiving?.food?.groceriesWeekly, c),
                display: fmt(c.costOfLiving?.food?.groceriesWeekly, c),
              }))}
              highlightBest="lowest"
              colClass={colClass}
              colors={RADAR_COLORS}
            />
            <ComparisonRowWithBar countries={countries}
              label={t('comparison.fields.utilities')}
              values={countries.map(c => ({
                raw: convertAmount(c.costOfLiving?.utilities, c),
                display: fmt(c.costOfLiving?.utilities, c),
              }))}
              highlightBest="lowest"
              colClass={colClass}
              colors={RADAR_COLORS}
            />
            <ComparisonRowWithBar countries={countries}
              label={t('comparison.fields.transport')}
              values={countries.map(c => ({
                raw: convertAmount(c.costOfLiving?.transportMonthly, c),
                display: fmt(c.costOfLiving?.transportMonthly, c),
              }))}
              highlightBest="lowest"
              colClass={colClass}
              colors={RADAR_COLORS}
            />
          </ComparisonSection>

          {!countries.every(c => c.isCity) && (
            <>

              <ComparisonSection
                title={t('comparison.sections.climate')}
                icon={<Thermometer className="w-5 h-5" />}
              >
                <ComparisonRow countries={countries}
                  label={t('comparison.fields.climateType')}
                  values={countries.map(c => {
                    const text = tdByCode('climateType', c.isoCode)
                    return text.length > 60 ? text.slice(0, 57) + '…' : text
                  })}
                  colClass={colClass}
                />
                <ComparisonRow countries={countries}
                  label={t('comparison.fields.tempSummer')}
                  values={countries.map(c => c.climate?.averageTemp?.summer || t('comparison.fields.notSpecified'))}
                  colClass={colClass}
                />
                <ComparisonRow countries={countries}
                  label={t('comparison.fields.tempWinter')}
                  values={countries.map(c => c.climate?.averageTemp?.winter || t('comparison.fields.notSpecified'))}
                  colClass={colClass}
                />
              </ComparisonSection>

              <ComparisonSection
                title={t('comparison.sections.taxation')}
                icon={<Receipt className="w-5 h-5" />}
              >
                <ComparisonRow countries={countries}
                  label={t('comparison.fields.incomeTax')}
                  values={countries.map(c => c.taxation?.incomeTaxRange || t('comparison.fields.notSpecified'))}
                  colClass={colClass}
                />
                <ComparisonRow countries={countries}
                  label={t('comparison.fields.vat')}
                  values={countries.map(c => c.taxation?.vat || t('comparison.fields.notSpecified'))}
                  colClass={colClass}
                />
              </ComparisonSection>

              <ComparisonSection
                title={t('comparison.sections.property', { defaultValue: 'Immobilier & Investissement' })}
                icon={<Home className="w-5 h-5" />}
              >
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.priceToIncome', { defaultValue: 'Prix / revenu' })}
                  values={countries.map(c => ({ raw: pi(c)?.priceToIncomeRatio ?? null, display: fmtRatio(pi(c)?.priceToIncomeRatio) }))}
                  highlightBest="lowest"
                  colClass={colClass}
                  colors={RADAR_COLORS}
                />
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.grossRentalYield', { defaultValue: 'Rendement locatif brut (centre)' })}
                  values={countries.map(c => ({ raw: pi(c)?.grossRentalYieldCityCentre ?? null, display: fmtPct(pi(c)?.grossRentalYieldCityCentre) }))}
                  highlightBest="highest"
                  colClass={colClass}
                  colors={RADAR_COLORS}
                />
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.mortgagePctIncome', { defaultValue: 'Crédit / revenu' })}
                  values={countries.map(c => ({ raw: pi(c)?.mortgageAsPctIncome ?? null, display: fmtPct(pi(c)?.mortgageAsPctIncome) }))}
                  highlightBest="lowest"
                  colClass={colClass}
                  colors={RADAR_COLORS}
                />
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.loanAffordability', { defaultValue: "Indice d'accessibilité au crédit" })}
                  values={countries.map(c => ({ raw: pi(c)?.loanAffordabilityIndex ?? null, display: fmtRatio(pi(c)?.loanAffordabilityIndex) }))}
                  highlightBest="highest"
                  colClass={colClass}
                  colors={RADAR_COLORS}
                />
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.priceToRent', { defaultValue: 'Prix / loyer (centre)' })}
                  values={countries.map(c => ({ raw: pi(c)?.priceToRentCityCentre ?? null, display: fmtRatio(pi(c)?.priceToRentCityCentre) }))}
                  highlightBest="lowest"
                  colClass={colClass}
                  colors={RADAR_COLORS}
                />
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.gdpPerCapita', { defaultValue: 'PIB par habitant' })}
                  values={countries.map(c => ({ raw: pi(c)?.gdpPerCapita ?? null, display: fmtGdp(pi(c)?.gdpPerCapita) }))}
                  highlightBest="highest"
                  colClass={colClass}
                  colors={RADAR_COLORS}
                />
                <ComparisonRow countries={countries}
                  label={t('comparison.fields.gdpGrowth', { defaultValue: 'Croissance du PIB' })}
                  values={countries.map(c => fmtPct(pi(c)?.gdpGrowthRate))}
                  colClass={colClass}
                />
                <ComparisonRow countries={countries}
                  label={t('comparison.fields.populationGrowth', { defaultValue: 'Croissance démographique' })}
                  values={countries.map(c => fmtPct(pi(c)?.populationGrowthRate))}
                  colClass={colClass}
                />

                <div className="px-4 sm:px-8 py-3 bg-gray-50/50 border-t border-gray-100">
                  <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5" />
                    {t('comparison.numbeoPropertySource', { defaultValue: 'Source : Numbeo (property investment) — indicateurs au niveau pays.' })}
                  </p>
                </div>
              </ComparisonSection>

              <ComparisonSection
                title={t('comparison.sections.qualityOfLife', { defaultValue: 'Qualité de vie' })}
                icon={<Activity className="w-5 h-5" />}
              >
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.qualityOfLifeIndex', { defaultValue: 'Indice qualité de vie' })}
                  values={countries.map(c => ({ raw: qol(c)?.qualityOfLife ?? null, display: fmtIndex(qol(c)?.qualityOfLife) }))}
                  highlightBest="highest" colClass={colClass} colors={RADAR_COLORS}
                />
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.purchasingPower', { defaultValue: "Pouvoir d'achat" })}
                  values={countries.map(c => ({ raw: qol(c)?.purchasingPower ?? null, display: fmtIndex(qol(c)?.purchasingPower) }))}
                  highlightBest="highest" colClass={colClass} colors={RADAR_COLORS}
                />
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.safetyIndex', { defaultValue: 'Sécurité' })}
                  values={countries.map(c => ({ raw: qol(c)?.safety ?? null, display: fmtIndex(qol(c)?.safety) }))}
                  highlightBest="highest" colClass={colClass} colors={RADAR_COLORS}
                />
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.healthCareIndex', { defaultValue: 'Santé' })}
                  values={countries.map(c => ({ raw: qol(c)?.healthCare ?? null, display: fmtIndex(qol(c)?.healthCare) }))}
                  highlightBest="highest" colClass={colClass} colors={RADAR_COLORS}
                />
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.pollutionIndex', { defaultValue: 'Pollution' })}
                  values={countries.map(c => ({ raw: qol(c)?.pollution ?? null, display: fmtIndex(qol(c)?.pollution) }))}
                  highlightBest="lowest" colClass={colClass} colors={RADAR_COLORS}
                />
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.climateIndex', { defaultValue: 'Climat' })}
                  values={countries.map(c => ({ raw: qol(c)?.climate ?? null, display: fmtIndex(qol(c)?.climate) }))}
                  highlightBest="highest" colClass={colClass} colors={RADAR_COLORS}
                />
                <div className="px-4 sm:px-8 py-3 bg-gray-50/50 border-t border-gray-100">
                  <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    {t('comparison.numbeoQolSource', { defaultValue: 'Source : Numbeo (quality of life) — indices au niveau pays.' })}
                  </p>
                </div>
              </ComparisonSection>

              <ComparisonSection
                title={t('comparison.sections.immigration')}
                icon={<MapPin className="w-5 h-5" />}
              >
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.stocksForeignPop')}
                  values={countries.map(c => {
                    const m = getByIso2(c.isoCode)
                    const v = m?.stocksForeignPop?.value
                    return {
                      raw: v ?? null,
                      display: v != null
                        ? `${fmtNum(v)} (${m?.stocksForeignPop?.year})`
                        : t('comparison.fields.notSpecified'),
                    }
                  })}
                  highlightBest="highest"
                  colClass={colClass}
                  colors={RADAR_COLORS}
                />
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.inflowsForeignPop')}
                  values={countries.map(c => {
                    const m = getByIso2(c.isoCode)
                    const v = m?.inflowsForeignPop?.value
                    return {
                      raw: v ?? null,
                      display: v != null
                        ? `${fmtNum(v)} (${m?.inflowsForeignPop?.year})`
                        : t('comparison.fields.notSpecified'),
                    }
                  })}
                  highlightBest="highest"
                  colClass={colClass}
                  colors={RADAR_COLORS}
                />
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.outflowsForeignPop')}
                  values={countries.map(c => {
                    const m = getByIso2(c.isoCode)
                    const v = m?.outflowsForeignPop?.value
                    return {
                      raw: v ?? null,
                      display: v != null
                        ? `${fmtNum(v)} (${m?.outflowsForeignPop?.year})`
                        : t('comparison.fields.notSpecified'),
                    }
                  })}
                  colClass={colClass}
                  colors={RADAR_COLORS}
                />
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.asylumSeekers')}
                  values={countries.map(c => {
                    const m = getByIso2(c.isoCode)
                    const v = m?.asylumSeekers?.value
                    return {
                      raw: v ?? null,
                      display: v != null
                        ? `${fmtNum(v)} (${m?.asylumSeekers?.year})`
                        : t('comparison.fields.notSpecified'),
                    }
                  })}
                  colClass={colClass}
                  colors={RADAR_COLORS}
                />
                <ComparisonRowWithBar countries={countries}
                  label={t('comparison.fields.nationalityAcquisitions')}
                  values={countries.map(c => {
                    const m = getByIso2(c.isoCode)
                    const v = m?.nationalityAcquisitions?.value
                    return {
                      raw: v ?? null,
                      display: v != null
                        ? `${fmtNum(v)} (${m?.nationalityAcquisitions?.year})`
                        : t('comparison.fields.notSpecified'),
                    }
                  })}
                  highlightBest="highest"
                  colClass={colClass}
                  colors={RADAR_COLORS}
                />

                <ComparisonRow countries={countries}
                  label={t('comparison.fields.steps')}
                  values={countries.map(c => {
                    const stepsCount = c.expatProjectTemplate?.steps?.length
                    return stepsCount ? t('comparison.fields.stepsValue', { count: stepsCount }) : t('comparison.fields.notSpecified')
                  })}
                  colClass={colClass}
                />
                <ComparisonRow countries={countries}
                  label={t('comparison.fields.difficulty')}
                  values={countries.map(c =>
                    td('visaDifficulty', c.recommendations?.visaDifficulty)
                  )}
                  colClass={colClass}
                />
                <ComparisonRow countries={countries}
                  label={t('comparison.fields.languageRequired')}
                  values={countries.map(c =>
                    td('languageRequired', c.recommendations?.language)
                  )}
                  colClass={colClass}
                />

                <div className="px-4 sm:px-8 py-3 bg-gray-50/50 border-t border-gray-100">
                  <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {t('comparison.oecdSource')}
                  </p>
                </div>
              </ComparisonSection>

              <ComparisonSection
                title={t('comparison.sections.idealFor')}
                icon={<TrendingUp className="w-5 h-5" />}
              >
                <ComparisonRow countries={countries}
                  label={t('comparison.fields.recommendedProfiles')}
                  values={countries.map(c =>
                    tdBestFor(c.recommendations?.bestFor)
                  )}
                  colClass={colClass}
                />
              </ComparisonSection>
            </>
          )}
        </>
      ) : (
        <PremiumGate />
      )}
    </div>
  )
}

function PremiumGate() {
  const { t } = useTranslation()
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/5 mt-8">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#5EA3C0]/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gray-50 rounded-full blur-3xl opacity-50" />

      <div className="relative p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-3xl bg-[#5EA3C0] text-white shadow-lg shadow-[#5EA3C0]/30 transform rotate-3 hover:rotate-6 transition-transform duration-300">
          <Lock className="w-10 h-10" />
        </div>

        <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          {t('comparison.premiumAccess.title')}
        </h3>

        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t('comparison.premiumAccess.description')}
        </p>

        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10 text-left">
          {[
            t('comparison.premiumAccess.benefits.procedures'),
            t('comparison.premiumAccess.benefits.difficulty'),
            t('comparison.premiumAccess.benefits.recommendations'),
            t('comparison.premiumAccess.benefits.unlimited', { max: 5 })
          ].map((benefit, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#5EA3C0]/10 text-[#5EA3C0] flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/auth/register"
            className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 shadow-xl shadow-gray-900/20"
          >
            {t('comparison.premiumAccess.createAccount')}
          </Link>
          <Link
            to="/auth/login"
            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all hover:border-[#5EA3C0] hover:text-[#5EA3C0]"
          >
            {t('comparison.premiumAccess.login')}
          </Link>
        </div>

        <p className="mt-8 text-sm font-medium text-gray-400">
          {t('comparison.premiumAccess.footer')}
        </p>
      </div>
    </div>
  )
}




