import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FormField from '../ui/FormField'
import Select from '../ui/Select'
import ToggleGroup from '../ui/ToggleGroup'
import WizardNav from '../components/WizardNav'
import { GOAL_IDS, STAY_DURATION_IDS } from '../data/constants'

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
  const { t } = useTranslation()
  const [formData, setFormData] = useState<ObjectiveStepData>({
    goal: data?.goal || '',
    stayDuration: data?.stayDuration || ''
  })

  const [errors, setErrors] = useState<Partial<ObjectiveStepData>>({})

  const goalOptions = useMemo(() => GOAL_IDS.map(id => ({ value: id, label: t(`onboarding.constants.goals.${id}`) })), [t])
  const stayDurationOptions = useMemo(() => STAY_DURATION_IDS.map(id => ({ value: id, label: t(`onboarding.constants.stayDuration.${id}`) })), [t])

  const validateForm = (): boolean => {
    const newErrors: Partial<ObjectiveStepData> = {}

    if (!formData.goal) {
      newErrors.goal = t('onboarding.objective.errors.goalRequired')
    }

    if (!formData.stayDuration) {
      newErrors.stayDuration = t('onboarding.objective.errors.stayDurationRequired')
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
          {t('onboarding.objective.title')}
        </h1>
        <p className="text-gray-600">
          {t('onboarding.objective.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label={t('onboarding.objective.goal')}
          required
          error={errors.goal}
          id="goal"
        >
          <ToggleGroup
            options={goalOptions}
            value={formData.goal}
            onChange={handleFieldChange('goal')}
            aria-describedby={errors.goal ? 'goal-error' : undefined}
          />
        </FormField>

        <FormField
          label={t('onboarding.objective.stayDuration')}
          required
          error={errors.stayDuration}
          id="stayDuration"
        >
          <Select
            id="stayDuration"
            options={stayDurationOptions}
            value={formData.stayDuration}
            onChange={handleFieldChange('stayDuration')}
            placeholder={t('onboarding.objective.stayDurationPlaceholder')}
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