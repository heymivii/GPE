import Widget from './Widget'
import { Lightbulb, ExternalLink, Star } from 'lucide-react'
import { useCountryData } from '../../../hooks/useCountryData'
import React from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const countryData = useCountryData(countryId)

  const recommendations: Recommendation[] = React.useMemo(() => {
    if (countryData?.recommendations && typeof countryData.recommendations === 'object' && !Array.isArray(countryData.recommendations)) {
      const recs: Recommendation[] = []
      
      if (countryData.recommendations.bestFor && Array.isArray(countryData.recommendations.bestFor)) {
        recs.push({
          title: t('dashboard.personalized.widgets.recommendations.categories.profile'),
          importance: 'Important',
          description: t('dashboard.personalized.widgets.recommendations.categories.profileDesc', { profiles: countryData.recommendations.bestFor.join(', ') }),
          category: 'Profil'
        })
      }
      
      if (countryData.recommendations.language) {
        recs.push({
          title: t('dashboard.personalized.widgets.recommendations.categories.language'),
          importance: 'Important',
          description: countryData.recommendations.language,
          category: 'Langue'
        })
      }
      
      if (countryData.recommendations.visaDifficulty) {
        const difficulty = countryData.recommendations.visaDifficulty.toLowerCase()
        recs.push({
          title: t('dashboard.personalized.widgets.recommendations.categories.visa'),
          importance: difficulty === 'élevée' ? 'Urgent' : difficulty === 'moyenne' ? 'Important' : 'À faire',
          description: t('dashboard.personalized.widgets.recommendations.categories.visaDesc', { difficulty: countryData.recommendations.visaDifficulty.toLowerCase() }),
          category: 'Visa'
        })
      }
      
      return recs
    }
    
    if (countryData?.oldRecommendations && Array.isArray(countryData.oldRecommendations)) {
      return countryData.oldRecommendations
    }
    
    return []
  }, [countryData, t])

  const getPriorityColor = (importance: string) => {
    const urgentLabel = t('dashboard.personalized.widgets.recommendations.importance.urgent')
    const importantLabel = t('dashboard.personalized.widgets.recommendations.importance.important')
    
    if (importance === 'Urgent' || importance === urgentLabel) return 'text-red-600 bg-red-50'
    if (importance === 'Important' || importance === importantLabel) return 'text-orange-600 bg-orange-50'
    return 'text-green-600 bg-green-50'
  }

  return (
    <Widget title={t('dashboard.personalized.widgets.recommendations.title')} onEdit={onEdit} onHide={onHide} size="large">
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>{t('dashboard.personalized.widgets.recommendations.emptyState')}</p>
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
                      {rec.linkText || t('dashboard.personalized.widgets.recommendations.learnMore')}
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
              {t('dashboard.personalized.widgets.recommendations.seeAll')}
            </button>
          </div>
        )}
      </div>
    </Widget>
  )
}