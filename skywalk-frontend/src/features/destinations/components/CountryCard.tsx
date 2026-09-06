import { Link } from 'react-router-dom';
import { Users, Briefcase, MessageSquare, BookOpen, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CountryDestination } from '../types';
import { getArticlesCountByCountry } from '../../../data/blog-data';
import { useCountryName, useCountryNameIn } from '../../../hooks/useCountryName';

interface CountryCardProps {
  country: CountryDestination;
}

export function CountryCard({ country }: CountryCardProps) {
  const { t, i18n } = useTranslation();
  const stats = country.stats || {
    memberCount: 0,
    jobOffersCount: null,
    forumTopicsCount: 0,
    resourcesCount: 0,
  };

  const fmtCompact = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '')}k`;
    return n.toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US');
  };

  const countryName = useCountryName();
  const countryIn = useCountryNameIn();
  const name = countryName(country.countryName) || 'Unknown';
  const countrySlug = country.isoCode || name.toLowerCase();
  const blogCount = getArticlesCountByCountry(country.isoCode || '');

  return (
    <Link
      to={`/destinations/${countrySlug}`}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={country.imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'}
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm">
            {country.flagUrl && (
              <img
                src={country.flagUrl}
                alt={name}
                className="w-4 h-4 mr-1.5 rounded-full object-cover"
              />
            )}
            {name}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {country.continent ? t(`comparison.data.continents.${country.continent.name}`, { defaultValue: country.continent.name }) : t('destinationsPage.card.defaultDestination')}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6 line-clamp-2 min-h-[40px]">
          {country.description || t('destinationsPage.card.defaultDescription', { country: countryIn(country.countryName) })}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-50">
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="text-sm"><span className="font-semibold">{fmtCompact(stats.memberCount)}</span> <span className="text-gray-400">{t('destinationsPage.card.projects')}</span></span>
          </div>
          {/* Pays hors couverture Adzuna : on masque le compteur plutôt que d'afficher
              « 0 emplois », qui se lisait comme une absence d'offres (retour de recette). */}
          {stats.jobOffersCount !== null && (
            <div className="flex items-center text-gray-600">
              <Briefcase className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
              <span className="text-sm"><span className="font-semibold">{fmtCompact(stats.jobOffersCount)}</span> <span className="text-gray-400">{t('destinationsPage.card.jobs')}</span></span>
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <MessageSquare className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
            <span className="text-sm"><span className="font-semibold">{fmtCompact(stats.forumTopicsCount)}</span> <span className="text-gray-400">{t('destinationsPage.card.topics')}</span></span>
          </div>
          <div className="flex items-center text-gray-600">
            <BookOpen className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
            <span className="text-sm"><span className="font-semibold">{blogCount}</span> <span className="text-gray-400">{t('destinationsPage.card.resources')}</span></span>
          </div>
        </div>
      </div>
    </Link>
  );
}
