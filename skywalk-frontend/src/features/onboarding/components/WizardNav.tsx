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
  nextLabel = "Suivant",
  backLabel = "Retour",
  isLastStep = false
}: WizardNavProps) {
  const finalNextLabel = isLastStep ? "Accéder à mon dashboard" : nextLabel

  return (
    <div className="flex justify-between items-center pt-6 mt-8 border-t border-gray-200">
      {onBack ? (
        <button
          onClick={onBack}
          className="rounded-xl px-6 py-2 bg-neutral-200 text-neutral-800 hover:bg-neutral-300 transition-colors duration-200 font-medium"
        >
          {backLabel}
        </button>
      ) : (
        <div /> 
      )}

      {onNext && (
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className={`
            rounded-xl px-6 py-2 font-medium transition-colors duration-200
            ${isNextDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-black text-white hover:bg-neutral-800'
            }
            ${isLastStep ? 'px-8' : ''}
          `}
        >
          {finalNextLabel}
        </button>
      )}
    </div>
  )
}