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
    <div className={`${backgroundColor} rounded-lg p-6 h-full flex flex-col transition-transform duration-200 hover:scale-105 hover:shadow-lg`}>
      {/* Icône et titre */}
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
          <Icon className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-6 flex-grow">
        {description}
      </p>

      {/* Bouton CTA */}
      <a
        href={ctaLink}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 group"
      >
        <span>{ctaText}</span>
        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
      </a>
    </div>
  )
}