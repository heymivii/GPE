import Widget from './Widget'
import { Lightbulb, ExternalLink, Star } from 'lucide-react'

interface Recommendation {
  id: string
  title: string
  description: string
  category: 'housing' | 'employment' | 'transport' | 'admin' | 'health'
  priority: 'high' | 'medium' | 'low'
  link?: string
  completed?: boolean
}

interface RecommendationsWidgetProps {
  userPriorities: string[]
  destination: string
  onEdit?: () => void
  onHide?: () => void
}

export default function RecommendationsWidget({ 
  userPriorities, 
  destination, 
  onEdit, 
  onHide 
}: RecommendationsWidgetProps) {
  const generateRecommendations = (): Recommendation[] => {
    const allRecommendations: Recommendation[] = [
      {
        id: '1',
        title: 'Ouvrir un compte bancaire canadien',
        description: 'Commencez par ouvrir un compte dans une banque majeure comme RBC ou TD',
        category: 'admin',
        priority: 'high',
        link: '/guides/banking-canada'
      },
      {
        id: '2', 
        title: 'Rechercher un logement temporaire',
        description: 'Trouvez un logement temporaire pour vos premiers mois',
        category: 'housing',
        priority: 'high',
        link: '/guides/temporary-housing'
      },
      {
        id: '3',
        title: 'Optimiser votre CV pour le marché canadien',
        description: 'Adaptez votre CV aux standards nord-américains',
        category: 'employment',
        priority: 'medium',
        link: '/guides/cv-canada'
      },
      {
        id: '4',
        title: 'Souscrire à une assurance santé',
        description: 'Protégez-vous avec une assurance santé dès votre arrivée',
        category: 'health',
        priority: 'medium',
        link: '/guides/health-insurance'
      },
      {
        id: '5',
        title: 'Comprendre le système de transport de Toronto',
        description: 'Découvrez le TTC et les options de transport dans la ville',
        category: 'transport',
        priority: 'low',
        link: '/guides/toronto-transport'
      }
    ]

    return allRecommendations
      .filter(rec => userPriorities.includes(rec.category))
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      .slice(0, 4)
  }

  const recommendations = generateRecommendations()

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-orange-600 bg-orange-50'
      case 'low': return 'text-green-600 bg-green-50'
    }
  }

  const getPriorityLabel = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high': return 'Urgent'
      case 'medium': return 'Important'
      case 'low': return 'À faire'
    }
  }

  return (
    <Widget title="Recommandations personnalisées" onEdit={onEdit} onHide={onHide} size="large">
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune recommandation pour le moment</p>
          </div>
        ) : (
          recommendations.map((rec) => (
            <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {getPriorityLabel(rec.priority)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  
                  {rec.link && (
                    <a 
                      href={rec.link}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                      En savoir plus
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
                
                <button className="p-1 text-gray-400 hover:text-yellow-500">
                  <Star className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}

        {recommendations.length > 0 && (
          <div className="pt-4 border-t border-gray-200 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Voir toutes les recommandations
            </button>
          </div>
        )}
      </div>
    </Widget>
  )
}