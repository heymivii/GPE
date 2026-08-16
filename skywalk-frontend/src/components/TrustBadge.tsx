import { ShieldCheck } from 'lucide-react';

/**
 * Compact trust signal shown wherever platform data comes from a VERIFIED official source.
 * On the checklist, a step only exists if its gov-link was machine-verified AND human-approved,
 * so this badge is the user-facing proof of the whole anti-hallucination pipeline.
 */
export default function TrustBadge({
  url,
  verifiedAt,
  className = '',
}: {
  /** Official source URL — its host is shown as evidence (e.g. "service-public.fr"). */
  url?: string | null;
  /** Optional verification date ("vérifié le 3 juin 2026"). */
  verifiedAt?: string | null;
  className?: string;
}) {
  let host: string | null = null;
  if (url) {
    try {
      host = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      host = null;
    }
  }

  const dateStr = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const label = dateStr
    ? `Source officielle · vérifiée le ${dateStr}`
    : 'Source officielle vérifiée';
  const title = host
    ? `${label} — ${host}. Lien officiel contrôlé et validé par l'équipe SkyWalk.`
    : `${label}. Contrôlé et validé par l'équipe SkyWalk.`;

  const content = (
    <>
      <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="font-semibold">Source officielle vérifiée</span>
      {host && (
        <span className="text-emerald-600/80 truncate max-w-[140px]">· {host}</span>
      )}
    </>
  );

  const base =
    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200';

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title={title}
        className={`${base} hover:bg-emerald-100 transition-colors cursor-pointer ${className}`}
      >
        {content}
      </a>
    );
  }
  return (
    <span title={title} className={`${base} ${className}`}>
      {content}
    </span>
  );
}
