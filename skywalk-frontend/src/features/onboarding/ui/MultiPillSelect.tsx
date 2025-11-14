interface MultiPillOption {
  value: string
  label: string
}

interface MultiPillSelectProps {
  options: MultiPillOption[]
  values?: string[]
  onChange?: (values: string[]) => void
  className?: string
  'aria-describedby'?: string
  exclusiveValue?: string 
}

export default function MultiPillSelect({
  options,
  values = [],
  onChange,
  className = "",
  'aria-describedby': ariaDescribedBy,
  exclusiveValue
}: MultiPillSelectProps) {
  const handleToggle = (optionValue: string) => {
    if (!onChange) return

    let newValues: string[]

    if (exclusiveValue && optionValue === exclusiveValue) {
      newValues = values.includes(optionValue) ? [] : [optionValue]
    } else if (exclusiveValue && values.includes(exclusiveValue)) {
      newValues = [optionValue]
    } else {
      if (values.includes(optionValue)) {
        newValues = values.filter(v => v !== optionValue)
      } else {
        newValues = [...values, optionValue]
      }
    }

    onChange(newValues)
  }

  return (
    <div 
      role="group" 
      aria-describedby={ariaDescribedBy}
      className={`flex flex-wrap gap-2 ${className}`}
    >
      {options.map((option) => {
        const isSelected = values.includes(option.value)
        
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => handleToggle(option.value)}
            className={`
              rounded-xl border px-4 py-2 text-sm font-medium transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${isSelected
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}