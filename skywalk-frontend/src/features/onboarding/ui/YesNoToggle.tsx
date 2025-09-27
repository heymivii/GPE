interface YesNoToggleProps {
  value?: boolean
  onChange?: (value: boolean) => void
  className?: string
  'aria-describedby'?: string
  yesLabel?: string
  noLabel?: string
}

export default function YesNoToggle({
  value,
  onChange,
  className = "",
  'aria-describedby': ariaDescribedBy,
  yesLabel = "Oui",
  noLabel = "Non"
}: YesNoToggleProps) {
  return (
    <div 
      role="radiogroup" 
      aria-describedby={ariaDescribedBy}
      className={`flex gap-2 ${className}`}
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === true}
        onClick={() => onChange?.(true)}
        className={`
          rounded-xl border px-6 py-2 text-sm font-medium transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${value === true
            ? 'bg-emerald-700 text-white border-emerald-700'
            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        {yesLabel}
      </button>
      
      <button
        type="button"
        role="radio"
        aria-checked={value === false}
        onClick={() => onChange?.(false)}
        className={`
          rounded-xl border px-6 py-2 text-sm font-medium transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${value === false
            ? 'bg-emerald-700 text-white border-emerald-700'
            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        {noLabel}
      </button>
    </div>
  )
}