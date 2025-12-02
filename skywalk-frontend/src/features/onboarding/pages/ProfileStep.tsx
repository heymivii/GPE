import { useState, useMemo } from 'react'
import FormField from '../ui/FormField'
import Select from '../ui/Select'
import TextInput from '../ui/TextInput'
import ToggleGroup from '../ui/ToggleGroup'
import MultiPillSelect from '../ui/MultiPillSelect'
import WizardNav from '../components/WizardNav'
import { STATUS_OPTIONS, TRAVEL_PARTY_OPTIONS, LANGUAGE_LEVELS } from '../data/constants'
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
      newErrors.age = 'L\'âge est requis'
    } else {
      const age = parseInt(formData.age)
      if (isNaN(age) || age < 16 || age > 90) {
        newErrors.age = 'L\'âge doit être entre 16 et 90 ans'
      }
    }

    if (!formData.motherTongue) {
      newErrors.motherTongue = 'La langue maternelle est requise'
    }

    if (!formData.status) {
      newErrors.status = 'Le statut actuel est requis'
    }

    if (!formData.travelParty) {
      newErrors.travelParty = 'Veuillez indiquer avec qui vous voyagez'
    }

    if (!formData.languageLevel) {
      newErrors.languageLevel = 'Le niveau de langue est requis'
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

  const isNextDisabled = !formData.age || !formData.motherTongue || !formData.status || !formData.travelParty || !formData.languageLevel

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Votre profil personnel
        </h1>
        <p className="text-gray-600">
          Aidez-nous à mieux vous connaître pour personnaliser nos conseils
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label="Âge"
          required
          error={errors.age}
          id="age"
        >
          <TextInput
            id="age"
            type="number"
            value={formData.age}
            onChange={handleFieldChange('age')}
            placeholder="Ex: 25"
            min={16}
            max={90}
            aria-describedby={errors.age ? 'age-error' : undefined}
          />
        </FormField>

        <FormField
          label="Langue maternelle"
          required
          error={errors.motherTongue}
          id="motherTongue"
        >
          <Select
            id="motherTongue"
            value={formData.motherTongue}
            onChange={handleFieldChange('motherTongue')}
            options={availableLanguages}
            placeholder="Sélectionnez votre langue maternelle"
            aria-describedby={errors.motherTongue ? 'motherTongue-error' : undefined}
          />
        </FormField>

        <FormField
          label="Autres langues parlées (optionnel)"
          id="spokenLanguages"
        >
          <MultiPillSelect
            options={availableLanguages}
            values={formData.spokenLanguages || []}
            onChange={handleFieldChange('spokenLanguages')}
          />
        </FormField>

        <FormField
          label="Statut actuel"
          required
          error={errors.status}
          id="status"
        >
          <Select
            id="status"
            options={STATUS_OPTIONS}
            value={formData.status}
            onChange={handleFieldChange('status')}
            placeholder="Sélectionnez votre statut"
            aria-describedby={errors.status ? 'status-error' : undefined}
          />
        </FormField>

        <FormField
          label="Vous voyagez..."
          required
          error={errors.travelParty}
          id="travelParty"
        >
          <ToggleGroup
            options={TRAVEL_PARTY_OPTIONS}
            value={formData.travelParty}
            onChange={handleFieldChange('travelParty')}
            aria-describedby={errors.travelParty ? 'travelParty-error' : undefined}
          />
        </FormField>

        <FormField
          label="Niveau de langue du pays de destination"
          required
          error={errors.languageLevel}
          helper="Indiquez votre niveau de maîtrise de la langue principale parlée dans le pays où vous souhaitez vous expatrier. (Selon le Cadre européen commun de référence - CECRL)"
          id="languageLevel"
        >
          <Select
            id="languageLevel"
            options={LANGUAGE_LEVELS}
            value={formData.languageLevel}
            onChange={handleFieldChange('languageLevel')}
            placeholder="Sélectionnez votre niveau"
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