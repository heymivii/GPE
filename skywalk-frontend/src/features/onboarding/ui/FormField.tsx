import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  helper?: string
  error?: string
  required?: boolean
  children: ReactNode
  id?: string
}

export default function FormField({
  label,
  helper,
  error,
  required = false,
  children,
  id
}: FormFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-')
  const helperId = helper ? `${fieldId}-helper` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className="space-y-2">
      <label 
        htmlFor={fieldId} 
        className="block text-sm font-medium text-gray-900"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {children}
      </div>

      {helper && !error && (
        <p 
          id={helperId}
          className="text-sm text-gray-600"
        >
          {helper}
        </p>
      )}

      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600 flex items-center"
          role="alert"
        >
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}