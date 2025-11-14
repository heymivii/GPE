import { useState } from 'react'
import FormField from '../ui/FormField'
import CurrencyInput from '../ui/CurrencyInput'
import MultiPillSelect from '../ui/MultiPillSelect'
import WizardNav from '../components/WizardNav'
import { STEPS_DONE_OPTIONS } from '../data/constants'

interface PreparationStepData {
  stepsDone: string[]
  housingBudget: string
}

interface PreparationStepProps {
  data?: PreparationStepData
  onNext: (data: PreparationStepData) => void
  onBack?: () => void
}

export default function PreparationStep({ data, onNext, onBack }: PreparationStepProps) {
  const [formData, setFormData] = useState<PreparationStepData>({
    stepsDone: data?.stepsDone || [],
    housingBudget: data?.housingBudget || ''
  })

  const [errors, setErrors] = useState<Partial<PreparationStepData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<PreparationStepData> = {}

    if (!formData.housingBudget || formData.housingBudget === '') {
      newErrors.housingBudget = 'Le budget logement est requis'
    } else {
      const budget = parseFloat(formData.housingBudget)
      if (isNaN(budget) || budget < 0 || budget > 10000) {
        newErrors.housingBudget = 'Le budget doit être entre 0 et 10 000 €'
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
          Préparation & moyens
        </h1>
        <p className="text-gray-600">
          Où en êtes-vous dans vos préparatifs et quel est votre budget ?
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label="Démarches déjà effectuées"
          helper="Sélectionnez toutes les démarches que vous avez déjà entreprises"
          id="stepsDone"
        >
          <MultiPillSelect
            options={STEPS_DONE_OPTIONS}
            values={formData.stepsDone}
            onChange={handleStepsDoneChange}
            exclusiveValue="none"
            aria-describedby={errors.stepsDone ? 'stepsDone-error' : 'stepsDone-helper'}
          />
        </FormField>

        <FormField
          label="Budget mensuel pour le logement"
          required
          error={errors.housingBudget}
          helper="Montant maximum que vous souhaitez consacrer au logement par mois"
          id="housingBudget"
        >
          <CurrencyInput
            id="housingBudget"
            value={formData.housingBudget}
            onChange={handleBudgetChange}
            placeholder="Ex: 800"
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