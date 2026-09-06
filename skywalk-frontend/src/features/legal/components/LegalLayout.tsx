import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

/**
 * Gabarit commun aux pages d'information et légales.
 * Ces pages étaient liées depuis le pied de page et le formulaire d'inscription
 * mais aucune route n'existait : les quatre liens renvoyaient une 404, y compris
 * les conditions que l'inscription demande d'accepter.
 *
 * Les textes passent par i18n : rédigées en français en dur, ces pages restaient
 * françaises en interface anglaise — le seul endroit du site où c'était le cas.
 */
export default function LegalLayout({
  title,
  intro,
  updatedAt,
  children,
}: {
  title: string;
  intro?: string;
  updatedAt?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" /> {t('legal.layout.back', { defaultValue: "Retour à l'accueil" })}
          </Link>
          <h1 className="font-outfit text-3xl font-bold text-gray-900">{title}</h1>
          {intro && <p className="mt-2 leading-relaxed text-gray-500">{intro}</p>}
          {updatedAt && (
            <p className="mt-3 text-xs text-gray-500">
              {t('legal.layout.updated', { date: updatedAt, defaultValue: 'Dernière mise à jour : {{date}}' })}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-8 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Une section titrée, pour garder la même respiration d'une page à l'autre. */
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-outfit text-lg font-bold text-gray-900">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}

/**
 * Information que seule l'équipe peut fournir (immatriculation, hébergeur…).
 * Rendue VISIBLE plutôt que remplacée par une valeur inventée : une mention
 * légale fausse est pire qu'une mention légale incomplète.
 */
export function ToFill({ children }: { children?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <span className="rounded bg-amber-50 px-1.5 py-0.5 font-medium text-amber-800">
      {children ?? t('legal.toFill', { defaultValue: "à compléter" })}
    </span>
  );
}
