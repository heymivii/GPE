import { ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface CategoryCardProps {
  title: string
  subtitle: string
  description: string
  ctaText: string
  ctaLink: string
  icon: LucideIcon
  backgroundColor: string
}

export default function CategoryCard({
  title,
  subtitle,
  description,
  ctaText,
  ctaLink,
  icon: Icon,
  backgroundColor
}: CategoryCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-8 h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200">
      <div className="flex items-start justify-between mb-6">
        <div className={`w-14 h-14 ${backgroundColor} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-7 h-7 text-gray-800" />
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
          {title}
        </h3>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {subtitle}
        </p>
      </div>

      <p className="text-gray-600 mb-8 flex-grow leading-relaxed">
        {description}
      </p>

      <a
        href={ctaLink}
        className="inline-flex items-center text-blue-600 font-semibold transition-colors duration-200 group/link"
      >
        <span>{ctaText}</span>
        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover/link:translate-x-1" />
      </a>
    </div>
  )
}