import Widget from './Widget'
import { Lightbulb, ExternalLink, Star, Users, Briefcase, MessageSquare } from 'lucide-react'
import { useCountryData, type Recommendation } from '../../../hooks/useCountryData'
import { useQuery } from '@tanstack/react-query'
import { destinationsApi } from '../../../api/destinations'
import React from 'react'
import { useTranslation } from 'react-i18next'
import type { WidgetSize } from '../hooks/useDashboardPreferences'

interface RecommendationsWidgetProps {
  countryId?: number
  countryIsoCode?: string
  onEdit?: () => void
  onHide?: () => void
  onResize?: (size: WidgetSize) => void
  currentSize?: WidgetSize
}

export default function RecommendationsWidget({ 
  countryId,
  countryIsoCode,
  onEdit, 
  onHide,
  onResize,
  currentSize,
}: RecommendationsWidgetProps) {
  const { t } = useTranslation()
  const countryData = useCountryData(countryId)

  // Fetch real community stats from destinations API
  const { data: destStats } = useQuery({
    queryKey: ['destination-stats-widget', countryIsoCode],
    queryFn: () => destinationsApi.getBySlug(countryIsoCode!),
    enabled: !!countryIsoCode,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  })

  const communityStats = destStats?.stats as { memberCount?: number; jobOffersCount?: number; forumTopicsCount?: number; resourcesCount?: number } | undefined

  const recommendations: Recommendation[] = React.useMemo(() => {
    if (countryData?.recommendations && typeof countryData.recommendations === 'object' && !Array.isArray(countryData.recommendations)) {
      const recs: Recommendation[] = []
      
      if (countryData.recommendations.bestFor && Array.isArray(countryData.recommendations.bestFor)) {
        recs.push({
          title: t('dashboard.personalized.widgets.recommendations.categories.profile'),
          importanceKey: 'recommendations.important',
          description: t('dashboard.personalized.widgets.recommendations.categories.profileDesc', { profiles: countryData.recommendations.bestFor.join(', ') }),
          category: t('recommendations.categoryProfile')
        })
      }
      
      if (countryData.recommendations.language) {
        recs.push({
          title: t('dashboard.personalized.widgets.recommendations.categories.language'),
          importanceKey: 'recommendations.important',
          description: countryData.recommendations.language,
          category: t('recommendations.categoryLanguage')
        })
      }
      
      if (countryData.recommendations.visaDifficulty) {
        const difficulty = countryData.recommendations.visaDifficulty.toLowerCase()
        recs.push({
          title: t('dashboard.personalized.widgets.recommendations.categories.visa'),
          importanceKey: (difficulty.includes('élevée') || difficulty.includes('high') || difficulty.includes('difficile'))
            ? 'recommendations.urgent'
            : (difficulty.includes('moyenne') || difficulty.includes('medium'))
              ? 'recommendations.important'
              : 'recommendations.todo',
          description: t('dashboard.personalized.widgets.recommendations.categories.visaDesc', { difficulty: countryData.recommendations.visaDifficulty.toLowerCase() }),
          category: t('recommendations.categoryVisa')
        })
      }
      
      return recs
    }
    
    if (countryData?.oldRecommendations && Array.isArray(countryData.oldRecommendations)) {
      return countryData.oldRecommendations
    }
    
    return []
  }, [countryData, t])

  const getPriorityColor = (importanceKey: string) => {
    if (importanceKey.includes('urgent')) return 'text-red-600 bg-red-50'
    if (importanceKey.includes('important')) return 'text-orange-600 bg-orange-50'
    return 'text-green-600 bg-green-50'
  }

  return (
    <Widget title={t('dashboard.personalized.widgets.recommendations.title')} onEdit={onEdit} onHide={onHide} onResize={onResize} currentSize={currentSize}>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.importanceKey)}`}>
                      {t(rec.importanceKey)}
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

        {/* Live community stats from backend */}
        {communityStats && (communityStats.memberCount || communityStats.jobOffersCount || communityStats.forumTopicsCount) && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            {communityStats.memberCount != null && communityStats.memberCount > 0 && (
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <Users className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{communityStats.memberCount}</p>
                <p className="text-[10px] text-gray-500">{t('dashboard.personalized.widgets.recommendations.members')}</p>
              </div>
            )}
            {communityStats.jobOffersCount != null && communityStats.jobOffersCount > 0 && (
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <Briefcase className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{communityStats.jobOffersCount.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">{t('dashboard.personalized.widgets.recommendations.jobs')}</p>
              </div>
            )}
            {communityStats.forumTopicsCount != null && communityStats.forumTopicsCount > 0 && (
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <MessageSquare className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{communityStats.forumTopicsCount}</p>
                <p className="text-[10px] text-gray-500">{t('dashboard.personalized.widgets.recommendations.forumTopics')}</p>
              </div>
            )}
          </div>
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