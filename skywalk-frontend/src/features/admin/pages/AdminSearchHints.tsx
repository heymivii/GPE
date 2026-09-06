import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookMarked,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  Pin,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  searchHintsApi,
  type SearchHint,
  type CreateSearchHintInput,
} from '../../../api/searchHints';
import { useSupportedCountries } from '../../../hooks/useSupportedCountries';
import { SUPPORTED_COUNTRIES } from '../../../data/supportedCountries';

const CATEGORIES = [
  'visa', 'demarches', 'demarches-admin', 'logement', 'sante',
  'emploi', 'banque', 'transport', 'education', 'culture', 'business',
] as const;

const LANGS = [
  { code: 'fr', label: 'Français (site officiel)' },
  { code: 'en', label: 'English (official government site)' },
  { code: 'ja', label: '日本語 (公式サイト)' },
  { code: 'de', label: 'Deutsch (offizielle Website)' },
] as const;

// ── string[] ⇄ textarea (one entry per line) ───────────────────────────────────
const linesToArray = (text: string): string[] =>
  text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const arrayToLines = (arr?: string[]): string => (arr ?? []).join('\n');

interface FormState {
  countryCode: string;
  category: string;
  officialDomains: string; // newline-separated in the textarea
  keywords: string;
  queryLang: string;
  excludeTerms: string; // newline-separated in the textarea
  pinnedUrl: string;
}

const emptyForm = (countryCode: string): FormState => ({
  countryCode,
  category: 'visa',
  officialDomains: '',
  keywords: '',
  queryLang: 'fr',
  excludeTerms: '',
  pinnedUrl: '',
});

const fromHint = (h: SearchHint): FormState => ({
  countryCode: h.countryCode,
  category: h.category,
  officialDomains: arrayToLines(h.officialDomains),
  keywords: h.keywords ?? '',
  queryLang: h.queryLang ?? 'fr',
  excludeTerms: arrayToLines(h.excludeTerms),
  pinnedUrl: h.pinnedUrl ?? '',
});

