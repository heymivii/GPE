import Widget from './Widget'
import { User, MapPin, Target } from 'lucide-react'
import { COUNTRIES, STATUS_OPTIONS, TRAVEL_PARTY_OPTIONS, GOAL_OPTIONS } from '../../onboarding/data/constants'

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
}

export default function ProfileSummaryWidget({ userData, onEdit, onHide }: ProfileSummaryWidgetProps) {
  const getCountryLabel = (code: string) => 
    COUNTRIES.find(c => c.value === code)?.label || code

  const getOptionLabel = (options: Array<{value: string, label: string}>, value: string) =>
    options.find(o => o.value === value)?.label || value

  if (!userData.onboardingData) {
    return (
      <Widget title="Mon Profil" onEdit={onEdit} onHide={onHide}>
        <div className="text-center text-gray-500 py-8">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Profil en cours de configuration</p>
        </div>
      </Widget>
    )
  }

  const { destination, profile, objective } = userData.onboardingData

  return (
    <Widget title="Mon Profil" onEdit={onEdit} onHide={onHide}>
      <div className="space-y-4">
        {/* Informations personnelles */}
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">{userData.name}</p>
            <p className="text-sm text-gray-600">
              {profile.age} ans • {getOptionLabel(STATUS_OPTIONS, profile.status)} • {getOptionLabel(TRAVEL_PARTY_OPTIONS, profile.travelParty)}
            </p>
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-gray-900">
              {getCountryLabel(destination.fromCountry)} → {getCountryLabel(destination.toCountry)}
            </p>
            <p className="text-sm text-gray-600">
              {destination.targetCity && `${destination.targetCity} • `}Départ prévu en {destination.departureYear}
            </p>
          </div>
        </div>

        {/* Objectif */}
        <div className="flex items-center space-x-3">
          <Target className="w-5 h-5 text-purple-600" />
          <div>
            <p className="font-medium text-gray-900">
              {getOptionLabel(GOAL_OPTIONS, objective.goal)}
            </p>
            <p className="text-sm text-gray-600">Objectif principal</p>
          </div>
        </div>

        {/* Progression */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profil complété</span>
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