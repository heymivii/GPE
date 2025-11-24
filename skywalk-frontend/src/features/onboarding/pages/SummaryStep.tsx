import { CheckCircle } from 'lucide-react'
import SummaryCard from '../ui/SummaryCard'
import WizardNav from '../components/WizardNav'
import { 
  COUNTRIES, 
  STATUS_OPTIONS, 
  TRAVEL_PARTY_OPTIONS, 
  LANGUAGE_LEVELS,
  GOAL_OPTIONS,
  STAY_DURATION_OPTIONS,
  STEPS_DONE_OPTIONS,
  PRIORITY_OPTIONS
} from '../data/constants'

interface AllStepsData {
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
    languageLevel: string
  }
  objective: {
    goal: string
    stayDuration: string
  }
  preparation: {
    stepsDone: string[]
    housingBudget: string
  }
  needs: {
    priorities: string[]
    needPersonalizedSupport: boolean | undefined
  }
}

interface SummaryStepProps {
  data: AllStepsData
  onBack?: () => void
  onEdit: (step: number) => void
  onComplete: () => void
  isSubmitting?: boolean
}

export default function SummaryStep({ data, onBack, onEdit, onComplete, isSubmitting = false }: SummaryStepProps) {
  const handleComplete = async () => {
    await onComplete()
  }

  const getCountryLabel = (code: string) => 
    COUNTRIES.find(c => c.value === code)?.label || code

  const getOptionLabel = (options: Array<{value: string, label: string}>, value: string) =>
    options.find(o => o.value === value)?.label || value

  const getMultipleLabels = (options: Array<{value: string, label: string}>, values: string[]) =>
    values.map(v => getOptionLabel(options, v)).join(', ')

  const destinationItems = [
    { label: 'Pays de départ', value: getCountryLabel(data.destination.fromCountry) },
    { label: 'Pays de destination', value: getCountryLabel(data.destination.toCountry) },
    { label: 'Ville cible', value: data.destination.targetCity || 'Non précisée' },
    { label: 'Année de départ', value: data.destination.departureYear }
  ]

  const profileItems = [
    { label: 'Âge', value: `${data.profile.age} ans` },
    { label: 'Statut', value: getOptionLabel(STATUS_OPTIONS, data.profile.status) },
    { label: 'Voyage', value: getOptionLabel(TRAVEL_PARTY_OPTIONS, data.profile.travelParty) },
    { label: 'Niveau de langue', value: getOptionLabel(LANGUAGE_LEVELS, data.profile.languageLevel) }
  ]

  const objectiveItems = [
    { label: 'Objectif principal', value: getOptionLabel(GOAL_OPTIONS, data.objective.goal) },
    { label: 'Durée prévue', value: getOptionLabel(STAY_DURATION_OPTIONS, data.objective.stayDuration) }
  ]

  const preparationItems = [
    { 
      label: 'Démarches effectuées', 
      value: data.preparation.stepsDone.length > 0 
        ? getMultipleLabels(STEPS_DONE_OPTIONS, data.preparation.stepsDone)
        : 'Aucune'
    },
    { label: 'Budget logement', value: `${data.preparation.housingBudget} € / mois` }
  ]

  const needsItems = [
    { 
      label: 'Priorités', 
      value: getMultipleLabels(PRIORITY_OPTIONS, data.needs.priorities)
    },
    { 
      label: 'Accompagnement personnalisé', 
      value: data.needs.needPersonalizedSupport ? 'Oui' : 'Non'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Récapitulatif de votre profil
        </h1>
        <p className="text-gray-600">
          Vérifiez vos informations avant de valider votre profil d'expatriation
        </p>
      </div>

      <div className="space-y-4">
        <SummaryCard
          title="Destination"
          items={destinationItems}
          onEdit={() => onEdit(1)}
        />

        <SummaryCard
          title="Profil personnel"
          items={profileItems}
          onEdit={() => onEdit(2)}
        />

        <SummaryCard
          title="Objectif du départ"
          items={objectiveItems}
          onEdit={() => onEdit(3)}
        />

        <SummaryCard
          title="Préparation & moyens"
          items={preparationItems}
          onEdit={() => onEdit(4)}
        />

        <SummaryCard
          title="Besoins spécifiques"
          items={needsItems}
          onEdit={() => onEdit(5)}
        />
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mt-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Prêt à commencer votre aventure ?
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              En validant votre profil, vous accéderez à des recommandations personnalisées 
              et pourrez commencer à planifier votre expatriation avec nos outils.
            </p>
          </div>
        </div>
      </div>

      <WizardNav
        onBack={onBack}
        onNext={handleComplete}
        isNextDisabled={isSubmitting}
        nextLabel={isSubmitting ? "Création du projet en cours..." : "Valider et créer mon projet"}
        isLastStep={true}
      />
    </div>
  )
}