import { useState } from 'react';
import { mockDestinations } from '../mockData';
import { DestinationCard } from '../components/DestinationCard';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { PageSearch } from '../../../components/PageSearch';

/**
 * Main destinations page displaying popular countries among Skywalk members
 */
export function DestinationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');

  // Filter and sort logic
  const filteredDestinations = mockDestinations
    .filter(dest => dest.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'jobs') return b.stats.jobOffersCount - a.stats.jobOffersCount;
      return b.stats.memberCount - a.stats.memberCount; // default: popularity
    });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header Section */}
      <PageHeader 
        title="Explorez le monde." 
        description="Découvrez les destinations préférées de notre communauté. Guides, emplois et conseils pour réussir votre expatriation."
      />

      {/* Search & Filter Bar - Sticky */}
      <PageSearch>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
              placeholder="Rechercher une destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">
                {filteredDestinations.length} pays
              </span>
            </div>
            
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-200 cursor-pointer shadow-sm hover:border-gray-300 transition-colors appearance-none"
              >
                <option value="popularity">Les plus populaires</option>
                <option value="name">Ordre alphabétique</option>
                <option value="jobs">Offres d'emploi</option>
              </select>
            </div>
          </div>
        </div>
      </PageSearch>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredDestinations.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Nous n'avons pas trouvé de destination correspondant à votre recherche. Essayez d'autres mots-clés.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
