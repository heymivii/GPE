import CategoryCard from './CategoryCard'
import { Briefcase, Home, Car, Heart, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react'

interface CategoryDef {
  id: string;
  ctaLink: string;
  icon: LucideIcon;
  backgroundColor: string;
}

const CATEGORIES: CategoryDef[] = [
  { id: 'emploi',    ctaLink: '/services/emploi',    icon: Briefcase, backgroundColor: 'bg-blue-50' },
  { id: 'logement',  ctaLink: '/services/logement',  icon: Home,      backgroundColor: 'bg-green-50' },
  { id: 'transport', ctaLink: '/services/transport',  icon: Car,       backgroundColor: 'bg-purple-50' },
  { id: 'sante',     ctaLink: '/services/sante',      icon: Heart,     backgroundColor: 'bg-red-50' },
  { id: 'demarches', ctaLink: '/services/demarches',  icon: FileText,  backgroundColor: 'bg-yellow-50' },
]

export default function CategoryGrid() {
  const { t } = useTranslation()

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('categoryGrid.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('categoryGrid.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              title={t(`categoryGrid.${category.id}.title`)}
              subtitle={t(`categoryGrid.${category.id}.subtitle`)}
              description={t(`categoryGrid.${category.id}.description`)}
              ctaText={t(`categoryGrid.${category.id}.cta`)}
              ctaLink={category.ctaLink}
              icon={category.icon}
              backgroundColor={category.backgroundColor}
            />
          ))}
        </div>
      </div>
    </section>
  )
}