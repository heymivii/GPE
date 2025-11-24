import Widget from './Widget'
import { CheckCircle, Circle } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { CountryData } from '../../../hooks/useCountryData'

interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  category: string
  substeps?: Array<{ id: string; label: string; isOptional: boolean }>
}

interface ChecklistWidgetProps {
  countryData: CountryData | null
  onEdit?: () => void
  onHide?: () => void
}

export default function ChecklistWidget({ countryData, onEdit, onHide }: ChecklistWidgetProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])

  // Charger les étapes depuis le JSON du pays
  useEffect(() => {
    if (!countryData?.expatProjectTemplate) {
      return
    }

    // Convertir les steps du JSON en checklist items
    const steps = countryData.expatProjectTemplate.steps.map((step) => ({
      id: step.id.toString(),
      title: step.title,
      completed: false, // TODO: charger depuis le backend
      category: step.category,
      substeps: step.substeps,
    }))

    setChecklist(steps)
  }, [countryData])

  const toggleItem = (id: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const completedCount = checklist.filter(item => item.completed).length
  const progressPercentage = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0

  if (!countryData || checklist.length === 0) {
    return (
      <Widget title="Ma Checklist" onEdit={onEdit} onHide={onHide}>
        <div className="text-center py-8 text-gray-500">
          <p>Aucune checklist disponible pour ce pays.</p>
        </div>
      </Widget>
    )
  }

  return (
    <Widget title="Ma Checklist" onEdit={onEdit} onHide={onHide}>
      <div className="space-y-4">
        {/* Barre de progression */}
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression</span>
            <span className="text-sm font-medium text-blue-600">
              {completedCount}/{checklist.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {checklist.map((item) => (
            <div 
              key={item.id}
              className={`flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer
                ${item.completed ? 'opacity-75' : ''}
              `}
              onClick={() => toggleItem(item.id)}
            >
              <button className="mt-0.5">
                {item.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {item.title}
                </p>
                
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded capitalize">
                    {item.category}
                  </span>
                  {item.substeps && item.substeps.length > 0 && (
                    <span className="text-xs text-blue-600">
                      {item.substeps.length} sous-étapes
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Widget>
  )
}