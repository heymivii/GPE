import type { ReactNode, ComponentType } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface WidgetProps {
  id?: string
  title: string
  subtitle?: string
  icon?: ComponentType<{ className?: string }>
  iconColor?: string
  children: ReactNode
  onEdit?: () => void
  onHide?: () => void
  onExpand?: () => void
  className?: string
  size?: 'small' | 'medium' | 'large'
  isEditable?: boolean
}

export default function Widget({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  children,
  onEdit,
  onHide,
  onExpand,
  className = "",
  size = 'medium',
  isEditable = true
}: WidgetProps) {
  const { t } = useTranslation()
  const [showMenu, setShowMenu] = useState(false)

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1'
      case 'large':
        return 'col-span-2 row-span-2'
      default:
        return 'col-span-1 row-span-1'
    }
  }

  const getIconBgColor = () => {
    if (iconColor.includes('blue')) return 'bg-blue-50'
    if (iconColor.includes('purple')) return 'bg-purple-50'
    if (iconColor.includes('green')) return 'bg-green-50'
    if (iconColor.includes('orange')) return 'bg-orange-50'
    if (iconColor.includes('red')) return 'bg-red-50'
    return 'bg-gray-50'
  }

  return (
    <div className={`
      bg-white rounded-xl shadow-sm border border-gray-100
      transition-shadow duration-200 p-6
      ${getSizeClasses()}
      ${className}
    `}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2 ${getIconBgColor()} rounded-lg ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        
        {isEditable && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit()
                      setShowMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {t('dashboard.personalized.widgets.menu.edit')}
                  </button>
                )}
                
                {onExpand && (
                  <button
                    onClick={() => {
                      onExpand()
                      setShowMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {t('dashboard.personalized.widgets.menu.expand')}
                  </button>
                )}
                
                {onHide && (
                  <button
                    onClick={() => {
                      onHide()
                      setShowMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    {t('dashboard.personalized.widgets.menu.hide')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        {children}
      </div>

      {showMenu && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}