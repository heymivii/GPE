import { ShieldCheck, ExternalLink } from 'lucide-react';

interface OfficialLinkCardProps {
  label: string;
  url: string;
  verifiedAt?: string;
  summary?: string[];
}

export default function OfficialLinkCard({ label, url, verifiedAt, summary }: OfficialLinkCardProps) {
  const verifiedDateStr = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const hasSummary = Array.isArray(summary) && summary.length > 0;

  return (
    <div className="px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-700 hover:underline flex items-center gap-1 truncate"
          >
            {label}
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
          {verifiedDateStr && (
            <p className="text-[10px] text-emerald-600 mt-0.5">
              ✓ Officiel · vérifié le {verifiedDateStr}
            </p>
          )}
        </div>
      </div>
      {hasSummary && (
        <div className="mt-2.5 ml-7">
          <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide mb-1">
            L'essentiel
          </p>
          <ul className="space-y-0.5">
            {summary!.map((fact, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-800">
                <span className="text-emerald-500 flex-shrink-0 mt-px">•</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
