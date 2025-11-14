import Widget from './Widget'
import { CheckCircle, Circle, Plus } from 'lucide-react'
import { useState } from 'react'

interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  category: string
  dueDate?: string
}

interface ChecklistWidgetProps {
  userStepsDone: string[]
  onEdit?: () => void
  onHide?: () => void
}

export default function ChecklistWidget({ userStepsDone, onEdit, onHide }: ChecklistWidgetProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: '1',
      title: 'Demande de visa/permis de travail',
      completed: userStepsDone.includes('visa_application'),
      category: 'Administratif',
      dueDate: '2025-01-15'
    },
    {
      id: '2',
      title: 'Recherche de logement temporaire',
      completed: userStepsDone.includes('housing_search'),
      category: 'Logement'
    },
    {
      id: '3',
      title: 'Ouverture compte bancaire',
      completed: false,
      category: 'Finance',
      dueDate: '2025-02-01'
    },
    {
      id: '4',
      title: 'Assurance santé internationale',
      completed: false,
      category: 'Santé',
      dueDate: '2025-01-20'
    },
    {
      id: '5',
      title: 'Adaptation du CV',
      completed: userStepsDone.includes('job_search'),
      category: 'Emploi'
    }
  ])

  const toggleItem = (id: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const completedCount = checklist.filter(item => item.completed).length
  const progressPercentage = (completedCount / checklist.length) * 100

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
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
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {item.category}
                  </span>
                  
                  {item.dueDate && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      isOverdue(item.dueDate) 
                        ? 'text-red-600 bg-red-50' 
                        : 'text-orange-600 bg-orange-50'
                    }`}>
                      {new Date(item.dueDate).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton ajouter */}
        <button className="w-full flex items-center justify-center space-x-2 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Ajouter une tâche</span>
        </button>
      </div>
    </Widget>
  )
}