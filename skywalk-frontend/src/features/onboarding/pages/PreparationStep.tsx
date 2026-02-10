import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FormField from '../ui/FormField'
import CurrencyInput from '../ui/CurrencyInput'
import MultiPillSelect from '../ui/MultiPillSelect'
import WizardNav from '../components/WizardNav'
import { STEPS_DONE_IDS } from '../data/constants'

interface PreparationStepData {
  stepsDone: string[]
  housingBudget: string
}

interface PreparationStepProps {
  data?: PreparationStepData
  onNext: (data: PreparationStepData) => void
  onBack?: () => void
  currency?: string
}

export default function PreparationStep({ data, onNext, onBack, currency = "€" }: PreparationStepProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<PreparationStepData>({
    stepsDone: data?.stepsDone || [],
    housingBudget: data?.housingBudget || ''
  })

  const [errors, setErrors] = useState<Partial<PreparationStepData>>({})

  const stepsDoneOptions = useMemo(() => STEPS_DONE_IDS.map(id => ({ value: id, label: t(`onboarding.constants.stepsDone.${id}`) })), [t])

  const validateForm = (): boolean => {
    const newErrors: Partial<PreparationStepData> = {}

    if (!formData.housingBudget || formData.housingBudget === '') {
      newErrors.housingBudget = t('onboarding.preparation.errors.housingBudgetRequired')
    } else {
      const budget = parseFloat(formData.housingBudget)
      if (isNaN(budget) || budget < 0) {
        newErrors.housingBudget = t('onboarding.preparation.errors.housingBudgetMin', { currency })
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

  const handleStepsDoneChange = (values: string[]) => {
    setFormData(prev => ({ ...prev, stepsDone: values }))
    if (errors.stepsDone) {
      setErrors(prev => ({ ...prev, stepsDone: undefined }))
    }
  }

  const handleBudgetChange = (value: string) => {
    setFormData(prev => ({ ...prev, housingBudget: value }))
    if (errors.housingBudget) {
      setErrors(prev => ({ ...prev, housingBudget: undefined }))
    }
  }

  const isNextDisabled = !formData.housingBudget

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('onboarding.preparation.title')}
        </h1>
        <p className="text-gray-600">
          {t('onboarding.preparation.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label={t('onboarding.preparation.stepsDone')}
          helper={t('onboarding.preparation.stepsDoneHelper')}
          id="stepsDone"
        >
          <MultiPillSelect
            options={stepsDoneOptions}
            values={formData.stepsDone}
            onChange={handleStepsDoneChange}
            exclusiveValue="none"
            aria-describedby={errors.stepsDone ? 'stepsDone-error' : 'stepsDone-helper'}
          />
        </FormField>

        <FormField
          label={t('onboarding.preparation.housingBudget')}
          required
          error={errors.housingBudget}
          helper={t('onboarding.preparation.housingBudgetHelper')}
          id="housingBudget"
        >
          <CurrencyInput
            id="housingBudget"
            value={formData.housingBudget}
            onChange={handleBudgetChange}
            placeholder={t('onboarding.preparation.housingBudgetPlaceholder')}
            currency={currency}
            aria-describedby={errors.housingBudget ? 'housingBudget-error' : 'housingBudget-helper'}
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