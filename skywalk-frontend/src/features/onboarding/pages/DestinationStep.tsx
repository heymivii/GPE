import { useState, useEffect } from 'react'
import FormField from '../ui/FormField'
import Select from '../ui/Select'
import TextInput from '../ui/TextInput'
import WizardNav from '../components/WizardNav'
import { COUNTRIES } from '../data/constants'

interface DestinationStepData {
  fromCountry: string
  toCountry: string
  targetCity: string
  departureYear: string
}

interface DestinationStepProps {
  data?: DestinationStepData
  onNext: (data: DestinationStepData) => void
  onBack?: () => void
}

export default function DestinationStep({ data, onNext, onBack }: DestinationStepProps) {
  const [formData, setFormData] = useState<DestinationStepData>({
    fromCountry: data?.fromCountry || '',
    toCountry: data?.toCountry || '',
    targetCity: data?.targetCity || '',
    departureYear: data?.departureYear || ''
  })

  // 🔄 Synchroniser avec les données du projet en mode édition
  useEffect(() => {
    if (data) {
      console.log('📝 DestinationStep - Syncing data:', data)
      setFormData({
        fromCountry: data.fromCountry || '',
        toCountry: data.toCountry || '',
        targetCity: data.targetCity || '',
        departureYear: data.departureYear || ''
      })
    }
  }, [data])

  const [errors, setErrors] = useState<Partial<DestinationStepData>>({})

  const currentYear = new Date().getFullYear()
  const maxYear = currentYear + 10

  const validateForm = (): boolean => {
    const newErrors: Partial<DestinationStepData> = {}

    if (!formData.fromCountry) {
      newErrors.fromCountry = 'Le pays de départ est requis'
    }

    if (!formData.toCountry) {
      newErrors.toCountry = 'Le pays de destination est requis'
    }

    if (formData.fromCountry && formData.toCountry && formData.fromCountry === formData.toCountry) {
      newErrors.toCountry = 'Le pays de destination doit être différent du pays de départ'
    }

    if (!formData.departureYear) {
      newErrors.departureYear = 'L\'année de départ est requise'
    } else {
      const year = parseInt(formData.departureYear)
      if (isNaN(year) || year < currentYear || year > maxYear) {
        newErrors.departureYear = `L'année doit être entre ${currentYear} et ${maxYear}`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData)
    }
  }

  const handleFieldChange = (field: keyof DestinationStepData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const isNextDisabled = !formData.fromCountry || !formData.toCountry || !formData.departureYear

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Votre destination
        </h1>
        <p className="text-gray-600">
          Dites-nous d'où vous partez et où vous souhaitez vous installer
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label="Pays de départ"
          required
          error={errors.fromCountry}
          id="fromCountry"
        >
          <Select
            id="fromCountry"
            options={COUNTRIES}
            value={formData.fromCountry}
            onChange={handleFieldChange('fromCountry')}
            placeholder="Sélectionnez votre pays de départ"
            aria-describedby={errors.fromCountry ? 'fromCountry-error' : undefined}
          />
        </FormField>

        <FormField
          label="Pays de destination"
          required
          error={errors.toCountry}
          id="toCountry"
        >
          <Select
            id="toCountry"
            options={COUNTRIES}
            value={formData.toCountry}
            onChange={handleFieldChange('toCountry')}
            placeholder="Sélectionnez votre pays de destination"
            aria-describedby={errors.toCountry ? 'toCountry-error' : undefined}
          />
        </FormField>

        <FormField
          label="Ville cible (optionnel)"
          helper="Si vous avez déjà une ville en tête"
          error={errors.targetCity}
          id="targetCity"
        >
          <TextInput
            id="targetCity"
            value={formData.targetCity}
            onChange={handleFieldChange('targetCity')}
            placeholder="Ex: Zurich, Toronto, Lisbonne..."
            aria-describedby={errors.targetCity ? 'targetCity-error' : 'targetCity-helper'}
          />
        </FormField>

        <FormField
          label="Année de départ prévue"
          required
          error={errors.departureYear}
          id="departureYear"
        >
          <TextInput
            id="departureYear"
            type="year"
            value={formData.departureYear}
            onChange={handleFieldChange('departureYear')}
            placeholder={currentYear.toString()}
            min={currentYear}
            max={maxYear}
            aria-describedby={errors.departureYear ? 'departureYear-error' : undefined}
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