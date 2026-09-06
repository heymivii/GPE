import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, RotateCcw, Trash2 } from 'lucide-react'
import { useCountriesWithData } from '../hooks/useCountriesWithData'
import { useComparisonExtras } from '../hooks/useComparisonExtras'
import CountrySelector from '../components/CountrySelector'
import ComparisonTable from '../components/ComparisonTable'
import { useAuth } from '../../../hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../../components/PageHeader'

export default function CountryComparison() {
  const { t } = useTranslation()
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: countries, isLoading, error, refetch } = useCountriesWithData()

  const maxCountries = isAuthenticated ? 3 : 2;

  // Hydrate the selection from the URL (?ids=country-1,country-2) once the data
  // is loaded. A ref guards this so it runs a single time and never fights the
  // state -> URL sync below.
  const hydratedRef = useRef(false)
  useEffect(() => {
    if (hydratedRef.current) return
    if (!countries || countries.length === 0) return

    const idsParam = searchParams.get('ids')
    if (idsParam) {
      const valid: string[] = []
      let typeIsCity: boolean | null = null
      for (const id of idsParam.split(',')) {
        const match = countries.find((c) => c.uniqueId === id)
        if (!match) continue
        // Comparison only allows all-cities or all-countries, not a mix.
        if (typeIsCity === null) typeIsCity = !!match.isCity
        else if (!!match.isCity !== typeIsCity) continue
        if (valid.length >= maxCountries) break
        valid.push(id)
      }
      if (valid.length) setSelectedCountries(valid)
    }
    hydratedRef.current = true
  }, [countries, maxCountries, searchParams])

  // Keep the URL in sync with the selection (shareable + survives refresh).
  useEffect(() => {
    if (!hydratedRef.current) return
    const current = searchParams.get('ids') ?? ''
    const next = selectedCountries.join(',')
    if (current === next) return
    const params = new URLSearchParams(searchParams)
    if (next) params.set('ids', next)
    else params.delete('ids')
    setSearchParams(params, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountries])

  const handleCountryToggle = (countryId: string) => {
    if (selectedCountries.includes(countryId)) {
      setSelectedCountries(selectedCountries.filter(id => id !== countryId))
    } else if (selectedCountries.length < maxCountries) {
      const newSelection = countries?.find(c => c.uniqueId === countryId);

      if (selectedCountries.length > 0 && newSelection) {
        const firstSelection = countries?.find(c => c.uniqueId === selectedCountries[0]);

        if (firstSelection && firstSelection.isCity !== newSelection.isCity) {
          setSelectedCountries([countryId]);
          return;
        }
      }

      setSelectedCountries([...selectedCountries, countryId])
    }
  }

  const selectedCountriesData = countries?.filter(c =>
    selectedCountries.includes(c.uniqueId!)
  ) || []

  // Lazily attach Numbeo property-investment + quality-of-life to the SELECTED countries
  // only (no eager fetch of all 4 on page load). Hook runs before the early returns below.
  const comparisonData = useComparisonExtras(selectedCountriesData)

  // --- Loading state: keep the page chrome, show skeletons instead of an empty shell.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 pb-20">
        <PageHeader title={t('comparison.title')} description={t('comparison.description')} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <div className="h-16 bg-white border border-gray-200 rounded-2xl animate-pulse" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="h-40 bg-white border border-gray-100 rounded-2xl animate-pulse" />
            <div className="h-40 bg-white border border-gray-100 rounded-2xl animate-pulse" />
          </div>
          <div className="h-72 bg-white border border-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  // --- Error state: explicit message + retry instead of a silently empty page.
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 pb-20">
        <PageHeader title={t('comparison.title')} description={t('comparison.description')} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md mx-auto text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {t('comparison.error.title', { defaultValue: 'Impossible de charger les données' })}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {t('comparison.error.message', { defaultValue: 'Une erreur est survenue. Réessaie dans un instant.' })}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-ink hover:bg-brand-ink-hover text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {t('common.retry', { defaultValue: 'Réessayer' })}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <PageHeader
        title={t('comparison.title')}
        description={t('comparison.description')}
      >
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-600">{t('comparison.selection')}</span>
            <div className="flex items-center gap-1">
              <span className={`text-lg font-bold ${selectedCountries.length === maxCountries ? 'text-amber-600' : 'text-brand-ink'}`}>
                {selectedCountries.length}
              </span>
              <span className="text-gray-500">/</span>
              <span className="text-gray-500">{maxCountries}</span>
            </div>
          </div>
          {selectedCountries.length > 0 && (
            <button
              onClick={() => setSelectedCountries([])}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {t('comparison.clearAll', { defaultValue: 'Tout effacer' })}
            </button>
          )}
        </div>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8">
          {!isAuthenticated && selectedCountries.length >= 2 && (
            <div className="mb-6 p-4 bg-brand-ink/10 border border-brand/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="p-2 bg-brand-ink/20 rounded-lg text-brand-ink">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-brand-ink-hover">{t('comparison.limitReached.title')}</h4>
                <p className="text-sm text-brand-ink-hover mt-1">
                  {t('comparison.limitReached.message', { count: selectedCountries.length })}{' '}
                  <Link to="/auth/register" className="underline font-medium hover:text-brand-ink-hover">
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
            <ComparisonTable countries={comparisonData} isAuthenticated={isAuthenticated} allDestinations={countries || []} />
          </div>
        ) : (
          <div className="mt-8 sm:mt-12 border-2 border-dashed border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center bg-white/50">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-brand-ink/20 rounded-full animate-ping opacity-20"></div>
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
