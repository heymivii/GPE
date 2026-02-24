import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle } from 'lucide-react'
import SummaryCard from '../ui/SummaryCard'
import WizardNav from '../components/WizardNav'
import { COUNTRIES } from '../data/constants'

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
  const { t } = useTranslation()

  const handleComplete = async () => {
    await onComplete()
  }

  const getCountryLabel = useCallback((code: string) => {
    const country = COUNTRIES.find(c => c.value === code)
    return country ? t(country.i18nKey) : code
  }, [t])

  const getTranslatedLabel = useCallback((prefix: string, value: string) =>
    t(`onboarding.constants.${prefix}.${value}`, { defaultValue: value }), [t])

  const getMultipleTranslatedLabels = useCallback((prefix: string, values: string[]) =>
    values.map(v => getTranslatedLabel(prefix, v)).join(', '), [getTranslatedLabel])

  const destinationItems = useMemo(() => [
    { label: t('onboarding.summary.fromCountry'), value: getCountryLabel(data.destination.fromCountry) },
    { label: t('onboarding.summary.toCountry'), value: getCountryLabel(data.destination.toCountry) },
    { label: t('onboarding.summary.targetCity'), value: data.destination.targetCity || t('onboarding.summary.notSpecified') },
    { label: t('onboarding.summary.departureYear'), value: data.destination.departureYear }
  ], [data.destination, t, getCountryLabel])

  const profileItems = useMemo(() => [
    { label: t('onboarding.summary.age'), value: t('onboarding.summary.ageYears', { age: data.profile.age }) },
    { label: t('onboarding.summary.status'), value: getTranslatedLabel('status', data.profile.status) },
    { label: t('onboarding.summary.travel'), value: getTranslatedLabel('travelParty', data.profile.travelParty) },
    { label: t('onboarding.summary.languageLevel'), value: getTranslatedLabel('languageLevels', data.profile.languageLevel) }
  ], [data.profile, t, getTranslatedLabel])

  const objectiveItems = useMemo(() => [
    { label: t('onboarding.summary.mainGoal'), value: getTranslatedLabel('goals', data.objective.goal) },
    { label: t('onboarding.summary.expectedDuration'), value: getTranslatedLabel('stayDuration', data.objective.stayDuration) }
  ], [data.objective, t, getTranslatedLabel])

  const preparationItems = useMemo(() => [
    {
      label: t('onboarding.summary.stepsDone'),
      value: data.preparation.stepsDone.length > 0
        ? getMultipleTranslatedLabels('stepsDone', data.preparation.stepsDone)
        : t('onboarding.summary.none')
    },
    { label: t('onboarding.summary.housingBudget'), value: t('onboarding.summary.housingBudgetValue', { budget: data.preparation.housingBudget }) }
  ], [data.preparation, t, getMultipleTranslatedLabels])

  const needsItems = useMemo(() => [
    {
      label: t('onboarding.summary.prioritiesLabel'),
      value: getMultipleTranslatedLabels('priorities', data.needs.priorities)
    }
  ], [data.needs, t, getMultipleTranslatedLabels])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('onboarding.summary.title')}
        </h1>
        <p className="text-gray-600">
          {t('onboarding.summary.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        <SummaryCard
          title={t('onboarding.summary.destinationCard')}
          items={destinationItems}
          onEdit={() => onEdit(1)}
        />

        <SummaryCard
          title={t('onboarding.summary.profileCard')}
          items={profileItems}
          onEdit={() => onEdit(2)}
        />

        <SummaryCard
          title={t('onboarding.summary.objectiveCard')}
          items={objectiveItems}
          onEdit={() => onEdit(3)}
        />

        <SummaryCard
          title={t('onboarding.summary.preparationCard')}
          items={preparationItems}
          onEdit={() => onEdit(4)}
        />

        <SummaryCard
          title={t('onboarding.summary.needsCard')}
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
              {t('onboarding.summary.readyTitle')}
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              {t('onboarding.summary.readyDesc')}
            </p>
          </div>
        </div>
      </div>

      <WizardNav
        onBack={onBack}
        onNext={handleComplete}
        isNextDisabled={isSubmitting}
        nextLabel={isSubmitting ? t('onboarding.summary.creatingLabel') : t('onboarding.summary.submitLabel')}
        isLastStep={true}
      />
    </div>
  )
}