import DestinationCard from './DestinationCard'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const destinations = [
  {
    countryName: 'Suisse',
    flag: '🇨🇭',
    description: 'Découvrez les opportunités professionnelles dans un cadre alpin exceptionnel. Salaires attractifs et qualité de vie incomparable.',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
  },
  {
    countryName: 'Canada',
    flag: '🇨🇦',
    description: 'Un pays d\'accueil chaleureux avec d\'excellentes opportunités d\'immigration et un marché du travail dynamique.',
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=2311&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    countryName: 'Portugal',
    flag: '🇵🇹',
    description: 'Climat méditerranéen, coût de la vie abordable et communauté française dynamique vous attendent.',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  }
]

export default function PopularDestinations() {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 font-outfit">
              Destinations populaires
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Les pays les plus prisés par notre communauté d'expatriés
            </p>
          </div>
          
          <Link 
            to="/destinations" 
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-[#5EA3C0] font-bold rounded-full hover:bg-blue-100 transition-colors whitespace-nowrap"
          >
            Voir toutes les destinations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:row-span-2 h-full min-h-[400px]">
            <DestinationCard
              image={destinations[0].image}
              countryName={destinations[0].countryName}
              flag={destinations[0].flag}
              description={destinations[0].description}
              size="large"
              className="h-full"
            />
          </div>

          <div className="space-y-6">
            <DestinationCard
              image={destinations[1].image}
              countryName={destinations[1].countryName}
              flag={destinations[1].flag}
              description={destinations[1].description}
              size="small"
            />
            
            <DestinationCard
              image={destinations[2].image}
              countryName={destinations[2].countryName}
              flag={destinations[2].flag}
              description={destinations[2].description}
              size="small"
            />
          </div>
        </div>
      </div>
    </section>
  )
}