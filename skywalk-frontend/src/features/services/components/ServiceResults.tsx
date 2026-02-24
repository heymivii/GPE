import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ServiceResultsProps {
  category: string;
  title: string;
}

export default function ServiceResults({ category, title }: ServiceResultsProps) {
  const { t } = useTranslation();
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Search className="w-6 h-6 text-gray-700" />
          <span>{t('services.serviceResults.searchIn', { title })}</span>
        </h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />

          {category === 'emploi' ? (
            <>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('services.serviceResults.exploreResults')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('services.serviceResults.useSearchEngine', { title: title.toLowerCase() })}
              </p>
              <Link
                to={`/search?category=${category}`}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                <span>{t('services.serviceResults.goToSearch')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-gray-400 mb-3">
                {t('services.serviceResults.comingSoon.title', 'Bientôt disponible')}
              </h3>
              <p className="text-gray-500 mb-6">
                {t('services.serviceResults.comingSoon.description', `Notre moteur de recherche pour "${title.toLowerCase()}" est en cours de développement.`)}
              </p>
              <button
                disabled
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed font-medium border border-gray-200"
              >
                <span>{t('services.serviceResults.comingSoon.button', 'Recherche indisponible')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {category === 'emploi' && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to={`/search?category=${category}&sort=recent`}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all group"
          >
            <span className="text-gray-700 font-medium">{t('services.serviceResults.viewRecent')}</span>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
          </Link>
          <Link
            to={`/search?category=${category}&sort=popular`}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all group"
          >
            <span className="text-gray-700 font-medium">{t('services.serviceResults.viewPopular')}</span>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      )}
    </section>
  );
}
