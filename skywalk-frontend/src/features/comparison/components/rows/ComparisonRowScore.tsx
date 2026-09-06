import { useTranslation } from 'react-i18next'
import { SUPPORTED_COUNTRIES } from '../../../../data/supportedCountries'
import type { EnrichedCountry } from '../../hooks/useCountriesWithData'
import { Globe } from 'lucide-react';

export function ScoreBadge({ score }: { score: string }) {
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

export function ComparisonRowScore({
    label,
    values,
    colClass,
    countries,
}: {
    label: string
    values: (string | undefined)[]
    colClass: string
    countries: EnrichedCountry[]
}) {
    const { t } = useTranslation()
    const getCountryName = (country: EnrichedCountry): string => {
        const sc = SUPPORTED_COUNTRIES.find(c => c.code === country.isoCode)
        if (!sc) return country.countryName
        return t(sc.i18nKey, { defaultValue: country.countryName })
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sm:bg-transparent sm:shadow-none sm:border-0 sm:border-b sm:border-gray-50/50 sm:rounded-none flex flex-col sm:grid sm:grid-cols-[140px_1fr] lg:grid-cols-[200px_1fr] gap-4 sm:gap-8 sm:px-8 py-0 sm:py-5 last:border-0 mb-4 sm:mb-0 overflow-hidden">
            <div className="font-bold sm:font-medium text-gray-900 sm:text-gray-500 flex items-center text-sm uppercase tracking-wide border-b border-gray-50 px-4 pt-4 pb-3 sm:p-0 sm:border-0 mb-0">
                {label}
            </div>
            <div className={`flex flex-col gap-0 sm:grid sm:gap-8 ${colClass}`}>
                {values.map((value, index) => {
                    const country = countries[index]
                    return (
                        <div key={index} className="flex flex-col sm:block px-4 py-3 sm:p-0 border-b border-gray-50 last:border-0 sm:border-0">
                            <div className="sm:hidden flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center text-xs">
                                    {country?.flagUrl ? <img src={country.flagUrl} alt="" className="w-full h-full object-cover" /> : country?.flagEmoji || <Globe className="w-4 h-4 text-gray-400" />}
                                </div>
                                <span className="font-bold text-gray-900 text-sm">{country ? getCountryName(country) : ''}</span>
                            </div>
                            <div className="flex items-center">
                                {value ? (
                                    <ScoreBadge score={value} />
                                ) : (
                                    <span className="text-gray-500 text-sm">{t('comparison.fields.notSpecified')}</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
