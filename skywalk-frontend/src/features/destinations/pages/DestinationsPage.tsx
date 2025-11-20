import { mockDestinations } from '../mockData';
import { DestinationCard } from '../components/DestinationCard';
import { Search, MapPin } from 'lucide-react';

/**
 * Main destinations page displaying popular countries among Skywalk members
 */
export function DestinationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 font-outfit">
            Explorez nos destinations
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Découvrez les pays les plus prisés par la communauté Skywalk. 
            Des guides détaillés, des offres d'emploi et une communauté active vous attendent.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters & Stats Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-5 h-5 text-[#5EA3C0]" />
            <span className="font-medium">
              {mockDestinations.length} destinations disponibles
            </span>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm text-gray-500 hidden sm:inline">Trier par :</span>
            <select className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#5EA3C0] focus:border-[#5EA3C0] sm:text-sm rounded-lg bg-gray-50 border cursor-pointer">
              <option>Popularité</option>
              <option>Nom (A-Z)</option>
              <option>Offres d'emploi</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {mockDestinations.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 mb-12">
          <div className="bg-[#5EA3C0] rounded-2xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 -mt-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 right-0 -mb-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 font-outfit">
                Vous ne trouvez pas votre destination de rêve ?
              </h2>
              <p className="text-blue-50 mb-8 text-lg">
                Notre moteur de recherche avancé vous permet d'explorer toutes les opportunités 
                disponibles à travers le monde, filtrées selon vos critères.
              </p>
              <a
                href="/search"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#5EA3C0] font-bold rounded-full hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Search className="w-5 h-5" />
                Lancer une recherche
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
