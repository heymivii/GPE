import type { ReactNode, ComponentType } from 'react'
import { MoreHorizontal, Square, Maximize2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { WidgetSize } from '../hooks/useDashboardPreferences'

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
  onResize?: (size: WidgetSize) => void
  currentSize?: WidgetSize
  className?: string
  size?: WidgetSize
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
  onResize,
  currentSize,
  className = "",
  isEditable = true
}: WidgetProps) {
  const { t } = useTranslation()
  const [showMenu, setShowMenu] = useState(false)

  const getSizeClasses = () => {
    return ''
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
      transition-shadow duration-200 hover:shadow-md p-5 flex flex-col h-full
      ${getSizeClasses()}
      ${className}
    `}>
      <div className="flex justify-between items-start mb-4">
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
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
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

                {onResize && (
                  <>
                    <div className="border-t border-gray-100 my-1" />
                    <p className="px-4 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('dashboard.personalized.widgets.menu.resize')}
                    </p>
                    <div className="px-3 pb-2 flex gap-1.5">
                      <button
                        onClick={() => { onResize('medium'); setShowMenu(false) }}
                        className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          currentSize === 'medium'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Square className="w-3.5 h-3.5" />
                        {t('dashboard.personalized.widgets.menu.sizeMedium')}
                      </button>
                      <button
                        onClick={() => { onResize('large'); setShowMenu(false) }}
                        className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          currentSize === 'large'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        {t('dashboard.personalized.widgets.menu.sizeLarge')}
                      </button>
                    </div>
                  </>
                )}
                
                {onHide && (
                  <>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        onHide()
                        setShowMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      {t('dashboard.personalized.widgets.menu.hide')}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col">
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