import Widget from './Widget'
import { Sparkles, ChevronRight, Shield, Zap, Clock, ArrowRight, Briefcase, GraduationCap, Home, Heart, Train, FileText, Users, Globe } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { countryApi } from '../../../api/country'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { WidgetSize } from '../hooks/useDashboardPreferences'
import type { ExpatriationProject } from '../../../types/expatriation-project'
import { useProjectRecommendations } from '../../projects/hooks/useProjectRecommendations'
import type { RecommendationIcon } from '../../projects/hooks/useProjectRecommendations'
import type { ReactNode } from 'react'

// La source (useProjectRecommendations) émet une clé d'icône, plus un emoji :
// cette table n'a plus à traduire des pictogrammes, elle mappe des noms.
const ICON_MAP: Record<RecommendationIcon, ReactNode> = {
  visa: <Shield className="w-4 h-4" />,
  work: <Briefcase className="w-4 h-4" />,
  education: <GraduationCap className="w-4 h-4" />,
  housing: <Home className="w-4 h-4" />,
  health: <Heart className="w-4 h-4" />,
  admin: <FileText className="w-4 h-4" />,
  community: <Users className="w-4 h-4" />,
  transport: <Train className="w-4 h-4" />,
  finance: <Globe className="w-4 h-4" />,
  business: <Briefcase className="w-4 h-4" />,
  language: <GraduationCap className="w-4 h-4" />,
}

function resolveIcon(icon: RecommendationIcon): ReactNode {
  return ICON_MAP[icon] ?? <Zap className="w-4 h-4" />
}

interface RecommendationsWidgetProps {
  countryId?: number
  countryIsoCode?: string
  activeProject?: ExpatriationProject
  onEdit?: () => void
  onHide?: () => void
  onResize?: (size: WidgetSize) => void
  currentSize?: WidgetSize
}

export default function RecommendationsWidget({ 
  countryId,
  activeProject,
  onEdit, 
  onHide,
  onResize,
  currentSize,
}: RecommendationsWidgetProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: country } = useQuery({
    queryKey: ['country', countryId],
    queryFn: () => countryApi.getById(countryId!),
    enabled: !!countryId,
  })

  const recommendations = useProjectRecommendations(activeProject, country)

  const hasContent = !!(
    activeProject &&
    (recommendations.visa || recommendations.freeMovement || recommendations.services.length > 0 || recommendations.actionPlan.length > 0)
  )

  return (
    <Widget 
      title={t('projectRecommendations.title')} 
      icon={Sparkles}
      iconColor="text-gray-600"
      onEdit={onEdit} 
      onHide={onHide} 
      onResize={onResize} 
      currentSize={currentSize}
    >
      <div className="space-y-5">
        {!hasContent ? (
          <div className="text-center text-gray-500 py-8">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-600 mb-1">{t('projectRecommendations.title')}</p>
            <p className="text-xs text-gray-400">{t('projectRecommendations.subtitle')}</p>
          </div>
        ) : (
          <>
            {recommendations.freeMovement && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-800 text-sm">
                    {t('projectRecommendations.freeMovement.title', { defaultValue: 'Aucun visa requis' })}
                  </span>
                </div>
                <p className="text-emerald-700 text-xs leading-relaxed">
                  {t('projectRecommendations.freeMovement.description', {
                    country: country?.countryName,
                    defaultValue:
                      'Votre nationalité bénéficie de la libre circulation : vous pouvez vous installer et travailler en {{country}} sans visa ni titre de séjour.',
                  })}
                </p>
              </div>
            )}

            {recommendations.visa && (
              <div className="bg-gray-900 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {t('projectRecommendations.recommendedVisa')}
                  </h4>
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    recommendations.visa.confidence === 'high'
                      ? 'bg-white/15 text-white'
                      : recommendations.visa.confidence === 'medium'
                        ? 'bg-white/10 text-gray-300'
                        : 'bg-white/5 text-gray-400'
                  }`}>
                    {t(`projectRecommendations.confidence.${recommendations.visa.confidence}`)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-white" />
                  <span className="font-bold text-white text-sm">
                    {t(`visa.types.${recommendations.visa.visaType}`)}
                  </span>
                </div>

                <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                  {t(recommendations.visa.reason, { country: country?.countryName })}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {t(`visa.durations.${recommendations.visa.duration}`)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {t(`visa.timelines.${recommendations.visa.processing}`)}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/services/visa?country=${recommendations.countryCode}`)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-md text-xs font-medium transition-colors"
                  >
                    {t('projectRecommendations.seeDetails')}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {recommendations.actionPlan.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    {t('projectRecommendations.actionPlan.title')}
                  </h4>
                </div>
                <div className="space-y-2">
                  {recommendations.actionPlan.slice(0, 5).map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => step.link && navigate(step.link)}
                      className="w-full border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                        {index + 1}
                      </div>
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 shrink-0">
                        {resolveIcon(step.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{t(step.title)}</p>
                        <p className="text-[11px] text-gray-400 truncate flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {t(step.timeline)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recommendations.services.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    {t('projectRecommendations.servicesTitle')}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendations.services.slice(0, 6).map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => navigate(svc.link)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors hover:bg-gray-50 ${
                        svc.priority === 'high'
                          ? 'border-gray-300 text-gray-900 bg-gray-50'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      <span className="text-gray-500">{resolveIcon(svc.icon)}</span>
                      {t(`projectRecommendations.serviceNames.${svc.id}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Widget>
  )
}