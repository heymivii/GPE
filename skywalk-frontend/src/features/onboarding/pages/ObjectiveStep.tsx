import { useState } from 'react'
import FormField from '../ui/FormField'
import Select from '../ui/Select'
import ToggleGroup from '../ui/ToggleGroup'
import WizardNav from '../components/WizardNav'
import { GOAL_OPTIONS, STAY_DURATION_OPTIONS } from '../data/constants'

interface ObjectiveStepData {
  goal: string
  stayDuration: string
}

interface ObjectiveStepProps {
  data?: ObjectiveStepData
  onNext: (data: ObjectiveStepData) => void
  onBack?: () => void
}

export default function ObjectiveStep({ data, onNext, onBack }: ObjectiveStepProps) {
  const [formData, setFormData] = useState<ObjectiveStepData>({
    goal: data?.goal || '',
    stayDuration: data?.stayDuration || ''
  })

  const [errors, setErrors] = useState<Partial<ObjectiveStepData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<ObjectiveStepData> = {}

    if (!formData.goal) {
      newErrors.goal = 'L\'objectif principal est requis'
    }

    if (!formData.stayDuration) {
      newErrors.stayDuration = 'La durée prévue du séjour est requise'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData)
    }
  }

  const handleFieldChange = (field: keyof ObjectiveStepData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const isNextDisabled = !formData.goal || !formData.stayDuration

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Objectif de votre départ
        </h1>
        <p className="text-gray-600">
          Précisez la raison principale de votre expatriation et sa durée
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label="Objectif principal"
          required
          error={errors.goal}
          id="goal"
        >
          <ToggleGroup
            options={GOAL_OPTIONS}
            value={formData.goal}
            onChange={handleFieldChange('goal')}
            aria-describedby={errors.goal ? 'goal-error' : undefined}
          />
        </FormField>

        <FormField
          label="Durée prévue du séjour"
          required
          error={errors.stayDuration}
          id="stayDuration"
        >
          <Select
            id="stayDuration"
            options={STAY_DURATION_OPTIONS}
            value={formData.stayDuration}
            onChange={handleFieldChange('stayDuration')}
            placeholder="Sélectionnez la durée"
            aria-describedby={errors.stayDuration ? 'stayDuration-error' : undefined}
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