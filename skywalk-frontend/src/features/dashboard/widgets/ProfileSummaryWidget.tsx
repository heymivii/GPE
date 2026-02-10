import Widget from './Widget'
import { User, MapPin, Target } from 'lucide-react'
import { COUNTRIES } from '../../onboarding/data/constants'
import { useTranslation } from 'react-i18next'
import type { WidgetSize } from '../hooks/useDashboardPreferences'

interface ProfileSummaryWidgetProps {
  userData: {
    name: string
    onboardingData?: {
      destination: {
        fromCountry: string
        toCountry: string
        targetCity: string
        departureYear: string
      }
      profile: {
        age: string
        status: string
        travelParty: string
      }
      objective: {
        goal: string
      }
    }
  }
  onEdit?: () => void
  onHide?: () => void
  onResize?: (size: WidgetSize) => void
  currentSize?: WidgetSize
}

export default function ProfileSummaryWidget({ userData, onEdit, onHide, onResize, currentSize }: ProfileSummaryWidgetProps) {
  const { t } = useTranslation()
  
  const getCountryLabel = (code: string) => {
    const country = COUNTRIES.find(c => c.value === code)
    return country ? t(country.i18nKey) : code
  }

  if (!userData.onboardingData) {
    return (
      <Widget title={t('dashboard.personalized.widgets.profileSummary.title')} onEdit={onEdit} onHide={onHide} onResize={onResize} currentSize={currentSize}>
        <div className="text-center text-gray-500 py-8">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>{t('dashboard.personalized.widgets.profileSummary.emptyState')}</p>
        </div>
      </Widget>
    )
  }

  const { destination, profile, objective } = userData.onboardingData

  return (
    <Widget title={t('dashboard.personalized.widgets.profileSummary.title')} onEdit={onEdit} onHide={onHide} onResize={onResize} currentSize={currentSize}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">{userData.name}</p>
            <p className="text-sm text-gray-600">
              {profile.age} {t('dashboard.personalized.widgets.profileSummary.age')} • {t(`onboarding.constants.status.${profile.status}`)} • {t(`onboarding.constants.travelParty.${profile.travelParty}`)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-gray-900">
              {getCountryLabel(destination.fromCountry)} → {getCountryLabel(destination.toCountry)}
            </p>
            <p className="text-sm text-gray-600">
              {destination.targetCity && `${destination.targetCity} • `}{t('dashboard.personalized.widgets.profileSummary.departureIn')} {destination.departureYear}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Target className="w-5 h-5 text-purple-600" />
          <div>
            <p className="font-medium text-gray-900">
              {t(`onboarding.constants.goal.${objective.goal}`)}
            </p>
            <p className="text-sm text-gray-600">{t('dashboard.personalized.widgets.profileSummary.mainGoal')}</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t('dashboard.personalized.widgets.profileSummary.profileCompleted')}</span>
            <span className="text-sm font-medium text-green-600">100%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full w-full transition-all duration-300"></div>
          </div>
        </div>
      </div>
    </Widget>
  )
}