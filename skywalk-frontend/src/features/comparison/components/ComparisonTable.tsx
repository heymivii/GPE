import { 
  MapPin, DollarSign, Globe, TrendingUp, Trophy
} from 'lucide-react'
import type { EnrichedCountry } from '../hooks/useCountriesWithData'

interface ComparisonTableProps {
  countries: EnrichedCountry[]
}

export default function ComparisonTable({ countries }: ComparisonTableProps) {
  return (
    <div className="space-y-8">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="grid grid-cols-[200px_1fr] gap-8 max-w-7xl mx-auto">
          <div className="flex items-end pb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
            Critères
          </div>
          <div className={`grid gap-8 ${
            countries.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
          }`}>
            {countries.map(country => (
              <div key={country.idCountry} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                  {country.flagUrl ? (
                    <img src={country.flagUrl} alt={country.countryName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-lg">
                      {country.flagEmoji || '🌍'}
                    </div>
                  )}
                </div>
                <span className="font-bold text-gray-900 text-lg">{country.countryName}</span>
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm border border-gray-100">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
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
    <div className="grid grid-cols-[200px_1fr] gap-8 px-8 py-5 hover:bg-gray-50/80 transition-colors group">
      <div className="font-medium text-gray-500 group-hover:text-gray-700 flex items-center">
        {label}
      </div>
      <div className={`grid gap-8 ${
        values.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
      }`}>
        {values.map((value, index) => (
          <div
            key={index}
            className={`text-base flex items-center gap-2 ${
              index === bestIndex
                ? 'font-bold text-green-700'
                : 'text-gray-900'
            }`}
          >
            {value}
            {index === bestIndex && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <Trophy className="w-3 h-3 mr-1" />
                Top
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
