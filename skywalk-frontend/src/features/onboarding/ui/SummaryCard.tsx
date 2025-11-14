import { Edit2 } from 'lucide-react'

interface SummaryItem {
  label: string
  value: string
}

interface SummaryCardProps {
  title: string
  items: SummaryItem[]
  onEdit?: () => void
  className?: string
}

export default function SummaryCard({
  title,
  items,
  onEdit,
  className = ""
}: SummaryCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Éditer
          </button>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-start">
            <span className="text-sm text-gray-600 font-medium">
              {item.label}
            </span>
            <span className="text-sm text-gray-900 text-right ml-4">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}