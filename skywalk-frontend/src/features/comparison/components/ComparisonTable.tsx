import { useMemo, useCallback } from 'react'
import { 
  MapPin, DollarSign, Globe, TrendingUp, Trophy, Lock,
  Heart, Thermometer, Receipt, Zap, ArrowRightLeft, Users
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { EnrichedCountry } from '../hooks/useCountriesWithData'
import { useTranslation } from 'react-i18next'
import { useCurrency, DISPLAY_CURRENCIES } from '../../../contexts/CurrencyContext'
import { useMigrationData } from '../hooks/useMigrationData'
import { getLocale } from '../../../data/supportedCountries'

interface ComparisonTableProps {
  countries: EnrichedCountry[]
  isAuthenticated?: boolean
}

/* ─────────────── Radar / Spider chart (SVG) ─────────────── */

interface RadarDataPoint {
  label: string
  /** 0–100 normalised score */
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
      <svg viewBox="0 0 300 300" className="w-full max-w-xs">
        {gridLevels.map(level => (
          <polygon
            key={level}
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
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth={0.8} />
        })}
        {countryNames.map((_, ci) => {
          const pts = data.map((d, i) => {
            const r = (d.values[ci] / 100) * R
            const p = point(i, r)
            return `${p.x},${p.y}`
          }).join(' ')
          return (
            <polygon
              key={ci}
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
            return <circle key={`${ci}-${i}`} cx={p.x} cy={p.y} r={3} fill={colors[ci]} />
          })
        )}
        {data.map((d, i) => {
          const p = point(i, R + 22)
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-gray-500 font-medium"
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

/* ─────────────── Visual Bar ─────────────── */

function ValueBar({ value, max, color = '#5EA3C0' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-1.5">
      <div
        className="h-2 rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

/* ─────────────── Score Badge ─────────────── */

function ScoreBadge({ score }: { score: string }) {
  const m = score.match(/(\d+)/)
  const num = m ? parseInt(m[1]) : 0
  const pct = (num / 10) * 100
  const color = pct >= 80 ? 'text-emerald-600 bg-emerald-50 ring-emerald-200' :
                pct >= 60 ? 'text-amber-600 bg-amber-50 ring-amber-200' :
                            'text-red-500 bg-red-50 ring-red-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold ring-1 ${color}`}>
      {score}
    </span>
  )
}

/* ─────────────── Main Table Component ─────────────── */

export default function ComparisonTable({ countries, isAuthenticated = true }: ComparisonTableProps) {
  const { t, i18n } = useTranslation()
  const { displayCurrency, setDisplayCurrency, displaySymbol, convert } = useCurrency()
  const { getByIso2 } = useMigrationData()
  const colClass = countries.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
  const locale = getLocale(i18n.language)

  /** Convert an amount from a country's source currency to the user's display currency */
  const convertAmount = useCallback((amount: number | undefined | null, country: EnrichedCountry): number | null => {
    if (amount == null) return null
    const src = country.sourceCurrencyCode || country.currency || 'EUR'
    const rates = country.exchangeRates
    return convert(amount, src, rates)
  }, [convert])

  /** Format a converted price with the global display symbol */
  const fmt = useCallback((amount: number | undefined | null, country: EnrichedCountry): string => {
    if (amount == null) return t('comparison.fields.notSpecified')
    const converted = convertAmount(amount, country)
    if (converted == null) {
      // Fallback: show raw with original currency
      return `${amount.toLocaleString(locale)} ${country.currency || ''}`
    }
    return `${Math.round(converted).toLocaleString(locale)} ${displaySymbol}`
  }, [convertAmount, displaySymbol, locale, t])

  /** Format large numbers with locale (e.g. 1 176 050) */
  const fmtNum = useCallback((value: number | undefined | null): string => {
    if (value == null) return t('comparison.fields.notSpecified')
    return value.toLocaleString(locale)
  }, [locale, t])

  // Build radar chart data (using CONVERTED values for fair comparison)
  const radarData = useMemo<RadarDataPoint[]>(() => {
    const convertedSalaries = countries.map(c => convertAmount(c.costOfLiving?.averageSalary, c) ?? 0)
    const convertedRents = countries.map(c => convertAmount(c.costOfLiving?.averageRent?.oneBedroom, c) ?? 0)
    const maxSalary = Math.max(...convertedSalaries)
    const maxRent = Math.max(...convertedRents)

    const parseRating = (s?: string) => {
      const m = s?.match(/(\d+)/)
      return m ? parseInt(m[1]) : 0
    }

    return [
      {
        label: t('comparison.radar.salary'),
        values: convertedSalaries.map(s => maxSalary ? (s / maxSalary) * 100 : 0)
      },
      {
        label: t('comparison.radar.safety'),
        values: countries.map(c => parseRating(c.lifestyle?.safetyRating) * 10)
      },
      {
        label: t('comparison.radar.healthcare'),
        values: countries.map(c => parseRating(c.healthcare?.qualityRating) * 10)
      },
      {
        label: t('comparison.radar.affordability'),
        values: convertedRents.map(r => maxRent
          ? (1 - r / maxRent) * 80 + 20
          : 50
        )
      },
      {
        label: t('comparison.radar.workLife'),
        values: countries.map(c => {
          const wlb = c.lifestyle?.workLifeBalance?.toLowerCase()
          if (wlb === 'excellent') return 95
          if (wlb === 'bon' || wlb === 'good') return 75
          if (wlb === 'moyen' || wlb === 'average') return 55
          return 50
        })
      },
    ]
  }, [countries, t, convertAmount])

  return (
    <div className="space-y-8">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] py-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-all">
        <div className="grid grid-cols-[200px_1fr] gap-8 max-w-7xl mx-auto items-end">
          <div className="pb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            {t('comparison.tableHeader')}
          </div>
          <div className={`grid gap-8 ${colClass}`}>
            {countries.map((country, idx) => (
              <div key={country.idCountry} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm ring-1 ring-gray-900/5 bg-white p-0.5">
                    <div className="w-full h-full rounded-xl overflow-hidden">
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
                <div>
                  <h3 className="font-bold text-xl text-gray-900 tracking-tight leading-none mb-1">
                    {country.countryName}
                  </h3>
                  <span className="text-sm text-gray-500 font-medium">
                    {country.continent}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <ArrowRightLeft className="w-4 h-4" />
          <span>{t('comparison.currencyLabel')}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DISPLAY_CURRENCIES.map(cur => (
            <button
              key={cur.code}
              onClick={() => setDisplayCurrency(cur.code)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                displayCurrency === cur.code
                  ? 'bg-[#5EA3C0] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cur.symbol} {cur.code}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white rounded-lg text-[#5EA3C0] shadow-sm border border-gray-100">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{t('comparison.sections.overview')}</h3>
        </div>
        <RadarChart
          data={radarData}
          countryNames={countries.map(c => c.countryName)}
          colors={RADAR_COLORS.slice(0, countries.length)}
        />
      </div>

      <ComparisonSection
        title={t('comparison.sections.general')}
        icon={<Globe className="w-5 h-5" />}
      >
        <ComparisonRow
          label={t('comparison.fields.continent')}
          values={countries.map(c => c.continent || t('comparison.fields.notSpecified'))}
          colClass={colClass}
        />
        <ComparisonRow
          label={t('comparison.fields.capital')}
          values={countries.map(c => c.capital || t('comparison.fields.notSpecifiedFeminine'))}
          colClass={colClass}
        />
        <ComparisonRow
          label={t('comparison.fields.languages')}
          values={countries.map(c => c.languages || t('comparison.fields.notSpecified'))}
          colClass={colClass}
        />
        <ComparisonRow
          label={t('comparison.fields.currency')}
          values={countries.map(c => c.currency || t('comparison.fields.notSpecifiedFeminine'))}
          colClass={colClass}
        />
      </ComparisonSection>

      <ComparisonSection
        title={t('comparison.sections.costOfLiving')}
        icon={<DollarSign className="w-5 h-5" />}
      >
        <ComparisonRowWithBar
          label={t('comparison.fields.averageSalary')}
          values={countries.map(c => ({
            raw: convertAmount(c.costOfLiving?.averageSalary, c),
            display: fmt(c.costOfLiving?.averageSalary, c),
          }))}
          highlightBest="highest"
          colClass={colClass}
          colors={RADAR_COLORS}
        />
        <ComparisonRowWithBar
          label={t('comparison.fields.rentOneRoom')}
          values={countries.map(c => ({
            raw: convertAmount(c.costOfLiving?.averageRent?.oneBedroom, c),
            display: fmt(c.costOfLiving?.averageRent?.oneBedroom, c),
          }))}
          highlightBest="lowest"
          colClass={colClass}
          colors={RADAR_COLORS}
        />
        <ComparisonRowWithBar
          label={t('comparison.fields.rentThreeRooms')}
          values={countries.map(c => ({
            raw: convertAmount(c.costOfLiving?.averageRent?.threeBedroom, c),
            display: fmt(c.costOfLiving?.averageRent?.threeBedroom, c),
          }))}
          highlightBest="lowest"
          colClass={colClass}
          colors={RADAR_COLORS}
        />
        <ComparisonRowWithBar
          label={t('comparison.fields.restaurantMeal')}
          values={countries.map(c => ({
            raw: convertAmount(c.costOfLiving?.food?.restaurantMeal, c),
            display: fmt(c.costOfLiving?.food?.restaurantMeal, c),
          }))}
          highlightBest="lowest"
          colClass={colClass}
          colors={RADAR_COLORS}
        />
        <ComparisonRowWithBar
          label={t('comparison.fields.groceries')}
          values={countries.map(c => ({
            raw: convertAmount(c.costOfLiving?.food?.groceriesWeekly, c),
            display: fmt(c.costOfLiving?.food?.groceriesWeekly, c),
          }))}
          highlightBest="lowest"
          colClass={colClass}
          colors={RADAR_COLORS}
        />
        <ComparisonRowWithBar
          label={t('comparison.fields.utilities')}
          values={countries.map(c => ({
            raw: convertAmount(c.costOfLiving?.utilities, c),
            display: fmt(c.costOfLiving?.utilities, c),
          }))}
          highlightBest="lowest"
          colClass={colClass}
          colors={RADAR_COLORS}
        />
        <ComparisonRowWithBar
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

      <ComparisonSection
        title={t('comparison.sections.qualityOfLife')}
        icon={<Heart className="w-5 h-5" />}
      >
        <ComparisonRowScore
          label={t('comparison.fields.safety')}
          values={countries.map(c => c.lifestyle?.safetyRating)}
          colClass={colClass}
        />
        <ComparisonRowScore
          label={t('comparison.fields.healthcareQuality')}
          values={countries.map(c => c.healthcare?.qualityRating)}
          colClass={colClass}
        />
        <ComparisonRow
          label={t('comparison.fields.healthcareSystem')}
          values={countries.map(c => {
            const text = c.healthcare?.system || ''
            return text.length > 80 ? text.slice(0, 77) + '…' : text || t('comparison.fields.notSpecified')
          })}
          colClass={colClass}
        />
        <ComparisonRow
          label={t('comparison.fields.workLifeBalance')}
          values={countries.map(c => c.lifestyle?.workLifeBalance || t('comparison.fields.notSpecified'))}
          colClass={colClass}
        />
      </ComparisonSection>

      <ComparisonSection
        title={t('comparison.sections.climate')}
        icon={<Thermometer className="w-5 h-5" />}
      >
        <ComparisonRow
          label={t('comparison.fields.climateType')}
          values={countries.map(c => {
            const text = c.climate?.type || ''
            return text.length > 60 ? text.slice(0, 57) + '…' : text || t('comparison.fields.notSpecified')
          })}
          colClass={colClass}
        />
        <ComparisonRow
          label={t('comparison.fields.tempSummer')}
          values={countries.map(c => c.climate?.averageTemp?.summer || t('comparison.fields.notSpecified'))}
          colClass={colClass}
        />
        <ComparisonRow
          label={t('comparison.fields.tempWinter')}
          values={countries.map(c => c.climate?.averageTemp?.winter || t('comparison.fields.notSpecified'))}
          colClass={colClass}
        />
      </ComparisonSection>

      <ComparisonSection
        title={t('comparison.sections.taxation')}
        icon={<Receipt className="w-5 h-5" />}
      >
        <ComparisonRow
          label={t('comparison.fields.incomeTax')}
          values={countries.map(c => c.taxation?.incomeTaxRange || t('comparison.fields.notSpecified'))}
          colClass={colClass}
        />
        <ComparisonRow
          label={t('comparison.fields.vat')}
          values={countries.map(c => c.taxation?.vat || t('comparison.fields.notSpecified'))}
          colClass={colClass}
        />
      </ComparisonSection>

      {isAuthenticated ? (
        <>
          <ComparisonSection
            title={t('comparison.sections.immigration')}
            icon={<MapPin className="w-5 h-5" />}
          >
            <ComparisonRowWithBar
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
            <ComparisonRowWithBar
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
            <ComparisonRowWithBar
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
            <ComparisonRowWithBar
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
            <ComparisonRowWithBar
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

            <ComparisonRow
              label={t('comparison.fields.steps')}
              values={countries.map(c => {
                const stepsCount = c.expatProjectTemplate?.steps?.length
                return stepsCount ? t('comparison.fields.stepsValue', { count: stepsCount }) : t('comparison.fields.notSpecified')
              })}
              colClass={colClass}
            />
            <ComparisonRow
              label={t('comparison.fields.difficulty')}
              values={countries.map(c => 
                c.recommendations?.visaDifficulty || t('comparison.fields.notSpecified')
              )}
              colClass={colClass}
            />
            <ComparisonRow
              label={t('comparison.fields.languageRequired')}
              values={countries.map(c => 
                c.recommendations?.language || t('comparison.fields.notSpecified')
              )}
              colClass={colClass}
            />

            <div className="px-8 py-3 bg-gray-50/50 border-t border-gray-100">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {t('comparison.oecdSource')}
              </p>
            </div>
          </ComparisonSection>

          <ComparisonSection
            title={t('comparison.sections.idealFor')}
            icon={<TrendingUp className="w-5 h-5" />}
          >
            <ComparisonRow
              label={t('comparison.fields.recommendedProfiles')}
              values={countries.map(c => 
                c.recommendations?.bestFor?.join(', ') || t('comparison.fields.notSpecified')
              )}
              colClass={colClass}
            />
          </ComparisonSection>
        </>
      ) : (
        <PremiumGate />
      )}
    </div>
  )
}

/* ═══════════════ Sub-components ═══════════════ */

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

function ComparisonSection({ 
  title, 
  icon, 
  children 
}: { 
  title: string
  icon: React.ReactNode
  children: React.ReactNode 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-shadow duration-300 hover:shadow-md">
      <div className="bg-gray-50/30 px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg text-[#5EA3C0] shadow-sm border border-gray-100">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {children}
      </div>
    </div>
  )
}

/* ─── Text-only row ─── */

function ComparisonRow({ 
  label, 
  values,
  colClass,
}: { 
  label: string
  values: string[]
  colClass: string
}) {
  return (
    <div className="grid grid-cols-[200px_1fr] gap-8 px-8 py-5">
      <div className="font-medium text-gray-500 flex items-center text-sm uppercase tracking-wide">
        {label}
      </div>
      <div className={`grid gap-8 ${colClass}`}>
        {values.map((value, index) => (
          <div key={index} className="text-base text-gray-700 flex items-center">
            <span className="break-words leading-snug">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Numeric row with visual bar + trophy ─── */

interface BarValue {
  raw: number | undefined | null
  display: string
}

function ComparisonRowWithBar({ 
  label, 
  values,
  highlightBest,
  colClass,
  colors,
}: { 
  label: string
  values: BarValue[]
  highlightBest?: 'highest' | 'lowest'
  colClass: string
  colors: string[]
}) {
  const { t } = useTranslation()

  const rawValues = values.map(v => v.raw ?? null)
  const validValues = rawValues.filter((v): v is number => v !== null)
  const maxVal = validValues.length > 0 ? Math.max(...validValues) : 0

  const bestIndex = (() => {
    if (!highlightBest || validValues.length === 0) return -1
    if (highlightBest === 'highest') {
      const max = Math.max(...validValues)
      return rawValues.indexOf(max)
    } else {
      const min = Math.min(...validValues)
      return rawValues.indexOf(min)
    }
  })()

  return (
    <div className="grid grid-cols-[200px_1fr] gap-8 px-8 py-5">
      <div className="font-medium text-gray-500 flex items-center text-sm uppercase tracking-wide">
        {label}
      </div>
      <div className={`grid gap-8 ${colClass}`}>
        {values.map((value, index) => (
          <div key={index}>
            <div className={`text-base flex items-center justify-between p-2 rounded-lg ${
              index === bestIndex
                ? 'bg-[#5EA3C0]/10 text-gray-900 font-semibold ring-1 ring-[#5EA3C0]/20'
                : 'text-gray-700'
            }`}>
              <span className="break-words">{value.display}</span>
              {index === bestIndex && (
                <div
                  className="flex-shrink-0 w-6 h-6 bg-[#5EA3C0]/20 text-[#5EA3C0] rounded-full flex items-center justify-center ml-2"
                  title={t('comparison.bestOption')}
                >
                  <Trophy className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            {value.raw != null && maxVal > 0 && (
              <ValueBar value={value.raw} max={maxVal} color={colors[index]} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Score row (X/10 badge) ─── */

function ComparisonRowScore({
  label,
  values,
  colClass,
}: {
  label: string
  values: (string | undefined)[]
  colClass: string
}) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-[200px_1fr] gap-8 px-8 py-5">
      <div className="font-medium text-gray-500 flex items-center text-sm uppercase tracking-wide">
        {label}
      </div>
      <div className={`grid gap-8 ${colClass}`}>
        {values.map((value, index) => (
          <div key={index} className="flex items-center">
            {value ? (
              <ScoreBadge score={value} />
            ) : (
              <span className="text-gray-400 text-sm">{t('comparison.fields.notSpecified')}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
