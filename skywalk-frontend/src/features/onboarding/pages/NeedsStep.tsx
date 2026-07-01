import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FormField from '../ui/FormField'
import MultiPillSelect from '../ui/MultiPillSelect'
import WizardNav from '../components/WizardNav'
import { PRIORITY_IDS } from '../data/constants'

interface NeedsStepData {
  priorities: string[]
}

interface NeedsStepProps {
  data?: NeedsStepData
  onNext: (data: NeedsStepData) => void
  onBack?: () => void
  onSkip?: () => void
}

export default function NeedsStep({ data, onNext, onBack, onSkip }: NeedsStepProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<NeedsStepData>({
    priorities: data?.priorities || [],
  })

  const [errors, setErrors] = useState<Partial<Record<keyof NeedsStepData, string>>>({})

  const priorityOptions = useMemo(() => PRIORITY_IDS.map(id => ({ value: id, label: t(`onboarding.constants.priorities.${id}`) })), [t])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NeedsStepData, string>> = {}

    if (!formData.priorities || formData.priorities.length === 0) {
      newErrors.priorities = t('onboarding.needs.errors.prioritiesRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData)
    }
  }

  const handlePrioritiesChange = (values: string[]) => {
    setFormData(prev => ({ ...prev, priorities: values }))
    if (errors.priorities) {
      setErrors(prev => ({ ...prev, priorities: undefined }))
    }
  }

  const isNextDisabled = formData.priorities.length === 0

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('onboarding.needs.title')}
        </h1>
        <p className="text-gray-600">
          {t('onboarding.needs.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label={t('onboarding.needs.priorities')}
          required
          error={errors.priorities}
          helper={t('onboarding.needs.prioritiesHelper')}
          id="priorities"
        >
          <MultiPillSelect
            options={priorityOptions}
            values={formData.priorities}
            onChange={handlePrioritiesChange}
            aria-describedby={errors.priorities ? 'priorities-error' : 'priorities-helper'}
          />
        </FormField>
      </div>

      <WizardNav
        onBack={onBack}
        onSkip={onSkip}
        onNext={handleNext}
        isNextDisabled={isNextDisabled}
      />
    </div>
  )
}