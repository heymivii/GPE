import { Link, useLocation, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, ArrowLeft, Search, LifeBuoy } from 'lucide-react';

/**
 * Page 404 — et filet de sécurité des erreurs de routage.
 *
 * Le routeur n'avait ni route attrape-tout ni `errorElement` : toute URL
 * inconnue (lien périmé, faute de frappe, marque-page d'une route retirée
 * comme /documents) affichait l'écran de secours de React Router, qui parle au
 * développeur — « Unexpected Application Error! 💿 Hey developer 👋 » — et
 * laisse le visiteur sans issue.
 *
 * Le même composant sert donc les deux rôles : `path: '*'` et `errorElement`.
 * Une 404 n'est pas une impasse si elle propose la suite ; on renvoie donc vers
 * les trois entrées réellement utiles du produit.
 */
export default function NotFoundPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const error = useRouteError();

  // `useRouteError` ne renvoie quelque chose que dans le rôle « errorElement ».
  const estErreurTechnique = !!error && !(isRouteErrorResponse(error) && error.status === 404);

  const pistes = [
    { to: '/destinations', icon: Compass, label: t('notFound.links.destinations', { defaultValue: 'Explorer les destinations' }) },
    { to: '/search', icon: Search, label: t('notFound.links.search', { defaultValue: 'Rechercher une information' }) },
    { to: '/forum', icon: LifeBuoy, label: t('notFound.links.forum', { defaultValue: 'Poser une question au forum' }) },
  ];

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FAFAFA] px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <p className="font-outfit text-6xl font-bold text-brand-ink">
          {estErreurTechnique ? '!' : '404'}
        </p>

        <h1 className="mt-4 font-outfit text-2xl font-bold text-gray-900 sm:text-3xl">
          {estErreurTechnique
            ? t('notFound.errorTitle', { defaultValue: 'Une erreur est survenue' })
            : t('notFound.title', { defaultValue: 'Cette page n’existe pas' })}
        </h1>

        <p className="mt-3 leading-relaxed text-gray-600">
          {estErreurTechnique
            ? t('notFound.errorSubtitle', {
                defaultValue:
                  'La page n’a pas pu s’afficher. Réessayez, ou repartez de l’une des entrées ci-dessous.',
              })
            : t('notFound.subtitle', {
                defaultValue:
                  'Le lien est peut-être périmé, ou l’adresse comporte une faute de frappe.',
              })}
        </p>

        {!estErreurTechnique && (
          <p className="mt-2 break-all font-mono text-xs text-gray-500">{pathname}</p>
        )}

        <div className="mt-8 grid gap-2 text-left">
          {pistes.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 transition-colors hover:border-brand hover:bg-white"
            >
              <Icon className="h-4 w-4 text-brand-ink" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-ink-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('notFound.home', { defaultValue: 'Retour à l’accueil' })}
        </Link>
      </div>
    </main>
  );
}
