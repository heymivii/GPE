import { getCurrentLocale } from '../data/supportedCountries';

export function formatNumber(
  value: number | null | undefined,
  decimals = 0,
  locale?: string,
): string {
  if (value == null) return '—';
  return value.toLocaleString(locale ?? getCurrentLocale(), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Initiales affichées dans l'avatar : "Aminata SkyWalk" -> "AS".
 * Retourne '' quand le nom est absent, pour que l'appelant puisse rendre une
 * icône plutôt qu'un "U" générique qui ressemble à un vrai utilisateur.
 */
export function getInitials(fullName: string | null | undefined): string {
  if (!fullName) return '';
  const words = fullName.trim().split(/[\s-]+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function formatCompact(
  value: number | null | undefined,
  locale?: string,
): string {
  if (value == null) return '—';
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1).replace(/\.0$/, '')}k`;
  }
  return value.toLocaleString(locale ?? getCurrentLocale());
}

export interface ExtractedLink {
  kind: 'url' | 'email';
  /** Ready-to-use href: the URL itself, or `mailto:` + the address. */
  href: string;
  /** Short display label: hostname (sans `www.`) for a URL, domain for an email. */
  label: string;
  /** The raw matched text — kept for the `title` attribute. */
  value: string;
}

export interface ExtractedLinks {
  text: string;
  links: ExtractedLink[];
}

const URL_RE = /https?:\/\/[^\s<>"')\]]+/g;
const EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
/**
 * Public suffixes accepted for a domain written without a scheme (`demarche.numerique.gouv.fr`).
 * Deliberately a short allowlist rather than "any dotted token": it must never turn `formulaire.pdf`
 * or `piece.docx` into a link.
 */
const BARE_TLDS = 'fr|ch|jp|be|lu|de|es|it|pt|nl|eu|uk|ca|com|org|net|int|gov|edu';
/** Group 1 is the boundary character before the domain — it is put back, only the domain is removed. */
const BARE_DOMAIN_RE = new RegExp(
  `(^|[^\\w@./-])((?:[a-z0-9-]+\\.)+(?:${BARE_TLDS}))(?![\\w@-])`,
  'gi',
);
/** Sentence punctuation that a greedy match swallows but that belongs to the sentence. */
const TRAILING_PUNCT = /[.,;:!?)\]]+$/;

/** Placeholder left where a link was lifted out, so the cleanup below knows exactly where to act. */
const LINK_MARKER = '\uE000';

/**
 * Drop each marker along with ONLY the spacing and connector punctuation it orphaned.
 * Anchored on the marker on purpose: a global punctuation pass would also eat a legitimate colon
 * elsewhere in the sentence ("Joindre les documents suivants : passeport, carte d'identité").
 */
function tidySentence(s: string): string {
  return s
    .replace(/\s*[:;,]?\s*\uE000(\s*)/g, (_match, after: string) => (after ? ' ' : ''))
    .replace(/ {2,}/g, ' ')
    .trim();
}

/**
 * Split an action sentence into its readable text and the links it contains.
 *
 * LLM-extracted actions often embed a raw URL or a contact email mid-sentence, which reads badly
 * and is not clickable. This pulls them out so the UI can render the sentence on one side and
 * compact link chips on the other. Pure and synchronous — the text stays a plain React text node,
 * so no `dangerouslySetInnerHTML` is ever needed on LLM output.
 */
export function extractLinks(input: string | null | undefined): ExtractedLinks {
  const raw = input ?? '';
  if (!raw.trim()) return { text: raw, links: [] };

  const links: ExtractedLink[] = [];

  let text = raw.replace(URL_RE, (match) => {
    const value = match.replace(TRAILING_PUNCT, '');
    let label = value;
    try {
      label = new URL(value).hostname.replace(/^www\./, '');
    } catch {
      // Malformed URL: fall back to the raw match rather than dropping the link.
    }
    links.push({ kind: 'url', href: value, label, value });
    return LINK_MARKER + match.slice(value.length);
  });

  text = text.replace(EMAIL_RE, (match) => {
    const value = match.replace(TRAILING_PUNCT, '');
    links.push({
      kind: 'email',
      href: `mailto:${value}`,
      label: value.split('@')[1] ?? value,
      value,
    });
    return LINK_MARKER + match.slice(value.length);
  });

  // Runs last, on the text the two passes above already emptied, so it can never re-match the
  // hostname of an extracted URL nor the domain half of an extracted email.
  text = text.replace(BARE_DOMAIN_RE, (_m, before: string, domain: string) => {
    links.push({
      kind: 'url',
      href: `https://${domain}`,
      label: domain,
      value: domain,
    });
    return before + LINK_MARKER;
  });

  return { text: tidySentence(text), links };
}
