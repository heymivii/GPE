import { forwardRef } from 'react'

interface CurrencyInputProps {
  value?: string | number
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  'aria-describedby'?: string
  currency?: string
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(({
  value,
  onChange,
  placeholder = "0",
  disabled = false,
  className = "",
  id,
  'aria-describedby': ariaDescribedBy,
  currency = "€",
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = inputValue.replace(/[^0-9.]/g, '')
    onChange?.(numericValue)
  }

  const formatValue = (val: string | number | undefined): string => {
    if (val === undefined || val === '') return ''
    const numValue = typeof val === 'string' ? parseFloat(val) : val
    return isNaN(numValue) ? '' : numValue.toString()
  }

  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="decimal"
        value={formatValue(value)}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
          bg-white text-gray-900 placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <span className="text-gray-500 text-sm">{currency}</span>
      </div>
    </div>
  )
})

CurrencyInput.displayName = 'CurrencyInput'

export default CurrencyInput