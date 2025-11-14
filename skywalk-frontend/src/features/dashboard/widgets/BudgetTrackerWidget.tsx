import Widget from './Widget'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface BudgetCategory {
  name: string
  allocated: number
  spent: number
  currency: string
}

interface BudgetTrackerWidgetProps {
  housingBudget: string
  onEdit?: () => void
  onHide?: () => void
}

export default function BudgetTrackerWidget({ housingBudget, onEdit, onHide }: BudgetTrackerWidgetProps) {
  const budgetData: BudgetCategory[] = [
    {
      name: 'Logement',
      allocated: parseInt(housingBudget) || 1000,
      spent: 800,
      currency: '€'
    },
    {
      name: 'Transport',
      allocated: 200,
      spent: 150,
      currency: '€'
    },
    {
      name: 'Nourriture',
      allocated: 400,
      spent: 320,
      currency: '€'
    },
    {
      name: 'Démarches',
      allocated: 500,
      spent: 650,
      currency: '€'
    }
  ]

  const totalAllocated = budgetData.reduce((sum, cat) => sum + cat.allocated, 0)
  const totalSpent = budgetData.reduce((sum, cat) => sum + cat.spent, 0)
  const remainingBudget = totalAllocated - totalSpent

  const getStatusColor = (allocated: number, spent: number) => {
    const percentage = (spent / allocated) * 100
    if (percentage > 100) return 'text-red-600 bg-red-50'
    if (percentage > 80) return 'text-orange-600 bg-orange-50'
    return 'text-green-600 bg-green-50'
  }

  const getPercentage = (allocated: number, spent: number) => {
    return Math.min((spent / allocated) * 100, 100)
  }

  return (
    <Widget title="Suivi Budget" onEdit={onEdit} onHide={onHide}>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Budget total</span>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{totalSpent}€ / {totalAllocated}€</p>
              <p className={`text-sm flex items-center ${
                remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {remainingBudget >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(remainingBudget)}€ {remainingBudget >= 0 ? 'restant' : 'dépassé'}
              </p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                remainingBudget >= 0 ? 'bg-green-600' : 'bg-red-600'
              }`}
              style={{ width: `${Math.min((totalSpent / totalAllocated) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {budgetData.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  <div className="flex items-center space-x-2">
                    {category.spent > category.allocated && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-600">
                      {category.spent}{category.currency} / {category.allocated}{category.currency}
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      category.spent > category.allocated ? 'bg-red-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${getPercentage(category.allocated, category.spent)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button className="flex-1 text-sm bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors">
              Ajouter dépense
            </button>
            <button className="flex-1 text-sm border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
              Voir détails
            </button>
          </div>
        </div>
      </div>
    </Widget>
  )
}