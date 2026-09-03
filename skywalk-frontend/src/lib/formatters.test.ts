import { describe, it, expect } from 'vitest';
import { formatNumber, formatCompact, extractLinks } from './formatters';

describe('formatNumber', () => {
  it('returns — for null', () => {
    expect(formatNumber(null)).toBe('—');
  });
  it('returns — for undefined', () => {
    expect(formatNumber(undefined)).toBe('—');
  });
  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
  it('formats with decimals', () => {
    // Just verify it returns a string with the value
    const result = formatNumber(1234.5, 1, 'en-US');
    expect(result).toBe('1,234.5');
  });
  it('formats integer with en-US locale', () => {
    expect(formatNumber(1000, 0, 'en-US')).toBe('1,000');
  });
});

describe('formatCompact', () => {
  it('returns — for null', () => {
    expect(formatCompact(null)).toBe('—');
  });
  it('formats millions', () => {
    expect(formatCompact(1_200_000)).toBe('1.2M');
  });
  it('formats exact millions', () => {
    expect(formatCompact(2_000_000)).toBe('2M');
  });
  it('formats thousands >= 10k', () => {
    expect(formatCompact(15_000)).toBe('15k');
  });
  it('formats thousands < 10k', () => {
    expect(formatCompact(8_500)).toBe('8.5k');
  });
  it('formats small numbers', () => {
    expect(formatCompact(500)).toBe('500');
  });
});

describe('extractLinks', () => {
  it('returns the text unchanged when there is no link', () => {
    const r = extractLinks('Remplir le formulaire et réunir les pièces justificatives.');
    expect(r.text).toBe('Remplir le formulaire et réunir les pièces justificatives.');
    expect(r.links).toEqual([]);
  });

  it('pulls an inline URL out of the sentence', () => {
    const r = extractLinks(
      'Consulter le site internet https://www.service-public.fr/particuliers/vosdroits/n110 pour définir la liste des pièces à présenter.',
    );
    expect(r.text).toBe('Consulter le site internet pour définir la liste des pièces à présenter.');
    expect(r.links).toHaveLength(1);
    expect(r.links[0].href).toBe('https://www.service-public.fr/particuliers/vosdroits/n110');
  });

  it('labels a URL with its hostname, without the www prefix', () => {
    const r = extractLinks('Voir https://www.service-public.fr/particuliers/vosdroits/n110 pour la suite.');
    expect(r.links[0].kind).toBe('url');
    expect(r.links[0].label).toBe('service-public.fr');
  });

  it('turns an email into a mailto href', () => {
    const r = extractLinks("Contacter l'adresse mail : pref-etrangers@calvados.gouv.fr si besoin.");
    expect(r.links).toHaveLength(1);
    expect(r.links[0].kind).toBe('email');
    expect(r.links[0].href).toBe('mailto:pref-etrangers@calvados.gouv.fr');
  });

  it('labels an email with its domain', () => {
    const r = extractLinks('Écrire à pref-etrangers@calvados.gouv.fr.');
    expect(r.links[0].label).toBe('calvados.gouv.fr');
  });

  it('keeps the full matched value for the title attribute', () => {
    const r = extractLinks('Écrire à pref-etrangers@calvados.gouv.fr.');
    expect(r.links[0].value).toBe('pref-etrangers@calvados.gouv.fr');
  });

  it('removes the punctuation orphaned by the extraction', () => {
    const r = extractLinks("Contacter l'adresse mail : pref-etrangers@calvados.gouv.fr si besoin.");
    expect(r.text).toBe("Contacter l'adresse mail si besoin.");
  });

  it('does not swallow the final period into the URL', () => {
    const r = extractLinks('Déposer le dossier sur https://demarche.numerique.gouv.fr/commencer.');
    expect(r.links[0].href).toBe('https://demarche.numerique.gouv.fr/commencer');
    expect(r.text).toBe('Déposer le dossier sur.');
  });

  it('extracts several links from one sentence', () => {
    const r = extractLinks(
      'Voir https://www.service-public.fr/n110 ou écrire à pref-etrangers@calvados.gouv.fr.',
    );
    expect(r.links.map((l) => l.kind)).toEqual(['url', 'email']);
  });

  it('links a bare domain written without a scheme', () => {
    const r = extractLinks('Se connecter avec son compte demarche.numerique.gouv.fr ou créer un compte.');
    expect(r.links).toHaveLength(1);
    expect(r.links[0].href).toBe('https://demarche.numerique.gouv.fr');
    expect(r.links[0].label).toBe('demarche.numerique.gouv.fr');
    expect(r.text).toBe('Se connecter avec son compte ou créer un compte.');
  });

  it('does not mistake a filename for a domain', () => {
    const r = extractLinks('Joindre le formulaire.pdf et la piece.docx au dossier.');
    expect(r.links).toEqual([]);
  });

  it('does not double-link the domain part of an email', () => {
    const r = extractLinks('Contacter pref-etrangers@calvados.gouv.fr.');
    expect(r.links).toHaveLength(1);
    expect(r.links[0].kind).toBe('email');
  });

  it('leaves punctuation alone in a sentence that has no link', () => {
    const sentence =
      "Joindre les documents suivants \u00e0 votre demande : permis de s\u00e9jour, carte d'identit\u00e9 ou passeport national valables.";
    expect(extractLinks(sentence).text).toBe(sentence);
  });

  it('only cleans the punctuation adjacent to the removed link', () => {
    const r = extractLinks('\u00c9tape : consulter https://www.service-public.fr/n110 puis d\u00e9poser.');
    expect(r.text).toBe('\u00c9tape : consulter puis d\u00e9poser.');
  });

  it('handles an empty string', () => {
    const r = extractLinks('');
    expect(r.text).toBe('');
    expect(r.links).toEqual([]);
  });
});
