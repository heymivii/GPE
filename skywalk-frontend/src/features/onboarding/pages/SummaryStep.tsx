import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import SummaryCard from '../ui/SummaryCard'
import WizardNav from '../components/WizardNav'
import { COUNTRIES } from '../data/constants'
import { destinationsApi } from '../../../api/destinations'
import { SUPPORTED_COUNTRIES } from '../../../data/supportedCountries'
import { nationalityLabel } from '../../../data/freeMovement'

interface AllStepsData {
  destination: {
    fromCountry: string
    toCountry: string
    targetCity: string
    departureYear: string
    departureDate?: string
    nationality?: string
  }
  profile: {
    age: string
    status: string
    travelParty: string
    languageLevel: string
    hasChildren?: boolean
    hasJobOffer?: boolean
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
  /** Édition d'un projet existant : on enregistre des modifications, on ne crée rien. */
  isEditMode?: boolean
}

export default function SummaryStep({ data, onBack, onEdit, onComplete, isSubmitting = false, isEditMode = false }: SummaryStepProps) {
  const { t, i18n } = useTranslation()

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

  const notSet = t('onboarding.summary.notSpecified')
  // Nom distinct de l'import `nationalityLabel` : le même nom masquait l'import et
  // la fonction s'appelait elle-même → « Maximum call stack size exceeded ».
  const formatNationality = useCallback(
    (code?: string) => (code ? nationalityLabel(code, i18n.language) : notSet),
    [i18n.language, notSet]
  )

  const selectedCountrySlug = useMemo(() => {
    return SUPPORTED_COUNTRIES.find(c => c.code === data.destination.toCountry)?.slug;
  }, [data.destination.toCountry]);

  const { data: countryDetail } = useQuery({
    queryKey: ['destination', selectedCountrySlug],
    queryFn: () => destinationsApi.getBySlug(selectedCountrySlug!),
    enabled: !!selectedCountrySlug,
  });

  const targetCityName = useMemo(() => {
    if (!data.destination.targetCity) return t('onboarding.summary.notSpecified');
    const cityId = parseInt(data.destination.targetCity, 10);
    if (!isNaN(cityId) && countryDetail?.cities) {
      const city = countryDetail.cities.find(c => (c.id === cityId || c.city_id === cityId));
      return city ? city.name : t('onboarding.summary.notSpecified');
    }
    // Fallback support for legacy drafts storing the name directly
    return data.destination.targetCity;
  }, [data.destination.targetCity, countryDetail, t]);

  const departureDisplay = data.destination.departureDate
    ? new Date(data.destination.departureDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : data.destination.departureYear
  const destinationItems = useMemo(() => [
    { label: t('onboarding.summary.fromCountry'), value: getCountryLabel(data.destination.fromCountry) },
    { label: t('onboarding.summary.nationality', { defaultValue: 'Nationalité' }), value: formatNationality(data.destination.nationality) },
    { label: t('onboarding.summary.toCountry'), value: getCountryLabel(data.destination.toCountry) },
    { label: t('onboarding.summary.targetCity'), value: targetCityName },
    { label: t('onboarding.summary.departureDate', { defaultValue: 'Date de départ' }), value: departureDisplay }
  ], [data.destination, t, getCountryLabel, targetCityName, departureDisplay, formatNationality])

  const profileItems = useMemo(() => [
    { label: t('onboarding.summary.age'), value: t('onboarding.summary.ageYears', { age: data.profile.age }) },
    { label: t('onboarding.summary.status'), value: getTranslatedLabel('status', data.profile.status) },
    { label: t('onboarding.summary.travel'), value: getTranslatedLabel('travelParty', data.profile.travelParty) },
    { label: t('onboarding.summary.languageLevel'), value: getTranslatedLabel('languageLevels', data.profile.languageLevel) }
  ], [data.profile, t, getTranslatedLabel])

  // Steps 3-5 are optional (skippable) — every field guards against a missing section.
  const objectiveItems = useMemo(() => [
    { label: t('onboarding.summary.mainGoal'), value: data.objective?.goal ? getTranslatedLabel('goals', data.objective.goal) : notSet },
    { label: t('onboarding.summary.expectedDuration'), value: data.objective?.stayDuration ? getTranslatedLabel('stayDuration', data.objective.stayDuration) : notSet }
  ], [data.objective, t, getTranslatedLabel, notSet])

  const preparationItems = useMemo(() => [
    {
      label: t('onboarding.summary.stepsDone'),
      value: (data.preparation?.stepsDone?.length ?? 0) > 0
        ? getMultipleTranslatedLabels('stepsDone', data.preparation!.stepsDone)
        : t('onboarding.summary.none')
    },
    { label: t('onboarding.summary.housingBudget'), value: data.preparation?.housingBudget ? t('onboarding.summary.housingBudgetValue', { budget: data.preparation.housingBudget }) : notSet }
  ], [data.preparation, t, getMultipleTranslatedLabels, notSet])

  const needsItems = useMemo(() => [
    {
      label: t('onboarding.summary.prioritiesLabel'),
      value: (data.needs?.priorities?.length ?? 0) > 0
        ? getMultipleTranslatedLabels('priorities', data.needs!.priorities)
        : notSet
    }
  ], [data.needs, t, getMultipleTranslatedLabels, notSet])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('onboarding.summary.title')}
        </h1>
        <p className="text-gray-600">
          {t(isEditMode ? 'onboarding.summary.subtitleEdit' : 'onboarding.summary.subtitle')}
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
              {t(isEditMode ? 'onboarding.summary.readyTitleEdit' : 'onboarding.summary.readyTitle')}
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              {t(isEditMode ? 'onboarding.summary.readyDescEdit' : 'onboarding.summary.readyDesc')}
            </p>
          </div>
        </div>
      </div>

      <WizardNav
        onBack={onBack}
        onNext={handleComplete}
        isNextDisabled={isSubmitting}
        nextLabel={
          isSubmitting
            ? t(isEditMode ? 'onboarding.summary.savingLabel' : 'onboarding.summary.creatingLabel')
            : t(isEditMode ? 'onboarding.summary.submitLabelEdit' : 'onboarding.summary.submitLabel')
        }
        isLastStep={true}
      />
    </div>
  )
}