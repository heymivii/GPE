import { useEffect, useRef, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  Globe,
  MapPin,
  BookOpen,
  CheckSquare,
  FileText,
  MessageSquare,
  ClipboardList,
  Briefcase,
  HelpCircle,
  Loader2,
  ArrowRight,
  Command,
} from 'lucide-react';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import type { GlobalSearchResult, SearchCategory } from '../api/globalSearch';

/* ── Category metadata (icon + color + label key) ── */
const CATEGORY_META: Record<
  string,
  { icon: React.ElementType; color: string; labelKey: string }
> = {
  country: { icon: Globe, color: 'text-blue-600 bg-blue-50', labelKey: 'globalSearch.categories.country' },
  city: { icon: MapPin, color: 'text-emerald-600 bg-emerald-50', labelKey: 'globalSearch.categories.city' },
  guide: { icon: BookOpen, color: 'text-purple-600 bg-purple-50', labelKey: 'globalSearch.categories.guide' },
  checklist: { icon: CheckSquare, color: 'text-orange-600 bg-orange-50', labelKey: 'globalSearch.categories.checklist' },
  resource: { icon: FileText, color: 'text-cyan-600 bg-cyan-50', labelKey: 'globalSearch.categories.resource' },
  forum: { icon: MessageSquare, color: 'text-pink-600 bg-pink-50', labelKey: 'globalSearch.categories.forum' },
  procedure: { icon: ClipboardList, color: 'text-amber-600 bg-amber-50', labelKey: 'globalSearch.categories.procedure' },
  service: { icon: Briefcase, color: 'text-indigo-600 bg-indigo-50', labelKey: 'globalSearch.categories.service' },
  faq: { icon: HelpCircle, color: 'text-teal-600 bg-teal-50', labelKey: 'globalSearch.categories.faq' },
};

