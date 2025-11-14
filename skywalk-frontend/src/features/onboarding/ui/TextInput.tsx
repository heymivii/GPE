import { forwardRef } from 'react'

interface TextInputProps {
  type?: 'text' | 'number' | 'year'
  value?: string | number
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  'aria-describedby'?: string
  min?: number
  max?: number
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
  id,
  'aria-describedby': ariaDescribedBy,
  min,
  max,
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  const inputType = type === 'year' ? 'number' : type
  const inputMode = type === 'year' ? 'numeric' : undefined

  return (
    <input
      ref={ref}
      id={id}
      type={inputType}
      inputMode={inputMode}
      value={value || ''}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
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
  )
})

TextInput.displayName = 'TextInput'

export default TextInput