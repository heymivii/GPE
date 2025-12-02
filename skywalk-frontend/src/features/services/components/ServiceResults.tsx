import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';

interface ServiceResultsProps {
  category: string;
  title: string;
}

export default function ServiceResults({ category, title }: ServiceResultsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Search className="w-6 h-6 text-blue-600" />
          <span>Rechercher dans "{title}"</span>
        </h2>
      </div>

      {/* Search Integration Placeholder */}
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Explorez les résultats
          </h3>
          <p className="text-gray-600 mb-6">
            Utilisez notre moteur de recherche pour trouver des ressources,
            offres et informations spécifiques à {title.toLowerCase()}.
          </p>
          <Link
            to={`/search?category=${category}`}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <span>Accéder à la recherche</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to={`/search?category=${category}&sort=recent`}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow transition-shadow group"
        >
          <span className="text-gray-700 font-medium">Voir les plus récents</span>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>
        <Link
          to={`/search?category=${category}&sort=popular`}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow transition-shadow group"
        >
          <span className="text-gray-700 font-medium">Voir les plus populaires</span>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </section>
  );
}