/* ── Quick action links shown when the input is empty ── */
const QUICK_LINKS: Array<{ labelKey: string; path: string; icon: React.ElementType }> = [
  { labelKey: 'globalSearch.quick.destinations', path: '/destinations', icon: Globe },
  { labelKey: 'globalSearch.quick.services', path: '/services', icon: Briefcase },
  { labelKey: 'globalSearch.quick.forum', path: '/forum', icon: MessageSquare },
  { labelKey: 'globalSearch.quick.comparison', path: '/comparison', icon: MapPin },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { query, setQuery, results, isLoading, error, search, clear } =
    useGlobalSearch();

  const selectedIndexRef = useRef(-1);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      selectedIndexRef.current = -1;
    } else {
      clear();
    }
  }, [isOpen, clear]);

  // Debounced search
  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        search(value);
      }, 250);
    },
    [setQuery, search],
  );

  // Navigate to result
  const navigateToResult = useCallback(
    (result: GlobalSearchResult) => {
      onClose();
      switch (result.category) {
        case 'country':
          // Build slug from country name
          navigate(
            `/destinations/${result.title.toLowerCase().replace(/\s+/g, '-').replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/[ùû]/g, 'u').replace(/[ïî]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ç]/g, 'c')}`,
          );
          break;
        case 'city':
          // Navigate to the country page (city is under country)
          navigate(
            `/destinations/${result.countryName.toLowerCase().replace(/\s+/g, '-').replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/[ùû]/g, 'u').replace(/[ïî]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ç]/g, 'c')}`,
          );
          break;
        case 'guide':
        case 'checklist':
        case 'resource':
          // Navigate to the destination page for the country
          if (result.countryName) {
            navigate(
              `/destinations/${result.countryName.toLowerCase().replace(/\s+/g, '-').replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/[ùû]/g, 'u').replace(/[ïî]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ç]/g, 'c')}`,
            );
          }
          break;
        case 'forum':
          navigate(`/forum/post/${result.entityId}`);
          break;
        case 'procedure':
          navigate('/services/demarches');
          break;
        case 'service':
          navigate(result.url || `/services/${result.entityId}`);
          break;
        case 'faq':
          // Navigate to the most relevant service page
          navigate('/services');
          break;
        default:
          break;
      }
    },
    [navigate, onClose],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = listRef.current?.querySelectorAll('[data-search-item]');
      if (!items?.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndexRef.current = Math.min(
          selectedIndexRef.current + 1,
          items.length - 1,
        );
        (items[selectedIndexRef.current] as HTMLElement).scrollIntoView({
          block: 'nearest',
        });
        items.forEach((el, i) =>
          el.classList.toggle('bg-gray-100', i === selectedIndexRef.current),
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndexRef.current = Math.max(selectedIndexRef.current - 1, 0);
        (items[selectedIndexRef.current] as HTMLElement).scrollIntoView({
          block: 'nearest',
        });
        items.forEach((el, i) =>
          el.classList.toggle('bg-gray-100', i === selectedIndexRef.current),
        );
      } else if (e.key === 'Enter' && selectedIndexRef.current >= 0) {
        e.preventDefault();
        (items[selectedIndexRef.current] as HTMLElement).click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group results by category
  const grouped = results.reduce<Record<string, GlobalSearchResult[]>>(
    (acc, r) => {
      if (!acc[r.category]) acc[r.category] = [];
      acc[r.category].push(r);
      return acc;
    },
    {},
  );

  const categoryOrder: SearchCategory[] = [
    'country',
    'city',
    'service',
    'guide',
    'checklist',
    'resource',
    'forum',
    'procedure',
    'faq',
  ];

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 top-[12vh] z-[101] mx-auto w-full max-w-2xl px-4">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={t('globalSearch.placeholder')}
              className="flex-1 bg-transparent text-base text-gray-900 placeholder:text-gray-400 outline-none"
            />
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
            {query && (
              <button
                onClick={() => handleChange('')}
                className="rounded-md p-1 hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              ESC
            </kbd>
          </div>

          {/* Results area */}
          <div
            ref={listRef}
            className="max-h-[60vh] overflow-y-auto overscroll-contain"
          >
            {/* Empty state — quick links */}
            {!query && (
              <div className="p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  {t('globalSearch.quickActions')}
                </p>
                <div className="space-y-1">
                  {QUICK_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.path}
                        data-search-item
                        onClick={() => {
                          onClose();
                          navigate(link.path);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icon className="h-4 w-4 text-gray-400" />
                        <span>{t(link.labelKey)}</span>
                        <ArrowRight className="ml-auto h-3.5 w-3.5 text-gray-300" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="px-4 py-6 text-center text-sm text-red-500">
                {error}
              </div>
            )}

            {/* No results */}
            {query && !isLoading && results.length === 0 && !error && (
              <div className="px-4 py-10 text-center">
                <Search className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">
                  {t('globalSearch.noResults', { query })}
                </p>
              </div>
            )}

            {/* Grouped results */}
            {categoryOrder.map((cat) => {
              const items = grouped[cat];
              if (!items?.length) return null;

              const meta = CATEGORY_META[cat] || CATEGORY_META.resource;
              const CatIcon = meta.icon;

              return (
                <div key={cat} className="border-b border-gray-50 last:border-none">
                  <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                    <CatIcon className={`h-3.5 w-3.5 ${meta.color.split(' ')[0]}`} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {t(meta.labelKey)}
                    </span>
                    <span className="text-[10px] text-gray-300">
                      {items.length}
                    </span>
                  </div>

                  {items.map((result) => (
                    <ResultItem
                      key={`${result.category}:${result.entityId}`}
                      result={result}
                      meta={meta}
                      onClick={() => navigateToResult(result)}
                      query={query}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5 text-[11px] text-gray-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">↑↓</kbd>
                {t('globalSearch.footer.navigate')}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">↵</kbd>
                {t('globalSearch.footer.open')}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">esc</kbd>
                {t('globalSearch.footer.close')}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Command className="h-3 w-3" />
              SkyWalk Search
            </span>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

/* ── Single result row ── */
function ResultItem({
  result,
  meta,
  onClick,
  query,
}: {
  result: GlobalSearchResult;
  meta: { icon: React.ElementType; color: string };
  onClick: () => void;
  query: string;
}) {
  const Icon = meta.icon;
  const [iconColor, iconBg] = meta.color.split(' ');

  // Highlight matching text
  const highlight = (text: string) => {
    if (!query || !text) return text;
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi',
    );
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-100 text-yellow-900 rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <button
      data-search-item
      onClick={onClick}
      className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
    >
      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-gray-900">
            {highlight(result.title)}
          </span>
          {result.countryName && (
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
              {result.countryName}
            </span>
          )}
        </div>
        {result.description && (
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {highlight(result.description.slice(0, 120))}
          </p>
        )}
      </div>

      <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-gray-300" />
    </button>
  );
}
