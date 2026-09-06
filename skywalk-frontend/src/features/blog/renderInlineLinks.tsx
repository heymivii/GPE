import type { ReactNode } from 'react';

/** `[texte](https://…)` dans un paragraphe ou une puce. */
const LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

/**
 * Rend les liens markdown d'une ligne d'article.
 *
 * Le rendu du blog ne connaissait que les titres et les puces : une source
 * officielle s'affichait en URL brute, impossible à suivre. Or citer la source
 * est tout l'intérêt des articles adossés aux liens gouvernementaux vérifiés.
 *
 * Les liens externes s'ouvrent dans un nouvel onglet : on ne veut pas sortir
 * quelqu'un de son article au milieu d'une démarche.
 */
export function renderInlineLinks(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  LINK.lastIndex = 0;
  while ((match = LINK.exec(text)) !== null) {
    if (match.index > lastIndex) out.push(text.slice(lastIndex, match.index));
    out.push(
      <a
        key={`${match.index}-${match[2]}`}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[#5EA3C0] underline underline-offset-2 hover:text-[#4891b0]"
      >
        {match[1]}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) out.push(text.slice(lastIndex));
  return out.length > 0 ? out : [text];
}
