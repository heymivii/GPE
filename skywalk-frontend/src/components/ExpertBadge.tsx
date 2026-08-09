import { BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ExpertLike {
  isExpert?: boolean;
  expertVerifiedAt?: string | null;
  expertTitle?: string | null;
}

interface Props {
  /** Auteur : le badge ne s'affiche que s'il est un expert VÉRIFIÉ. */
  user?: ExpertLike | null;
  /** Titre à afficher directement (ex. depuis l'annuaire /experts). */
  title?: string | null;
  showTitle?: boolean;
  className?: string;
}

/**
 * Pastille « Expert vérifié », réutilisable partout où un auteur apparaît.
 * - avec `user` : ne rend rien si l'utilisateur n'est pas un expert vérifié ;
 * - avec `title` seul : rend toujours (l'appelant sait déjà que c'est un expert).
 */
export default function ExpertBadge({ user, title, showTitle = true, className = '' }: Props) {
  const { t } = useTranslation();

  if (user && !(user.isExpert && !!user.expertVerifiedAt)) return null;
  const label = title ?? user?.expertTitle ?? null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ${className}`}
      title={label || t('experts.verifiedExpert', { defaultValue: 'Expert vérifié' })}
    >
      <BadgeCheck className="w-3.5 h-3.5" />
      {t('experts.verified', { defaultValue: 'Expert vérifié' })}
      {showTitle && label ? (
        <span className="font-normal text-emerald-600">· {label}</span>
      ) : null}
    </span>
  );
}