export default function AdminSearchHints() {
  const queryClient = useQueryClient();
  const { countries } = useSupportedCountries();
  const countryList = countries.length > 0 ? countries : SUPPORTED_COUNTRIES;

  const [filterCountry, setFilterCountry] = useState<string>('all');

  // Form modal state: mode 'create' (key editable) vs 'edit' (key locked).
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<FormState>(() => emptyForm(countryList[0]?.code ?? 'FR'));

  const { data: hints = [], isLoading, isError } = useQuery({
    queryKey: ['admin-search-hints'],
    queryFn: () => searchHintsApi.list(),
  });

  const filteredHints = useMemo(() => {
    if (filterCountry === 'all') return hints;
    return hints.filter((h) => h.countryCode === filterCountry);
  }, [hints, filterCountry]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-search-hints'] });

  const seedMutation = useMutation({
    mutationFn: () => searchHintsApi.seed(),
    onSuccess: (res) => {
      toast.success(`Carnet : ${res.inserted} fiche(s) ajoutée(s), ${res.skipped} conservée(s)`);
      invalidate();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur lors du seed'),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateSearchHintInput) => searchHintsApi.create(input),
    onSuccess: (h) => {
      toast.success(`Fiche ${h.countryCode}/${h.category} créée`);
      invalidate();
      setFormOpen(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur lors de la création'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ cc, cat, patch }: { cc: string; cat: string; patch: Partial<CreateSearchHintInput> }) =>
      searchHintsApi.update(cc, cat, patch),
    onSuccess: (h) => {
      toast.success(`Fiche ${h.countryCode}/${h.category} modifiée`);
      invalidate();
      setFormOpen(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur lors de la modification'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ cc, cat }: { cc: string; cat: string }) => searchHintsApi.remove(cc, cat),
    onSuccess: (_res, { cc, cat }) => {
      toast.success(`Fiche ${cc}/${cat} supprimée`);
      invalidate();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur lors de la suppression'),
  });

  const saving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setFormMode('create');
    setForm(emptyForm(filterCountry !== 'all' ? filterCountry : (countryList[0]?.code ?? 'FR')));
    setFormOpen(true);
  };

  const openEdit = (h: SearchHint) => {
    setFormMode('edit');
    setForm(fromHint(h));
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (saving) return;
    const domains = linesToArray(form.officialDomains);
    const excludes = linesToArray(form.excludeTerms);
    const pinned = form.pinnedUrl.trim();

    if (formMode === 'create') {
      const cc = form.countryCode.trim().toUpperCase();
      if (cc.length !== 2 || !form.category) {
        toast.error('Pays (ISO2) et catégorie sont requis');
        return;
      }
      createMutation.mutate({
        countryCode: cc,
        category: form.category,
        officialDomains: domains,
        keywords: form.keywords.trim(),
        queryLang: form.queryLang,
        excludeTerms: excludes,
        // omit when empty → server stores null
        ...(pinned ? { pinnedUrl: pinned } : {}),
      });
    } else {
      updateMutation.mutate({
        cc: form.countryCode,
        cat: form.category,
        patch: {
          officialDomains: domains,
          keywords: form.keywords.trim(),
          queryLang: form.queryLang,
          excludeTerms: excludes,
          // empty field clears the pin (explicit null), otherwise sets it
          pinnedUrl: pinned ? pinned : null,
        },
      });
    }
  };

  const handleDelete = (h: SearchHint) => {
    if (deleteMutation.isPending) return;
    if (!window.confirm(`Supprimer la fiche ${h.countryCode}/${h.category} ?`)) return;
    deleteMutation.mutate({ cc: h.countryCode, cat: h.category });
  };

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold tracking-wide uppercase">
          <span>Admin</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold">Carnet de recherche</span>
        </div>
        <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <BookMarked className="w-7 h-7 text-brand-ink" />
              Carnet de recherche
            </h1>
            <p className="text-gray-500 mt-0.5">
              Pilotez la recherche de liens officiels par pays et catégorie : domaines de confiance, mots-clés, langue, termes à exclure, ou une URL épinglée.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
              title="Réinsère les fiches du seed manquantes — n'écrase jamais une fiche existante"
            >
              {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Restaurer les fiches manquantes
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 bg-brand-ink hover:bg-brand-ink-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Nouvelle fiche
            </button>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        Une <strong>URL épinglée</strong> court-circuite la recherche : elle est vérifiée en direct puis publiée telle quelle (l'allowlist de domaines est volontairement contournée). Sans épingle, la génération utilise les domaines + mots-clés ci-dessous, dans la langue choisie. Le carnet est facultatif — sans fiche, la génération retombe sur la requête générique.
      </p>

      {/* Filter + Table */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 flex-wrap">
          <span className="text-sm font-bold text-gray-700">Filtrer par pays :</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCountry('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                filterCountry === 'all' ? 'bg-brand-ink text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            {countryList.map((c) => (
              <button
                key={c.code}
                onClick={() => setFilterCountry(c.code)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filterCountry === c.code ? 'bg-brand-ink text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {'flag' in c ? `${c.flag} ` : ''}{c.code}
              </button>
            ))}
          </div>
        </div>

        {/* Table body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-brand-ink" />
            <span className="text-sm text-gray-500 font-medium">Chargement du carnet…</span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-red-500 font-semibold text-sm">
            Erreur lors du chargement du carnet de recherche.
          </div>
        ) : filteredHints.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <BookMarked className="w-12 h-12 mx-auto text-gray-300" />
            <p className="text-gray-500 font-medium text-sm">Aucune fiche — créez-en une ou restaurez le seed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3 text-left">Pays</th>
                  <th className="px-5 py-3 text-left">Catégorie</th>
                  <th className="px-5 py-3 text-left">Domaines officiels</th>
                  <th className="px-5 py-3 text-left">Mots-clés</th>
                  <th className="px-5 py-3 text-left">Langue</th>
                  <th className="px-5 py-3 text-left">Épinglé</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredHints.map((h) => {
                  const country = countryList.find((c) => c.code === h.countryCode);
                  return (
                    <tr key={h.id} className="hover:bg-gray-50/60 transition-colors align-top">
                      <td className="px-5 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                        <span className="mr-1.5">{country && 'flag' in country ? country.flag : ''}</span>
                        {h.countryCode}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{h.category}</td>
                      <td className="px-5 py-3.5 text-gray-600 max-w-xs">
                        {h.officialDomains.length === 0 ? (
                          <span className="text-gray-300">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {h.officialDomains.map((d) => (
                              <span key={d} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-mono">
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 max-w-xs truncate" title={h.keywords}>
                        {h.keywords || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 uppercase">{h.queryLang}</td>
                      <td className="px-5 py-3.5">
                        {h.pinnedUrl ? (
                          <a
                            href={h.pinnedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors max-w-[200px]"
                            title={h.pinnedUrl}
                          >
                            <Pin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">épinglé</span>
                          </a>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(h)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Éditer
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(h)}
                            disabled={deleteMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 bg-white hover:bg-red-50 text-red-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-brand-ink" />
                {formMode === 'create' ? 'Nouvelle fiche' : `Éditer ${form.countryCode}/${form.category}`}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Key (locked in edit mode) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Pays</label>
                  <select
                    value={form.countryCode}
                    onChange={(e) => set({ countryCode: e.target.value })}
                    disabled={formMode === 'edit'}
                    className="px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-brand text-sm text-gray-900 disabled:opacity-60 disabled:bg-gray-50"
                  >
                    {countryList.map((c) => (
                      <option key={c.code} value={c.code}>
                        {'flag' in c ? `${c.flag} ` : ''}{c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Catégorie</label>
                  <select
                    value={form.category}
                    onChange={(e) => set({ category: e.target.value })}
                    disabled={formMode === 'edit'}
                    className="px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-brand text-sm text-gray-900 disabled:opacity-60 disabled:bg-gray-50"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Language */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Langue des requêtes</label>
                <select
                  value={form.queryLang}
                  onChange={(e) => set({ queryLang: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-brand text-sm text-gray-900"
                >
                  {LANGS.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>

              {/* Keywords */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Mots-clés</label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => set({ keywords: e.target.value })}
                  placeholder="visa long séjour VLS-TS demande"
                  className="px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-brand text-sm text-gray-900"
                />
                <span className="text-xs text-gray-500">Combinés à chaque domaine + à la requête ouverte.</span>
              </div>

              {/* Official domains */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Domaines officiels (un par ligne)</label>
                <textarea
                  value={form.officialDomains}
                  onChange={(e) => set({ officialDomains: e.target.value })}
                  rows={3}
                  placeholder={'france-visas.gouv.fr\nservice-public.fr'}
                  className="px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-brand text-sm text-gray-900 font-mono resize-y"
                />
                <span className="text-xs text-gray-500">Une requête <code>site:&lt;domaine&gt;</code> est générée par domaine.</span>
              </div>

              {/* Exclude terms */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Termes à exclure (un par ligne)</label>
                <textarea
                  value={form.excludeTerms}
                  onChange={(e) => set({ excludeTerms: e.target.value })}
                  rows={2}
                  placeholder={'expatriation des français\nquitter la france'}
                  className="px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-brand text-sm text-gray-900 resize-y"
                />
                <span className="text-xs text-gray-500">Ajoutés comme <code>-terme</code> (locutions entre guillemets) à chaque requête.</span>
              </div>

              {/* Pinned URL */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-violet-500" />
                  URL épinglée (override)
                </label>
                <input
                  type="url"
                  value={form.pinnedUrl}
                  onChange={(e) => set({ pinnedUrl: e.target.value })}
                  placeholder="https://france-visas.gouv.fr/…"
                  className="px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-brand text-sm text-gray-900"
                />
                <span className="text-xs text-gray-500">Si renseignée, court-circuite la recherche. Laisser vide pour utiliser domaines + mots-clés.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 bg-brand-ink hover:bg-brand-ink-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {formMode === 'create' ? 'Créer la fiche' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
