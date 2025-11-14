interface InfoTagProps {
  children: React.ReactNode
  variant?: 'default' | 'warning' | 'success' | 'error'
  className?: string
}

export default function InfoTag({
  children,
  variant = 'default',
  className = ""
}: InfoTagProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${getVariantClasses()}
      ${className}
    `}>
      {children}
    </span>
  )
}