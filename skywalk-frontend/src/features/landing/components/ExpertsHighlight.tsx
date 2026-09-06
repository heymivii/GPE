import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, ArrowRight, MessageSquare, ShieldCheck, Globe2 } from 'lucide-react';
import { useExperts } from '../../../hooks/useExperts';
import { useCountryName } from '../../../hooks/useCountryName';

/**
 * Met en avant l'accompagnement par des experts vérifiés, depuis l'accueil.
 * Les testeurs ne savaient pas qu'on pouvait parler à quelqu'un : rien ne le
 * disait avant l'inscription.
 *
 * Volontairement GÉNÉRALE : ni nom d'expert, ni nombre. Le vivier change (un
 * expert est ajouté, un autre révoqué) et mettre trois personnes en vitrine
 * deviendrait arbitraire dès qu'il y en a davantage. On annonce donc la
 * promesse — vérification, message privé, pays couverts — pas des individus.
 * La section disparaît s'il n'y a aucun expert : mieux vaut ne rien promettre.
 */
export default function ExpertsHighlight() {
  const { t } = useTranslation();
  const countryName = useCountryName();
  const { data: experts = [], isLoading } = useExperts();

  // Pays réellement couverts, dédoublonnés et traduits.
  const countries = useMemo(() => {
    const names = new Set<string>();
    for (const e of experts) {
      const name = countryName(e.expertCountry?.countryName);
      if (name) names.add(name);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [experts, countryName]);

  if (isLoading || experts.length === 0) return null;

  const promises = [
    {
      icon: ShieldCheck,
      text: t('landing.experts.promise.verified', {
        defaultValue: 'Profils vérifiés un par un par notre équipe',
      }),
    },
    {
      icon: MessageSquare,
      text: t('landing.experts.promise.private', {
        defaultValue: 'Échange en message privé, directement depuis leur fiche',
      }),
    },
    {
      icon: Globe2,
      text: countries.length
        ? t('landing.experts.promise.countries', {
            countries: countries.join(', '),
            defaultValue: 'Sur place, dans nos destinations : {{countries}}',
          })
        : t('landing.experts.promise.topics', {
            defaultValue: 'Démarches, logement, emploi, scolarité',
          }),
    },
  ];

  return (
    <section className="px-4 sm:px-8 w-full max-w-7xl mx-auto py-8">
      <div className="rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/10 to-white p-8 sm:p-10">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-white px-3 py-1 text-xs font-bold text-brand-ink-hover">
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
              className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-ink-hover"
            >
              {t('landing.experts.cta', { defaultValue: 'Voir les experts' })}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="w-full flex-shrink-0 space-y-3 lg:w-80">
            {promises.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-xl border border-brand/15 bg-white px-4 py-3 shadow-sm"
              >
                <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-ink" />
                <p className="text-sm leading-relaxed text-gray-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
