import { useState, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { globalSearchApi, type GlobalSearchResult, type SearchCategory } from '../api/globalSearch';
import { getServicesConfig } from '../data/services-config';

/**
 * Static FAQ entries — searched client-side then merged with DB results.
 * Each entry has keys that map to i18n translation keys.
 */
const FAQ_ENTRIES: Array<{
  questionKey: string;
  answerKey: string;
  tags: string[]; // raw search terms (both FR + EN for bilingual matching)
}> = [
  {
    questionKey: 'globalSearch.faq.visa.question',
    answerKey: 'globalSearch.faq.visa.answer',
    tags: ['visa', 'obtenir', 'obtain', 'work permit', 'permis travail', 'h1b', 'titre séjour', 'residence permit'],
  },
  {
    questionKey: 'globalSearch.faq.bankAccount.question',
    answerKey: 'globalSearch.faq.bankAccount.answer',
    tags: ['banque', 'bank', 'compte bancaire', 'bank account', 'ouvrir', 'open', 'iban'],
  },
  {
    questionKey: 'globalSearch.faq.costOfLiving.question',
    answerKey: 'globalSearch.faq.costOfLiving.answer',
    tags: ['coût', 'cost', 'vie', 'living', 'budget', 'salaire', 'salary', 'prix', 'price', 'loyer', 'rent'],
  },
  {
    questionKey: 'globalSearch.faq.housing.question',
    answerKey: 'globalSearch.faq.housing.answer',
    tags: ['logement', 'housing', 'appartement', 'apartment', 'louer', 'rent', 'bail', 'lease', 'caution', 'deposit'],
  },
  {
    questionKey: 'globalSearch.faq.healthcare.question',
    answerKey: 'globalSearch.faq.healthcare.answer',
    tags: ['santé', 'health', 'assurance', 'insurance', 'médecin', 'doctor', 'hôpital', 'hospital', 'sécurité sociale', 'social security'],
  },
  {
    questionKey: 'globalSearch.faq.jobSearch.question',
    answerKey: 'globalSearch.faq.jobSearch.answer',
    tags: ['emploi', 'job', 'travail', 'work', 'cv', 'resume', 'entretien', 'interview', 'recrutement', 'recruitment'],
  },
  {
    questionKey: 'globalSearch.faq.language.question',
    answerKey: 'globalSearch.faq.language.answer',
    tags: ['langue', 'language', 'apprendre', 'learn', 'cours', 'course', 'niveau', 'level', 'certification'],
  },
  {
    questionKey: 'globalSearch.faq.transport.question',
    answerKey: 'globalSearch.faq.transport.answer',
    tags: ['transport', 'métro', 'metro', 'bus', 'train', 'permis conduire', 'driver license', 'voiture', 'car'],
  },
];

export interface UseGlobalSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: GlobalSearchResult[];
  isLoading: boolean;
  error: string | null;
  search: (q: string, category?: SearchCategory) => Promise<void>;
  clear: () => void;
}

export function useGlobalSearch(): UseGlobalSearchReturn {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Build static service entries from the translated config
  const serviceEntries = useMemo(() => {
    const cfg = getServicesConfig(t);
    return Object.values(cfg).map((svc) => ({
      category: 'service' as SearchCategory,
      entityId: svc.id,
      title: svc.title,
      description: svc.description,
      extra: svc.subtitle,
      url: `/services/${svc.id}`,
      countryName: '',
      imageUrl: null,
      rank: 0,
    }));
  }, [t]);

  // Build static FAQ entries
  const faqEntries = useMemo(
    () =>
      FAQ_ENTRIES.map((f) => ({
        category: 'faq' as SearchCategory,
        entityId: f.questionKey,
        title: t(f.questionKey),
        description: t(f.answerKey),
        extra: '',
        url: null,
        countryName: '',
        imageUrl: null,
        rank: 0,
        _tags: f.tags,
      })),
    [t],
  );

  /**
   * Local text match for static entries (services + FAQ).
   */
  const searchStatic = useCallback(
    (q: string, category?: SearchCategory): GlobalSearchResult[] => {
      const lower = q.toLowerCase();
      const words = lower.split(/\s+/).filter(Boolean);

      const matched: GlobalSearchResult[] = [];

      // Services
      if (!category || category === 'service') {
        for (const svc of serviceEntries) {
          const haystack = `${svc.title} ${svc.description} ${svc.extra}`.toLowerCase();
          if (words.some((w) => haystack.includes(w))) {
            matched.push({ ...svc, rank: 0.8 });
          }
        }
      }

      // FAQ
      if (!category || category === 'faq') {
        for (const faq of faqEntries) {
          const haystack = `${faq.title} ${faq.description} ${faq._tags.join(' ')}`.toLowerCase();
          if (words.some((w) => haystack.includes(w))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _tags, ...rest } = faq;
            matched.push({ ...rest, rank: 0.7 });
          }
        }
      }

      return matched;
    },
    [serviceEntries, faqEntries],
  );

  const search = useCallback(
    async (q: string, category?: SearchCategory) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setResults([]);
        return;
      }

      // Abort previous request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        // Run DB search + static search in parallel
        const isStaticOnly = category === 'service' || category === 'faq';

        const [dbResponse, staticResults] = await Promise.all([
          isStaticOnly
            ? Promise.resolve({ results: [], total: 0, query: trimmed })
            : globalSearchApi.search(trimmed, category, 15),
          Promise.resolve(searchStatic(trimmed, category)),
        ]);

        // Merge & deduplicate by category+entityId
        const seen = new Set<string>();
        const merged: GlobalSearchResult[] = [];

        // DB results first (higher rank from FTS)
        for (const r of dbResponse.results) {
          const key = `${r.category}:${r.entityId}`;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(r);
          }
        }
        // Then static results
        for (const r of staticResults) {
          const key = `${r.category}:${r.entityId}`;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(r);
          }
        }

        // Sort by rank descending
        merged.sort((a, b) => (Number(b.rank) || 0) - (Number(a.rank) || 0));

        setResults(merged.slice(0, 20));
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Global search error:', err);
          setError(t('globalSearch.error'));
          // Still show static results on API failure
          setResults(searchStatic(trimmed, category));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [searchStatic, t],
  );

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return { query, setQuery, results, isLoading, error, search, clear };
}
