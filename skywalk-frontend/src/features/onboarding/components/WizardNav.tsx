import { useTranslation } from 'react-i18next'

interface WizardNavProps {
  onBack?: () => void
  onNext?: () => void
  isNextDisabled?: boolean
  nextLabel?: string
  backLabel?: string
  isLastStep?: boolean
}

export default function WizardNav({
  onBack,
  onNext,
  isNextDisabled = false,
  nextLabel,
  backLabel,
  isLastStep = false
}: WizardNavProps) {
  const { t } = useTranslation()
  const resolvedNextLabel = nextLabel || t('onboarding.nav.next')
  const finalNextLabel = isLastStep && !nextLabel ? t('onboarding.nav.goToDashboard') : resolvedNextLabel

  return (
    <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center pt-6 mt-8 border-t border-gray-200 gap-3 sm:gap-0">
      {onBack ? (
        <button
          onClick={onBack}
          className="w-full sm:w-auto rounded-xl px-6 py-3 sm:py-2 bg-neutral-200 text-neutral-800 hover:bg-neutral-300 transition-colors duration-200 font-medium"
        >
          {backLabel || t('onboarding.nav.back')}
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}

      {onNext && (
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className={`
            w-full sm:w-auto rounded-xl px-6 py-3 sm:py-2 font-medium transition-colors duration-200
            ${isNextDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-black text-white hover:bg-neutral-800'
            }
            ${isLastStep ? 'sm:px-8' : ''}
          `}
        >
          {finalNextLabel}
        </button>
      )}
    </div>
  )
}