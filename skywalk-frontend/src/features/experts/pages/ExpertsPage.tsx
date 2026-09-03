import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Loader2, UserCheck, Mail, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import ExpertBadge from '../../../components/ExpertBadge';
import StarRating from '../../../components/StarRating';
import { useExperts } from '../../../hooks/useExperts';
import { useAuth } from '../../../hooks/useAuth';
import { countryApi } from '../../../api/country';
import { expertApplicationsApi } from '../../../api/experts';

export default function ExpertsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const currentUserId = user ? (user.idUser || user.id) : undefined;
  const { data: myApplications = [] } = useQuery({
    queryKey: ['expert-applications-mine'],
    queryFn: expertApplicationsApi.mine,
    // La route exige un compte : inutile de la solliciter en visiteur (401).
    enabled: !!user,
  });
  const myPending = myApplications.find((a) => a.status === 'pending');

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
        {/* D'où viennent ces experts + porte d'entrée pour postuler.
            La page listait des profils sans dire comment ils étaient vérifiés,
            ni comment en devenir un (retour de recette). */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-1">
            <h2 className="flex items-center gap-2 font-bold text-gray-900">
              <ShieldCheck className="w-5 h-5 text-[#5EA3C0]" />
              {t('experts.page.sourcingTitle', { defaultValue: "D'où viennent nos experts ?" })}
            </h2>
            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
              {t('experts.page.sourcingText', {
                defaultValue:
                  "Ce sont des professionnels qui ont postulé et transmis une pièce justificative (diplôme, inscription à un ordre, certification). Notre équipe contrôle chaque dossier avant d'accorder le badge — et peut le retirer.",
              })}
            </p>
          </div>
          <Link
            to="/experts/apply"
            className={`inline-flex items-center justify-center gap-2 flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
              myPending
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-[#5EA3C0] hover:bg-[#4891b0] text-white'
            }`}
          >
            {myPending ? (
              <>
                <Clock className="w-4 h-4" />
                Candidature en attente
              </>
            ) : (
              <>
                {t('experts.page.applyCta', { defaultValue: 'Devenir expert' })}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Link>
        </section>

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
                    <ExpertBadge
                      title={e.expertTitle}
                      averageRating={e.averageRating}
                      ratingCount={e.ratingCount}
                      className="mt-0.5"
                    />
                  </div>
                </div>

                {/* F4 — note visuelle + nombre d'avis (ou « pas encore d'avis ») */}
                {(e.ratingCount ?? 0) > 0 ? (
                  <div className="mt-3 flex items-center gap-1.5">
                    <StarRating value={e.averageRating ?? 0} readOnly size="sm" />
                    <span className="text-xs text-gray-500">
                      {t('experts.page.reviews', {
                        count: e.ratingCount ?? 0,
                        defaultValue: '{{count}} avis',
                      })}
                    </span>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-gray-400">
                    {t('experts.page.noRating', { defaultValue: 'Pas encore d’avis' })}
                  </p>
                )}

                {e.expertCountry && (
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-[#5EA3C0] font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {e.expertCountry.countryName}
                  </p>
                )}

                {e.expertBio && (
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-4">
                    {e.expertBio}
                  </p>
                )}

                {/* F3 — contacter l'expert (connecté, pas soi-même) */}
                {user && e.idUser !== currentUserId && (
                  <Link
                    to={`/messages?to=${e.idUser}&name=${encodeURIComponent(e.fullName)}`}
                    className="mt-auto pt-3 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-[#5EA3C0] hover:bg-[#4891b0] rounded-lg py-2 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {t('messages.send', { defaultValue: 'Envoyer un message' })}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
