import Widget from './Widget'
import { CheckCircle, Circle, ChevronDown, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { CountryData } from '../../../hooks/useCountryData'

interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  category: string
  substeps?: Array<{ 
    id: string
    label: string
    isOptional: boolean
    completed?: boolean
  }>
  expanded?: boolean
}

interface ChecklistWidgetProps {
  countryData: CountryData | null
  onEdit?: () => void
  onHide?: () => void
}

export default function ChecklistWidget({ countryData, onEdit, onHide }: ChecklistWidgetProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])

  useEffect(() => {
    if (!countryData?.expatProjectTemplate) {
      return
    }

    const steps = countryData.expatProjectTemplate.steps.map((step) => ({
      id: step.id.toString(),
      title: step.title,
      completed: false, 
      category: step.category,
      substeps: step.substeps?.map(sub => ({ ...sub, completed: false })),
      expanded: false,
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

  const toggleSubstep = (itemId: string, substepId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChecklist(prev => 
      prev.map(item => {
        if (item.id === itemId && item.substeps) {
          const updatedSubsteps = item.substeps.map(sub =>
            sub.id === substepId ? { ...sub, completed: !sub.completed } : sub
          )
          const allSubstepsCompleted = updatedSubsteps.every(sub => sub.completed)
          return { 
            ...item, 
            substeps: updatedSubsteps,
            completed: allSubstepsCompleted 
          }
        }
        return item
      })
    )
  }

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, expanded: !item.expanded } : item
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

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {checklist.map((item) => (
            <div key={item.id} className="space-y-1">
              <div 
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
                      <button 
                        onClick={(e) => toggleExpand(item.id, e)}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                      >
                        {item.expanded ? (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            Masquer
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-3 h-3" />
                            {item.substeps.length} sous-étapes
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {item.expanded && item.substeps && item.substeps.length > 0 && (
                <div className="ml-8 space-y-1 pb-2">
                  {item.substeps.map((substep) => (
                    <div 
                      key={substep.id}
                      onClick={(e) => toggleSubstep(item.id, substep.id, e)}
                      className={`flex items-start gap-2 p-2 text-xs rounded cursor-pointer hover:bg-gray-100 transition-colors
                        ${substep.completed ? 'bg-green-50' : 'bg-gray-50'}
                      `}
                    >
                      <button className="flex-shrink-0 mt-0.5">
                        {substep.completed ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                          <Circle className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                      <span className={`flex-1 ${substep.completed ? 'text-gray-500 line-through' : 'text-gray-600'}`}>
                        {substep.label}
                        {substep.isOptional && (
                          <span className="ml-1 text-gray-400 italic">(optionnel)</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Widget>
  )
}