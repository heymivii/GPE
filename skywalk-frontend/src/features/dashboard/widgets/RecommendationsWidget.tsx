import Widget from './Widget'
import { Lightbulb, ExternalLink, Star } from 'lucide-react'
import { useCountryData } from '../../../hooks/useCountryData'
import React from 'react'

interface Recommendation {
  title: string
  importance: 'Urgent' | 'Important' | 'À faire'
  description: string
  link?: string
  linkText?: string
  category: string
}

interface RecommendationsWidgetProps {
  countryId?: number
  onEdit?: () => void
  onHide?: () => void
}

export default function RecommendationsWidget({ 
  countryId,
  onEdit, 
  onHide 
}: RecommendationsWidgetProps) {
  const countryData = useCountryData(countryId)

  const recommendations: Recommendation[] = React.useMemo(() => {
    if (countryData?.recommendations && typeof countryData.recommendations === 'object' && !Array.isArray(countryData.recommendations)) {
      const recs: Recommendation[] = []
      
      if (countryData.recommendations.bestFor && Array.isArray(countryData.recommendations.bestFor)) {
        recs.push({
          title: 'Profils recommandés',
          importance: 'Important',
          description: `Ce pays est idéal pour : ${countryData.recommendations.bestFor.join(', ')}`,
          category: 'Profil'
        })
      }
      
      if (countryData.recommendations.language) {
        recs.push({
          title: 'Langue requise',
          importance: 'Important',
          description: countryData.recommendations.language,
          category: 'Langue'
        })
      }
      
      if (countryData.recommendations.visaDifficulty) {
        const difficulty = countryData.recommendations.visaDifficulty.toLowerCase()
        recs.push({
          title: 'Difficulté du visa',
          importance: difficulty === 'élevée' ? 'Urgent' : difficulty === 'moyenne' ? 'Important' : 'À faire',
          description: `La difficulté d'obtention du visa est ${countryData.recommendations.visaDifficulty.toLowerCase()}`,
          category: 'Visa'
        })
      }
      
      return recs
    }
    
    if (countryData?.oldRecommendations && Array.isArray(countryData.oldRecommendations)) {
      return countryData.oldRecommendations
    }
    
    return []
  }, [countryData])

  const getPriorityColor = (importance: string) => {
    switch (importance) {
      case 'Urgent': return 'text-red-600 bg-red-50'
      case 'Important': return 'text-orange-600 bg-orange-50'
      case 'À faire': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
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
          recommendations.map((rec, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.importance)}`}>
                      {rec.importance}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  
                  {rec.link && (
                    <a 
                      href={rec.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                      {rec.linkText || 'En savoir plus'}
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