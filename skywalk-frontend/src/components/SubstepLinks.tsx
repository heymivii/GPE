import { ExternalLink, Mail } from 'lucide-react';
import type { ExtractedLink } from '../lib/formatters';

/**
 * Compact link chips for the links pulled out of a checklist action sentence.
 *
 * Rendered inside a checklist row that is itself clickable (it toggles the task), so every anchor
 * stops the click from bubbling — otherwise opening a link would silently tick the task off.
 */
export default function SubstepLinks({ links }: { links: ExtractedLink[] }) {
  if (links.length === 0) return null;

  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          title={link.value}
          // mailto: must open in the mail client, not a blank tab.
          {...(link.kind === 'url'
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-gray-400 hover:text-gray-600 hover:underline flex items-center gap-1 whitespace-nowrap"
        >
          {link.kind === 'email' && <Mail className="w-3 h-3 flex-shrink-0" />}
          {link.label}
          {link.kind === 'url' && <ExternalLink className="w-3 h-3 flex-shrink-0" />}
        </a>
      ))}
    </span>
  );
}
