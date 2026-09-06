import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, ArrowRight, Star } from 'lucide-react';
import { useExperts } from '../../../hooks/useExperts';
import { useCountryName } from '../../../hooks/useCountryName';

const PREVIEW_COUNT = 3;

/**
 * Met en avant les experts vérifiés depuis l'accueil.
 * Les testeurs ne savaient pas qu'on pouvait parler à quelqu'un : rien ne le
 * disait avant l'inscription. La section reste muette s'il n'y a aucun expert
 * vérifié — mieux vaut ne rien promettre qu'annoncer un accompagnement vide.
 */
export default function ExpertsHighlight() {
  const { t } = useTranslation();
  const countryName = useCountryName();
  const { data: experts = [], isLoading } = useExperts();

  if (isLoading || experts.length === 0) return null;

  const preview = experts.slice(0, PREVIEW_COUNT);

  return (
    <section className="px-4 sm:px-8 w-full max-w-7xl mx-auto py-8">
      <div className="rounded-3xl border border-[#5EA3C0]/20 bg-gradient-to-br from-[#5EA3C0]/10 to-white p-8 sm:p-10">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5EA3C0]/30 bg-white px-3 py-1 text-xs font-bold text-[#4891b0]">
              <BadgeCheck className="h-4 w-4" />
              {t('landing.experts.badge', { defaultValue: 'Experts vérifiés' })}
            </div>
            <h2 className="mb-2 font-outfit text-2xl font-bold text-gray-900 sm:text-3xl">
              {t('landing.experts.title', {
                defaultValue: 'Un doute ? Parlez à quelqu’un qui l’a déjà fait',
              })}
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-gray-600">
              {t('landing.experts.text', {
                defaultValue:
                  'Des experts vérifiés par notre équipe répondent à vos questions en message privé : démarches, logement, travail, école des enfants.',
              })}
            </p>
            <Link
              to="/experts"
              className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-[#5EA3C0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4891b0]"
            >
              {t('landing.experts.cta', { defaultValue: 'Voir les experts' })}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="w-full flex-shrink-0 space-y-3 lg:w-80">
            {preview.map((e) => (
              <div
                key={e.idUser}
                className="flex items-center gap-3 rounded-xl border border-[#5EA3C0]/15 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#5EA3C0]/15 text-sm font-bold text-[#4891b0]">
                  {e.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-sm font-semibold text-gray-900">
                    {e.fullName}
                    <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0 text-[#5EA3C0]" />
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {[e.expertTitle, countryName(e.expertCountry?.countryName)]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                {typeof e.averageRating === 'number' && e.ratingCount ? (
                  <span className="inline-flex flex-shrink-0 items-center gap-1 text-xs font-semibold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {e.averageRating.toFixed(1)}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
