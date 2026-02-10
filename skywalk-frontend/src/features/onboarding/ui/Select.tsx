import { ChevronDown } from 'lucide-react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  'aria-describedby'?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
  id,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const { t } = useTranslation()
  const displayPlaceholder = placeholder ?? t('common.select')

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <div className="relative">
      <select
        ref={ref}
        id={id}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
          bg-white text-gray-900 placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          appearance-none pr-10
          ${className}
        `}
        {...props}
      >
        <option value="" disabled>
          {displayPlaceholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  )
})

Select.displayName = 'Select'

export default Select