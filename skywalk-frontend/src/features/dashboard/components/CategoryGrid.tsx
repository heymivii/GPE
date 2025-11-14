import CategoryCard from './CategoryCard'
import { Briefcase, Home, Car, Heart, FileText } from 'lucide-react'

const categories = [
  {
    title: 'Emploi',
    subtitle: 'Trouver un emploi',
    description: 'Explorez les opportunités professionnelles dans votre pays de destination et obtenez des conseils pour votre recherche d\'emploi.',
    ctaText: 'Voir les offres d\'emploi',
    ctaLink: '/emploi',
    icon: Briefcase,
    backgroundColor: 'bg-blue-50'
  },
  {
    title: 'Logement',
    subtitle: 'Explorer les logements',
    description: 'Trouvez le logement idéal selon votre budget et vos préférences dans votre nouvelle ville.',
    ctaText: 'Explorer les logements',
    ctaLink: '/logement',
    icon: Home,
    backgroundColor: 'bg-green-50'
  },
  {
    title: 'Transport',
    subtitle: 'Se déplacer facilement',
    description: 'Découvrez les moyens de transport disponibles et planifiez vos déplacements dans votre nouveau pays.',
    ctaText: 'Voir les infos transport',
    ctaLink: '/transport',
    icon: Car,
    backgroundColor: 'bg-purple-50'
  },
  {
    title: 'Santé',
    subtitle: 'Système de santé',
    description: 'Informez-vous sur le système de santé local, les assurances et les démarches médicales nécessaires.',
    ctaText: 'En savoir plus sur la santé',
    ctaLink: '/sante',
    icon: Heart,
    backgroundColor: 'bg-red-50'
  },
  {
    title: 'Aides administratives',
    subtitle: 'Démarches et papiers',
    description: 'Simplifiez vos démarches administratives avec nos guides et conseils pour vos documents officiels.',
    ctaText: 'Voir les démarches',
    ctaLink: '/demarches',
    icon: FileText,
    backgroundColor: 'bg-yellow-50'
  }
]

export default function CategoryGrid() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre de section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explorez nos services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour réussir votre expatriation
          </p>
        </div>

        {/* Grille de catégories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              title={category.title}
              subtitle={category.subtitle}
              description={category.description}
              ctaText={category.ctaText}
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