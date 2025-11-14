import type { ReactNode } from 'react'
import { MoreHorizontal, Edit2, EyeOff, Maximize2 } from 'lucide-react'
import { useState } from 'react'

interface WidgetProps {
  id?: string
  title: string
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
  children,
  onEdit,
  onHide,
  onExpand,
  className = "",
  size = 'medium',
  isEditable = true
}: WidgetProps) {
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

  return (
    <div className={`
      bg-white rounded-xl border border-gray-200 p-6 relative
      hover:shadow-md transition-shadow duration-200
      ${getSizeClasses()}
      ${className}
    `}>
      {/* Header avec titre et menu */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        
        {isEditable && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-32">
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit()
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Éditer
                  </button>
                )}
                
                {onExpand && (
                  <button
                    onClick={() => {
                      onExpand()
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Agrandir
                  </button>
                )}
                
                {onHide && (
                  <button
                    onClick={() => {
                      onHide()
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Masquer
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenu du widget */}
      <div className="h-full">
        {children}
      </div>

      {/* Click outside pour fermer le menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}