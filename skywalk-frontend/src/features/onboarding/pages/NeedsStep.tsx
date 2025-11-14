import { useState } from 'react'
import FormField from '../ui/FormField'
import MultiPillSelect from '../ui/MultiPillSelect'
import YesNoToggle from '../ui/YesNoToggle'
import WizardNav from '../components/WizardNav'
import { PRIORITY_OPTIONS } from '../data/constants'

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
  const [formData, setFormData] = useState<NeedsStepData>({
    priorities: data?.priorities || [],
    needPersonalizedSupport: data?.needPersonalizedSupport
  })

  const [errors, setErrors] = useState<Partial<Record<keyof NeedsStepData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NeedsStepData, string>> = {}

    if (!formData.priorities || formData.priorities.length === 0) {
      newErrors.priorities = 'Veuillez sélectionner au moins une thématique prioritaire'
    }

    if (formData.needPersonalizedSupport === undefined) {
      newErrors.needPersonalizedSupport = 'Veuillez indiquer si vous souhaitez un accompagnement personnalisé'
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
          Vos besoins spécifiques
        </h1>
        <p className="text-gray-600">
          Aidez-nous à identifier vos priorités pour personnaliser notre accompagnement
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label="Thématiques prioritaires"
          required
          error={errors.priorities}
          helper="Sélectionnez au moins une thématique qui vous préoccupe le plus"
          id="priorities"
        >
          <MultiPillSelect
            options={PRIORITY_OPTIONS}
            values={formData.priorities}
            onChange={handlePrioritiesChange}
            aria-describedby={errors.priorities ? 'priorities-error' : 'priorities-helper'}
          />
        </FormField>

        <FormField
          label="Accompagnement personnalisé"
          required
          error={errors.needPersonalizedSupport}
          helper="Souhaitez-vous bénéficier d'un accompagnement individuel avec un conseiller ?"
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