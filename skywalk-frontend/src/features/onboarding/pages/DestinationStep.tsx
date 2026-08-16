import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import FormField from '../ui/FormField'
import Select from '../ui/Select'
import WizardNav from '../components/WizardNav'

interface DestinationStepData {
  fromCountry: string
  toCountry: string
  targetCity: string
  departureYear: string
  /** Full ISO date (YYYY-MM-DD) — precise departure, powers the deadline countdown. */
  departureDate?: string
  /** Citizenship (ISO2) — the visa determinant. */
  nationality?: string
}

interface DestinationStepProps {
  data?: DestinationStepData
  isEditMode?: boolean
  onNext: (data: DestinationStepData) => void
  onBack?: () => void
}

import { useSupportedCountries } from '../../../hooks/useSupportedCountries';
import { NATIONALITY_OPTIONS } from '../../../data/freeMovement';

export default function DestinationStep({ data, isEditMode, onNext, onBack }: DestinationStepProps) {
  const { t } = useTranslation()
  const { countries: supportedCountries, nonSelectableCodes, citiesByCode, isLoading: isLoadingCities } = useSupportedCountries();

  const [formData, setFormData] = useState<DestinationStepData>({
    fromCountry: data?.fromCountry || '',
    toCountry: data?.toCountry || '',
    targetCity: data?.targetCity || '',
    departureYear: data?.departureYear || '',
    departureDate: data?.departureDate || '',
    nationality: data?.nationality || ''
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
        departureYear: data.departureYear || '',
        departureDate: data.departureDate || '',
        nationality: data.nationality || ''
      })
    }
  }, [data])

  const todayIso = new Date().toISOString().slice(0, 10)

  const [errors, setErrors] = useState<Partial<DestinationStepData>>({})


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

    if (!formData.departureDate) {
      newErrors.departureDate = t('onboarding.destination.errors.departureDateRequired', { defaultValue: 'La date de départ est requise' })
    } else if (formData.departureDate < todayIso) {
      newErrors.departureDate = t('onboarding.destination.errors.departureDatePast', { defaultValue: 'La date de départ doit être dans le futur' })
    }

    if (!formData.nationality) {
      newErrors.nationality = t('onboarding.destination.errors.nationalityRequired', { defaultValue: 'Votre nationalité est requise' })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      // Keep departureYear in sync (legacy consumers) derived from the precise date.
      const year = formData.departureDate ? formData.departureDate.slice(0, 4) : formData.departureYear
      onNext({ ...formData, departureYear: year })
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

  const isNextDisabled = !formData.fromCountry || !formData.toCountry || !formData.departureDate || !formData.nationality

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
          label={t('onboarding.destination.nationality', { defaultValue: 'Votre nationalité' })}
          required
          error={errors.nationality}
          helper={t('onboarding.destination.nationalityHelper', { defaultValue: 'Détermine vos démarches de visa / titre de séjour.' })}
          id="nationality"
        >
          <Select
            id="nationality"
            options={NATIONALITY_OPTIONS}
            value={formData.nationality || ''}
            onChange={handleFieldChange('nationality')}
            placeholder={t('onboarding.destination.nationalityPlaceholder', { defaultValue: 'Choisir…' })}
            aria-describedby={errors.nationality ? 'nationality-error' : 'nationality-helper'}
          />
        </FormField>

        <FormField
          label={t('onboarding.destination.departureDate', { defaultValue: 'Date de départ prévue' })}
          required
          error={errors.departureDate}
          helper={t('onboarding.destination.departureDateHelper', { defaultValue: 'Une date précise active le compte à rebours et les échéances.' })}
          id="departureDate"
        >
          <input
            id="departureDate"
            type="date"
            value={formData.departureDate || ''}
            min={todayIso}
            onChange={(e) => handleFieldChange('departureDate')(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0] text-sm text-gray-900"
            aria-describedby={errors.departureDate ? 'departureDate-error' : 'departureDate-helper'}
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