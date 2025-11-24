import { Wallet, TrendingUp, AlertCircle } from 'lucide-react'
import type { CountryData } from '../../../hooks/useCountryData'
import Widget from './Widget'

interface BudgetTrackerWidgetProps {
  housingBudget: string
  countryData?: CountryData | null
  onEdit?: () => void
  onHide?: () => void
}

export default function BudgetTrackerWidget({ 
  housingBudget, 
  countryData,
  onEdit, 
  onHide 
}: BudgetTrackerWidgetProps) {
  const budget = parseFloat(housingBudget)
  const currency = countryData?.costOfLiving?.currency || countryData?.currency || '€'
  
  // Récupérer les loyers moyens du JSON ou mettre des valeurs par défaut
  const rents = countryData?.costOfLiving?.averageRent || {
    studio: 0,
    t2: 0,
    t3: 0,
    currency: currency
  }

  // Calculer le pouvoir d'achat (pourcentage du loyer couvert par le budget)
  const getCoverage = (rentPrice: number) => {
    if (!rentPrice) return 0
    return Math.min(100, Math.round((budget / rentPrice) * 100))
  }

  const studioCoverage = getCoverage(rents.studio)
  const t2Coverage = getCoverage(rents.t2)

  return (
    <Widget
      title="Analyse Budget"
      subtitle={`Logement à ${countryData?.name || 'destination'}`}
      icon={Wallet}
      iconColor="text-purple-600"
      onEdit={onEdit}
      onHide={onHide}
    >
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{budget.toLocaleString()}</span>
          <span className="text-lg font-medium text-gray-500">{currency}</span>
        </div>
        <p className="text-sm text-gray-500">Votre budget mensuel prévu</p>
      </div>

      {countryData?.costOfLiving ? (
        <div className="space-y-4">
          {/* Comparaison Studio */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Studio moyen ({rents.studio} {currency})</span>
              <span className={`font-medium ${studioCoverage >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                {studioCoverage >= 100 ? 'Couvert ✅' : `${studioCoverage}%`}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${studioCoverage >= 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                style={{ width: `${studioCoverage}%` }}
              ></div>
            </div>
          </div>

          {/* Comparaison T2 */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Appart T2 ({rents.t2} {currency})</span>
              <span className={`font-medium ${t2Coverage >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                {t2Coverage >= 100 ? 'Couvert ✅' : `${t2Coverage}%`}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${t2Coverage >= 100 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${t2Coverage}%` }}
              ></div>
            </div>
          </div>

          {/* Analyse textuelle */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800 leading-relaxed">
              {budget >= rents.t2 
                ? "Excellent ! Votre budget est confortable pour un T2 standard."
                : budget >= rents.studio
                ? "Bon budget. Vous pouvez viser un studio confortable ou un petit T2 en périphérie."
                : "Budget serré. Considérez la colocation ou éloignez-vous du centre-ville."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <AlertCircle className="w-8 h-8 mb-2 text-gray-400" />
          <p className="text-sm">Données de marché non disponibles pour ce pays.</p>
        </div>
      )}
    </Widget>
  )
}