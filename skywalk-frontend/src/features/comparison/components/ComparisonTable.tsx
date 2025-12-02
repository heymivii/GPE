import { 
  MapPin, DollarSign, Globe, TrendingUp, Trophy, Lock
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { EnrichedCountry } from '../hooks/useCountriesWithData'

interface ComparisonTableProps {
  countries: EnrichedCountry[]
  isAuthenticated?: boolean
}

export default function ComparisonTable({ countries, isAuthenticated = true }: ComparisonTableProps) {
  return (
    <div className="space-y-8">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] py-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-all">
        <div className="grid grid-cols-[200px_1fr] gap-8 max-w-7xl mx-auto items-end">
          <div className="pb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Comparatif
          </div>
          <div className={`grid gap-8 ${
            countries.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
          }`}>
            {countries.map(country => (
              <div key={country.idCountry} className="flex flex-col gap-3">
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

      <ComparisonSection
        title="Informations générales"
        icon={<Globe className="w-5 h-5" />}
      >
        <ComparisonRow
          label="Continent"
          values={countries.map(c => c.continent || 'Non renseigné')}
        />
        <ComparisonRow
          label="Capitale"
          values={countries.map(c => c.capital || 'Non renseignée')}
        />
        <ComparisonRow
          label="Langue(s) parlée(s)"
          values={countries.map(c => c.languages || 'Non renseigné')}
        />
        <ComparisonRow
          label="Devise"
          values={countries.map(c => c.currency || 'Non renseignée')}
        />
      </ComparisonSection>

      <ComparisonSection
        title="Coût de la vie"
        icon={<DollarSign className="w-5 h-5" />}
      >
        <ComparisonRow
          label="Salaire moyen mensuel"
          values={countries.map(c => 
            c.costOfLiving?.averageSalary 
              ? `${c.costOfLiving.averageSalary.toLocaleString()} ${c.currency}` 
              : 'Non renseigné'
          )}
          highlightBest="highest"
        />
        <ComparisonRow
          label="Loyer 1 chambre (centre)"
          values={countries.map(c => 
            c.costOfLiving?.averageRent?.oneBedroom
              ? `${c.costOfLiving.averageRent.oneBedroom.toLocaleString()} ${c.currency}` 
              : 'Non renseigné'
          )}
          highlightBest="lowest"
        />
        <ComparisonRow
          label="Loyer 3 chambres (centre)"
          values={countries.map(c => 
            c.costOfLiving?.averageRent?.threeBedroom
              ? `${c.costOfLiving.averageRent.threeBedroom.toLocaleString()} ${c.currency}` 
              : 'Non renseigné'
          )}
          highlightBest="lowest"
        />
        <ComparisonRow
          label="Repas au restaurant"
          values={countries.map(c => 
            c.costOfLiving?.food?.restaurantMeal
              ? `${c.costOfLiving.food.restaurantMeal.toLocaleString()} ${c.currency}` 
              : 'Non renseigné'
          )}
          highlightBest="lowest"
        />
        <ComparisonRow
          label="Courses hebdomadaires"
          values={countries.map(c => 
            c.costOfLiving?.food?.groceriesWeekly
              ? `${c.costOfLiving.food.groceriesWeekly.toLocaleString()} ${c.currency}` 
              : 'Non renseigné'
          )}
          highlightBest="lowest"
        />
      </ComparisonSection>

      {isAuthenticated ? (
        <>
          <ComparisonSection
            title="Procédures d'immigration"
            icon={<MapPin className="w-5 h-5" />}
          >
            <ComparisonRow
              label="Nombre d'étapes"
              values={countries.map(c => {
                const stepsCount = c.expatProjectTemplate?.steps?.length
                return stepsCount ? `${stepsCount} étapes` : 'Non renseigné'
              })}
            />
            <ComparisonRow
              label="Difficulté"
              values={countries.map(c => 
                c.recommendations?.visaDifficulty || 'Non renseigné'
              )}
            />
            <ComparisonRow
              label="Langue requise"
              values={countries.map(c => 
                c.recommendations?.language || 'Non renseigné'
              )}
            />
          </ComparisonSection>

          <ComparisonSection
            title="Idéal pour"
            icon={<TrendingUp className="w-5 h-5" />}
          >
            <ComparisonRow
              label="Profils recommandés"
              values={countries.map(c => 
                c.recommendations?.bestFor?.join(', ') || 'Non renseigné'
              )}
            />
          </ComparisonSection>
        </>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/5 mt-8">
          {/* Decorative background elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#5EA3C0]/10 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gray-50 rounded-full blur-3xl opacity-50"></div>
          
          <div className="relative p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-3xl bg-[#5EA3C0] text-white shadow-lg shadow-[#5EA3C0]/30 transform rotate-3 hover:rotate-6 transition-transform duration-300">
              <Lock className="w-10 h-10" />
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
              Accédez à l'analyse complète
            </h3>
            
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Les données détaillées sur l'immigration et les recommandations personnalisées sont réservées à nos membres. Rejoignez Skywalk pour prendre la meilleure décision.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10 text-left">
              {[
                'Procédures d\'immigration étape par étape',
                'Analyse de difficulté des visas',
                'Recommandations basées sur votre profil',
                'Comparaison illimitée (jusqu\'à 5 pays)'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm transition-shadow">
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
                Créer un compte gratuit
              </Link>
              <Link
                to="/auth/login"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all hover:border-[#5EA3C0] hover:text-[#5EA3C0]"
              >
                Se connecter
              </Link>
            </div>
            
            <p className="mt-8 text-sm font-medium text-gray-400">
              Aucune carte bancaire requise • Inscription en 30 secondes
            </p>
          </div>
        </div>
      )}
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-shadow duration-300">
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

function ComparisonRow({ 
  label, 
  values,
  highlightBest
}: { 
  label: string
  values: string[]
  highlightBest?: 'highest' | 'lowest'
}) {
  const getBestIndex = () => {
    if (!highlightBest) return -1
    
    const numericValues = values.map(v => {
      const match = v.match(/[\d,]+/)
      return match ? parseFloat(match[0].replace(/,/g, '')) : null
    })

    if (numericValues.every(v => v === null)) return -1

    if (highlightBest === 'highest') {
      const max = Math.max(...numericValues.filter(v => v !== null) as number[])
      return numericValues.indexOf(max)
    } else {
      const min = Math.min(...numericValues.filter(v => v !== null) as number[])
      return numericValues.indexOf(min)
    }
  }

  const bestIndex = getBestIndex()

  return (
    <div className="grid grid-cols-[200px_1fr] gap-8 px-8 py-5 border-l-2 border-transparent">
      <div className="font-medium text-gray-500 flex items-center text-sm uppercase tracking-wide">
        {label}
      </div>
      <div className={`grid gap-8 ${
        values.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
      }`}>
        {values.map((value, index) => (
          <div
            key={index}
            className={`text-base flex items-center justify-between p-2 rounded-lg ${
              index === bestIndex
                ? 'bg-[#5EA3C0]/10 text-gray-900 font-semibold ring-1 ring-[#5EA3C0]/20'
                : 'text-gray-700'
            }`}
          >
            <span className="truncate">{value}</span>
            {index === bestIndex && (
              <div className="flex-shrink-0 w-6 h-6 bg-[#5EA3C0]/20 text-[#5EA3C0] rounded-full flex items-center justify-center" title="Meilleure option">
                <Trophy className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
