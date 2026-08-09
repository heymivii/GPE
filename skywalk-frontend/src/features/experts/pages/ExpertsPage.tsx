import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Loader2, UserCheck } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import ExpertBadge from '../../../components/ExpertBadge';
import { useExperts } from '../../../hooks/useExperts';
import { countryApi } from '../../../api/country';

export default function ExpertsPage() {
  const { t } = useTranslation();
  const [countryId, setCountryId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  // Recherche « debounced » simple : on filtre côté serveur au submit / changement de pays,
  // mais on garde une recherche live côté client sur la liste déjà chargée.
  const { data: experts = [], isLoading } = useExperts(countryId);

  const { data: countries = [] } = useQuery({
    queryKey: ['countries', 'active'],
    queryFn: () => countryApi.getActive(),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return experts;
    return experts.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        (e.expertTitle ?? '').toLowerCase().includes(q) ||
        (e.expertBio ?? '').toLowerCase().includes(q),
    );
  }, [experts, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={t('experts.page.title', { defaultValue: 'Experts vérifiés' })}
        description={t('experts.page.subtitle', {
          defaultValue:
            'Des professionnels vérifiés (avocats en immigration, consultants en relocation…) pour votre pays de destination.',
        })}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('experts.page.searchPlaceholder', {
                defaultValue: 'Rechercher un expert…',
              })}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#5EA3C0] outline-none"
            />
          </div>
          <select
            value={countryId ?? ''}
            onChange={(e) => setCountryId(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#5EA3C0] outline-none"
          >
            <option value="">
              {t('experts.page.allCountries', { defaultValue: 'Tous les pays' })}
            </option>
            {countries.map((c: any) => (
              <option key={c.idCountry} value={c.idCountry}>
                {c.countryName}
              </option>
            ))}
          </select>
        </div>

        {/* Liste */}
        {isLoading ? (
          <div className="flex justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {t('experts.page.empty', {
                defaultValue: 'Aucun expert vérifié pour ce filtre pour le moment.',
              })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((e) => (
              <div
                key={e.idUser}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#5EA3C0] to-[#4891b0] text-white flex items-center justify-center font-semibold">
                    {e.fullName?.charAt(0).toUpperCase() || 'E'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{e.fullName}</p>
                    <ExpertBadge title={e.expertTitle} className="mt-0.5" />
                  </div>
                </div>

                {e.expertCountry && (
                  <p className="mt-3 inline-flex items-center gap-1 text-xs text-[#5EA3C0] font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {e.expertCountry.countryName}
                  </p>
                )}

                {e.expertBio && (
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-4">
                    {e.expertBio}
                  </p>
                )}
                {/* Note moyenne (F4) et bouton « Envoyer un message » (F3) viendront ici. */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
