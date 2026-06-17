import { ShieldCheck, ExternalLink } from 'lucide-react';

interface OfficialLinkCardProps {
  label: string;
  url: string;
  verifiedAt?: string;
}

export default function OfficialLinkCard({ label, url, verifiedAt }: OfficialLinkCardProps) {
  const verifiedDateStr = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
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
  );
}
