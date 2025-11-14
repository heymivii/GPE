interface ToggleOption {
  value: string
  label: string
}

interface ToggleGroupProps {
  options: ToggleOption[]
  value?: string
  onChange?: (value: string) => void
  className?: string
  'aria-describedby'?: string
}

export default function ToggleGroup({
  options,
  value,
  onChange,
  className = "",
  'aria-describedby': ariaDescribedBy
}: ToggleGroupProps) {
  return (
    <div 
      role="radiogroup" 
      aria-describedby={ariaDescribedBy}
      className={`flex flex-wrap gap-2 ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange?.(option.value)}
          className={`
            rounded-xl border px-4 py-2 text-sm font-medium transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${value === option.value
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}