import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FormField from '../ui/FormField'
import MultiPillSelect from '../ui/MultiPillSelect'
import YesNoToggle from '../ui/YesNoToggle'
import WizardNav from '../components/WizardNav'
import { PRIORITY_IDS } from '../data/constants'

interface NeedsStepData {
  priorities: string[]
  needPersonalizedSupport: boolean | undefined
}

interface NeedsStepProps {
  data?: NeedsStepData
  onNext: (data: NeedsStepData) => void
  onBack?: () => void
}

export default function NeedsStep({ data, onNext, onBack }: NeedsStepProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<NeedsStepData>({
    priorities: data?.priorities || [],
    needPersonalizedSupport: data?.needPersonalizedSupport
  })

  const [errors, setErrors] = useState<Partial<Record<keyof NeedsStepData, string>>>({})

  const priorityOptions = useMemo(() => PRIORITY_IDS.map(id => ({ value: id, label: t(`onboarding.constants.priorities.${id}`) })), [t])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NeedsStepData, string>> = {}

    if (!formData.priorities || formData.priorities.length === 0) {
      newErrors.priorities = t('onboarding.needs.errors.prioritiesRequired')
    }

    if (formData.needPersonalizedSupport === undefined) {
      newErrors.needPersonalizedSupport = t('onboarding.needs.errors.supportRequired')
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

  const handleSupportChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, needPersonalizedSupport: value }))
    if (errors.needPersonalizedSupport) {
      setErrors(prev => ({ ...prev, needPersonalizedSupport: undefined }))
    }
  }

  const isNextDisabled = formData.priorities.length === 0 || formData.needPersonalizedSupport === undefined

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

        <FormField
          label={t('onboarding.needs.personalizedSupport')}
          required
          error={errors.needPersonalizedSupport}
          helper={t('onboarding.needs.personalizedSupportHelper')}
          id="personalizedSupport"
        >
          <YesNoToggle
            value={formData.needPersonalizedSupport}
            onChange={handleSupportChange}
            aria-describedby={errors.needPersonalizedSupport ? 'personalizedSupport-error' : 'personalizedSupport-helper'}
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