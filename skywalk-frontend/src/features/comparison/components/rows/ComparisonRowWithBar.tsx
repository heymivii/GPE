import { useTranslation } from 'react-i18next'
import { Globe, Trophy } from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '../../../../data/supportedCountries'
import type { EnrichedCountry } from '../../hooks/useCountriesWithData'

export interface BarValue {
    raw: number | undefined | null
    display: string
}

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

export function ComparisonRowWithBar({
    label,
    values,
    highlightBest,
    colClass,
    colors,
    countries,
}: {
    label: string
    values: BarValue[]
    highlightBest?: 'highest' | 'lowest'
    colClass: string
    colors: string[]
    countries: EnrichedCountry[]
}) {
    const { t } = useTranslation()
    const getCountryName = (country: EnrichedCountry): string => {
        const sc = SUPPORTED_COUNTRIES.find(c => c.code === country.isoCode)
        if (!sc) return country.countryName
        return t(sc.i18nKey, { defaultValue: country.countryName })
    }

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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sm:bg-transparent sm:shadow-none sm:border-0 sm:border-b sm:border-gray-50/50 sm:rounded-none flex flex-col sm:grid sm:grid-cols-[140px_1fr] lg:grid-cols-[200px_1fr] gap-4 sm:gap-8 sm:px-8 py-0 sm:py-5 last:border-0 mb-4 sm:mb-0 overflow-hidden">
            <div className="font-bold sm:font-medium text-gray-900 sm:text-gray-500 flex items-center text-sm uppercase tracking-wide border-b border-gray-50 px-4 pt-4 pb-3 sm:p-0 sm:border-0 mb-0">
                {label}
            </div>
            <div className={`flex flex-col gap-0 sm:grid sm:gap-8 ${colClass}`}>
                {values.map((value, index) => {
                    const country = countries[index]
                    return (
                        <div key={index} className="flex flex-col sm:block px-4 py-3 sm:p-0 border-b border-gray-50 last:border-0 sm:border-0 gap-2">
                            <div className="sm:hidden flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center text-xs">
                                    {country?.flagUrl ? <img src={country.flagUrl} alt="" className="w-full h-full object-cover" /> : country?.flagEmoji || <Globe className="w-4 h-4 text-gray-400" />}
                                </div>
                                <span className="font-bold text-gray-900 text-sm">{country ? getCountryName(country) : ''}</span>
                            </div>
                            <div className="mt-1 sm:mt-0">
                                <div className={`text-sm sm:text-base flex items-center justify-between p-2 sm:p-2 rounded-lg ${index === bestIndex
                                    ? 'bg-brand-ink/10 text-gray-900 font-semibold ring-1 ring-brand/20'
                                    : 'text-gray-700 bg-gray-50 sm:bg-transparent'
                                    }`}>
                                    <span className="break-words font-medium sm:font-normal">{value.display}</span>
                                    {index === bestIndex && (
                                        <div
                                            className="flex-shrink-0 w-6 h-6 bg-brand-ink/20 text-brand-ink rounded-full flex items-center justify-center ml-2"
                                            title={t('comparison.bestOption')}
                                        >
                                            <Trophy className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                                {value.raw != null && maxVal > 0 && (
                                    <div className="px-2 mt-2 sm:mt-1">
                                        <ValueBar value={value.raw} max={maxVal} color={colors[index]} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
