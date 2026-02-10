import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FormField from '../ui/FormField'
import Select from '../ui/Select'
import TextInput from '../ui/TextInput'
import ToggleGroup from '../ui/ToggleGroup'
import MultiPillSelect from '../ui/MultiPillSelect'
import WizardNav from '../components/WizardNav'
import { STATUS_IDS, TRAVEL_PARTY_IDS, LANGUAGE_LEVEL_IDS } from '../data/constants'
import countriesData from '../../../data/countries-data.json'

interface ProfileStepData {
  age: string
  motherTongue?: string
  spokenLanguages?: string[]
  status: string
  travelParty: string
  languageLevel: string
}

interface ProfileStepProps {
  data?: ProfileStepData
  onNext: (data: ProfileStepData) => void
  onBack?: () => void
}

export default function ProfileStep({ data, onNext, onBack }: ProfileStepProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<ProfileStepData>({
    age: data?.age || '',
    motherTongue: data?.motherTongue || '',
    spokenLanguages: data?.spokenLanguages || [],
    status: data?.status || '',
    travelParty: data?.travelParty || '',
    languageLevel: data?.languageLevel || ''
  })

  const availableLanguages = useMemo(() => {
    const languages = new Set<string>()
    countriesData.countries.forEach(country => {
      country.languages.forEach(lang => languages.add(lang))
    })
    return Array.from(languages).sort().map(lang => ({
      value: lang,
      label: lang
    }))
  }, [])

  const [errors, setErrors] = useState<Partial<ProfileStepData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileStepData> = {}

    if (!formData.age) {
      newErrors.age = t('onboarding.profile.errors.ageRequired')
    } else {
      const age = parseInt(formData.age)
      if (isNaN(age) || age < 16 || age > 90) {
        newErrors.age = t('onboarding.profile.errors.ageRange')
      }
    }

    if (!formData.motherTongue) {
      newErrors.motherTongue = t('onboarding.profile.errors.motherTongueRequired')
    }

    if (!formData.status) {
      newErrors.status = t('onboarding.profile.errors.statusRequired')
    }

    if (!formData.travelParty) {
      newErrors.travelParty = t('onboarding.profile.errors.travelPartyRequired')
    }

    if (!formData.languageLevel) {
      newErrors.languageLevel = t('onboarding.profile.errors.languageLevelRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData)
    }
  }

  const handleFieldChange = (field: keyof ProfileStepData) => (value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const statusOptions = useMemo(() => STATUS_IDS.map(id => ({ value: id, label: t(`onboarding.constants.status.${id}`) })), [t])
  const travelPartyOptions = useMemo(() => TRAVEL_PARTY_IDS.map(id => ({ value: id, label: t(`onboarding.constants.travelParty.${id}`) })), [t])
  const languageLevelOptions = useMemo(() => LANGUAGE_LEVEL_IDS.map(id => ({ value: id, label: t(`onboarding.constants.languageLevels.${id}`) })), [t])

  const isNextDisabled = !formData.age || !formData.motherTongue || !formData.status || !formData.travelParty || !formData.languageLevel

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('onboarding.profile.title')}
        </h1>
        <p className="text-gray-600">
          {t('onboarding.profile.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label={t('onboarding.profile.age')}
          required
          error={errors.age}
          id="age"
        >
          <TextInput
            id="age"
            type="number"
            value={formData.age}
            onChange={handleFieldChange('age')}
            placeholder={t('onboarding.profile.agePlaceholder')}
            min={16}
            max={90}
            aria-describedby={errors.age ? 'age-error' : undefined}
          />
        </FormField>

        <FormField
          label={t('onboarding.profile.motherTongue')}
          required
          error={errors.motherTongue}
          id="motherTongue"
        >
          <Select
            id="motherTongue"
            value={formData.motherTongue}
            onChange={handleFieldChange('motherTongue')}
            options={availableLanguages}
            placeholder={t('onboarding.profile.motherTonguePlaceholder')}
            aria-describedby={errors.motherTongue ? 'motherTongue-error' : undefined}
          />
        </FormField>

        <FormField
          label={t('onboarding.profile.spokenLanguages')}
          id="spokenLanguages"
        >
          <MultiPillSelect
            options={availableLanguages}
            values={formData.spokenLanguages || []}
            onChange={handleFieldChange('spokenLanguages')}
          />
        </FormField>

        <FormField
          label={t('onboarding.profile.status')}
          required
          error={errors.status}
          id="status"
        >
          <Select
            id="status"
            options={statusOptions}
            value={formData.status}
            onChange={handleFieldChange('status')}
            placeholder={t('onboarding.profile.statusPlaceholder')}
            aria-describedby={errors.status ? 'status-error' : undefined}
          />
        </FormField>

        <FormField
          label={t('onboarding.profile.travelParty')}
          required
          error={errors.travelParty}
          id="travelParty"
        >
          <ToggleGroup
            options={travelPartyOptions}
            value={formData.travelParty}
            onChange={handleFieldChange('travelParty')}
            aria-describedby={errors.travelParty ? 'travelParty-error' : undefined}
          />
        </FormField>

        <FormField
          label={t('onboarding.profile.languageLevel')}
          required
          error={errors.languageLevel}
          helper={t('onboarding.profile.languageLevelHelper')}
          id="languageLevel"
        >
          <Select
            id="languageLevel"
            options={languageLevelOptions}
            value={formData.languageLevel}
            onChange={handleFieldChange('languageLevel')}
            placeholder={t('onboarding.profile.languageLevelPlaceholder')}
            aria-describedby={errors.languageLevel ? 'languageLevel-error' : 'languageLevel-helper'}
          />
        </FormField>
      </div>

      <WizardNav
        onBack={onBack}
        onNext={handleNext}
        isNextDisabled={isNextDisabled}
      />
    </div>
  )
}