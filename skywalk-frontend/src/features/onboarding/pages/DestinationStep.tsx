import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import FormField from '../ui/FormField'
import Select from '../ui/Select'
import TextInput from '../ui/TextInput'
import WizardNav from '../components/WizardNav'

interface DestinationStepData {
  fromCountry: string
  toCountry: string
  targetCity: string
  departureYear: string
}

interface DestinationStepProps {
  data?: DestinationStepData
  isEditMode?: boolean
  onNext: (data: DestinationStepData) => void
  onBack?: () => void
}

import { useSupportedCountries } from '../../../hooks/useSupportedCountries';

export default function DestinationStep({ data, isEditMode, onNext, onBack }: DestinationStepProps) {
  const { t } = useTranslation()
  const { countries: supportedCountries, nonSelectableCodes, citiesByCode, isLoading: isLoadingCities } = useSupportedCountries();

  const [formData, setFormData] = useState<DestinationStepData>({
    fromCountry: data?.fromCountry || '',
    toCountry: data?.toCountry || '',
    targetCity: data?.targetCity || '',
    departureYear: data?.departureYear || ''
  })


  // Origin: every visible country. Destination: excludes "visible mais non sélectionnable" ones.
  const countryOptions = supportedCountries.map(c => ({
    value: c.code,
    label: t(c.i18nKey, { defaultValue: c.name })
  }));
  const destinationOptions = countryOptions.filter(o => !nonSelectableCodes.has(o.value));

  // Active cities (admin-managed `city` table) for the selected destination country.
  // value = idCity so it matches the project's idDestinationCity FK.
  const cityOptions = (citiesByCode[formData.toCountry] ?? []).map(city => ({
    value: city.idCity.toString(),
    label: city.name,
  }));

  useEffect(() => {
    if (data) {
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
      newErrors.fromCountry = t('onboarding.destination.errors.fromCountryRequired')
    }

    if (!formData.toCountry) {
      newErrors.toCountry = t('onboarding.destination.errors.toCountryRequired')
    }

    if (formData.fromCountry && formData.toCountry && formData.fromCountry === formData.toCountry) {
      newErrors.toCountry = t('onboarding.destination.errors.sameCountry')
    }

    if (!formData.departureYear) {
      newErrors.departureYear = t('onboarding.destination.errors.departureYearRequired')
    } else {
      const year = parseInt(formData.departureYear)
      if (isNaN(year) || year < currentYear || year > maxYear) {
        newErrors.departureYear = t('onboarding.destination.errors.departureYearRange', { min: currentYear, max: maxYear })
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
    const newFormData = { ...formData, [field]: value }

    if (field === 'toCountry' && value !== formData.toCountry) {
      newFormData.targetCity = ''
    }

    setFormData(newFormData)

    if (field === 'toCountry' && value && newFormData.fromCountry && value === newFormData.fromCountry) {
      setErrors(prev => ({ ...prev, toCountry: t('onboarding.destination.errors.sameCountry') }))
    } else if (field === 'fromCountry' && value && newFormData.toCountry && value === newFormData.toCountry) {
      setErrors(prev => ({ ...prev, toCountry: t('onboarding.destination.errors.sameCountry') }))
    } else if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const isNextDisabled = !formData.fromCountry || !formData.toCountry || !formData.departureYear

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('onboarding.destination.title')}
        </h1>
        <p className="text-gray-600">
          {t('onboarding.destination.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label={t('onboarding.destination.fromCountry')}
          required
          error={errors.fromCountry}
          id="fromCountry"
          helper={isEditMode ? t('onboarding.destination.cannotChangeCountry') : undefined}
        >
          <Select
            id="fromCountry"
            options={countryOptions}
            value={formData.fromCountry}
            onChange={handleFieldChange('fromCountry')}
            placeholder={t('onboarding.destination.fromCountryPlaceholder')}
            aria-describedby={errors.fromCountry ? 'fromCountry-error' : undefined}
            disabled={isEditMode}
          />
        </FormField>

        <FormField
          label={t('onboarding.destination.toCountry')}
          required
          error={errors.toCountry}
          id="toCountry"
          helper={isEditMode ? t('onboarding.destination.cannotChangeCountry') : undefined}
        >
          <Select
            id="toCountry"
            options={destinationOptions}
            value={formData.toCountry}
            onChange={handleFieldChange('toCountry')}
            placeholder={t('onboarding.destination.toCountryPlaceholder')}
            aria-describedby={errors.toCountry ? 'toCountry-error' : undefined}
            disabled={isEditMode}
          />
        </FormField>

        <FormField
          label={t('onboarding.destination.targetCity')}
          helper={t('onboarding.destination.targetCityHelper')}
          error={errors.targetCity}
          id="targetCity"
        >
          <Select
            id="targetCity"
            options={cityOptions}
            value={formData.targetCity}
            onChange={handleFieldChange('targetCity')}
            placeholder={isLoadingCities ? t('common.loading') : t('onboarding.destination.targetCityPlaceholder')}
            aria-describedby={errors.targetCity ? 'targetCity-error' : 'targetCity-helper'}
            disabled={!formData.toCountry || isLoadingCities}
          />
        </FormField>

        <FormField
          label={t('onboarding.destination.departureYear')}
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