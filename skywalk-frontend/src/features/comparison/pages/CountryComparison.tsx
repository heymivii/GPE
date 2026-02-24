import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCountriesWithData } from '../hooks/useCountriesWithData'
import CountrySelector from '../components/CountrySelector'
import ComparisonTable from '../components/ComparisonTable'
import { useAuth } from '../../../hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../../components/PageHeader'

export default function CountryComparison() {
  const { t } = useTranslation()
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const { isAuthenticated } = useAuth();

  const { data: countries } = useCountriesWithData()

  const maxCountries = isAuthenticated ? 3 : 2;

  const handleCountryToggle = (countryId: string) => {
    if (selectedCountries.includes(countryId)) {
      setSelectedCountries(selectedCountries.filter(id => id !== countryId))
    } else if (selectedCountries.length < maxCountries) {
      setSelectedCountries([...selectedCountries, countryId])
    }
  }

  const selectedCountriesData = countries?.filter(c =>
    selectedCountries.includes(c.uniqueId!)
  ) || []

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <PageHeader
        title={t('comparison.title')}
        description={t('comparison.description')}
      >
        <div className="mb-6 inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-600">{t('comparison.selection')}</span>
          <div className="flex items-center gap-1">
            <span className={`text-lg font-bold ${selectedCountries.length === maxCountries ? 'text-amber-600' : 'text-[#5EA3C0]'}`}>
              {selectedCountries.length}
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-400">{maxCountries}</span>
          </div>
        </div>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8">
          {!isAuthenticated && selectedCountries.length >= 2 && (
            <div className="mb-6 p-4 bg-[#5EA3C0]/10 border border-[#5EA3C0]/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="p-2 bg-[#5EA3C0]/20 rounded-lg text-[#5EA3C0]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-[#4A8299]">{t('comparison.limitReached.title')}</h4>
                <p className="text-sm text-[#4A8299] mt-1">
                  {t('comparison.limitReached.message', { count: selectedCountries.length })}{' '}
                  <Link to="/auth/register" className="underline font-medium hover:text-[#3A6A7C]">
                    {t('comparison.limitReached.cta')}
                  </Link>{' '}
                  {t('comparison.limitReached.ctaSuffix', { max: 5 })}
                </p>
              </div>
            </div>
          )}

          <CountrySelector
            countries={countries || []}
            selectedCountries={selectedCountries}
            onCountryToggle={handleCountryToggle}
            maxSelection={maxCountries}
          />
        </div>

        {selectedCountriesData.length >= 2 ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-xl font-bold text-gray-900">{t('comparison.detailedAnalysis')}</h2>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>
            <ComparisonTable countries={selectedCountriesData} isAuthenticated={isAuthenticated} />
          </div>
        ) : (
          <div className="mt-8 sm:mt-12 border-2 border-dashed border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center bg-white/50">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-[#5EA3C0]/20 rounded-full animate-ping opacity-20"></div>
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('comparison.startComparison.title')}
              </h3>
              <p className="text-gray-500">
                {t('comparison.startComparison.description')} <span className="font-medium text-gray-900">2 {t('comparison.startComparison.destinations')}</span> {t('comparison.startComparison.suffix')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
