import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCountriesWithData } from '../hooks/useCountriesWithData'
import CountrySelector from '../components/CountrySelector'
import ComparisonTable from '../components/ComparisonTable'

export default function CountryComparison() {
  const [selectedCountries, setSelectedCountries] = useState<number[]>([])

  const { data: countries } = useCountriesWithData()

  const handleCountryToggle = (countryId: number) => {
    if (selectedCountries.includes(countryId)) {
      setSelectedCountries(selectedCountries.filter(id => id !== countryId))
    } else if (selectedCountries.length < 3) {
      setSelectedCountries([...selectedCountries, countryId])
    }
  }

  const selectedCountriesData = countries?.filter(c => 
    selectedCountries.includes(c.idCountry)
  ) || []

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-24 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-8 transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Comparateur de destinations
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Analysez et comparez les coûts, les salaires et la qualité de vie pour prendre la meilleure décision pour votre avenir.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">1</span>
              Choisissez vos destinations
            </h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {selectedCountries.length} / 3 sélectionné(s)
            </span>
          </div>
          
          <CountrySelector
            countries={countries || []}
            selectedCountries={selectedCountries}
            onCountryToggle={handleCountryToggle}
            maxSelection={3}
          />
        </div>

        {selectedCountriesData.length >= 2 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">2</span>
              <h2 className="text-xl font-bold text-gray-900">Analyse comparative</h2>
            </div>
            <ComparisonTable countries={selectedCountriesData} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                En attente de sélection
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Sélectionnez au moins 2 pays ci-dessus pour débloquer le tableau comparatif détaillé et visualiser les différences.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
