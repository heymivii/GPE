import DestinationCard from './DestinationCard'

const destinations = [
  {
    countryName: 'Suisse',
    flag: '🇨🇭',
    description: 'Découvrez les opportunités professionnelles dans un cadre alpin exceptionnel. Salaires attractifs et qualité de vie incomparable.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  {
    countryName: 'Canada',
    flag: '🇨🇦',
    description: 'Un pays d\'accueil chaleureux avec d\'excellentes opportunités d\'immigration et un marché du travail dynamique.',
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56cd9db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2022&q=80'
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
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Destinations populaires chez les membres Skywalk
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les pays les plus prisés par notre communauté d'expatriés
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-96">
          <div className="lg:row-span-2">
            <DestinationCard
              image={destinations[0].image}
              countryName={destinations[0].countryName}
              flag={destinations[0].flag}
              description={destinations[0].description}
              size="large"
            />
          </div>

          <div className="space-y-6 lg:space-y-6">
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

        <div className="text-center mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center">
            <span>Voir toutes les destinations</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}