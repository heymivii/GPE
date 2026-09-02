import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CountryCard } from '../components/CountryCard';
import { Search, SlidersHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { PageSearch } from '../../../components/PageSearch';
import type { CountryDestination } from '../types';
import { destinationsApi } from '../../../api/destinations';

export function DestinationsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const { data: destinations = [], isLoading: loading, isError: hasError } = useQuery<CountryDestination[]>({
    queryKey: ['destinations-list'],
    queryFn: destinationsApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const error = hasError ? t('destinationsPage.loadError') : null;

  const filteredDestinations = destinations
    .filter(dest => {
      const name = dest.countryName || '';
      if (!name) return false;
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const nameA = a.countryName || '';
      const nameB = b.countryName || '';
      if (sortBy === 'name') return nameA.localeCompare(nameB);

      const statsA = a.stats || { memberCount: 0, jobOffersCount: null };
      const statsB = b.stats || { memberCount: 0, jobOffersCount: null };

      // Les pays hors couverture Adzuna (null) passent en fin de tri.
      if (sortBy === 'jobs') return (statsB.jobOffersCount ?? -1) - (statsA.jobOffersCount ?? -1);
      return statsB.memberCount - statsA.memberCount;
    });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <PageHeader
        title={t('destinations.title')}
        description={t('destinations.subtitle')}
      />

      <PageSearch>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
              placeholder={t('destinations.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-200 cursor-pointer shadow-sm hover:border-gray-300 transition-colors appearance-none"
              >
                <option value="popularity">{t('destinations.sortOptions.popularity')}</option>
                <option value="name">{t('destinations.sortOptions.alphabetical')}</option>
                <option value="jobs">{t('destinations.sortOptions.jobs')}</option>
              </select>
            </div>
          </div>
        </div>
      </PageSearch>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">{t('destinationsPage.loadingCountries')}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('destinationsPage.error')}</h3>
            <p className="text-gray-500 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('destinationsPage.retry')}
            </button>
          </div>
        ) : filteredDestinations.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredDestinations.map((country) => (
              <CountryCard key={country.idCountry} country={country} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('destinations.noResults.title')}</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {t('destinations.noResults.message')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
