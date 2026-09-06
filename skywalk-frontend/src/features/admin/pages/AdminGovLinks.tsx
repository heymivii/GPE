import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { govLinksApi, type GovLink, type GenerationRun } from '../../../api/govLinks';
import { countryApi } from '../../../api/country';
import type { Country } from '../../../types/country';
import { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, Ban, CheckCircle2, Clock, ExternalLink, Link2, Loader2, RefreshCw, Settings2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Admin panel to configure WHICH countries the engine processes (country.govLinkEnabled)
 * and their official-domain allowlist — the config removed from the country modal lives here.
 */
function EngineCountriesConfig() {
  const queryClient = useQueryClient();
  const { data: countries = [] } = useQuery({
    queryKey: ['admin-countries-engine'],
    queryFn: countryApi.getActive,
  });
  const [draft, setDraft] = useState<Record<number, { enabled: boolean; domains: string }>>({});

  const rowOf = (c: Country) =>
    draft[c.idCountry] ?? {
      enabled: c.govLinkEnabled ?? false,
      domains: (c.officialDomains ?? []).join('\n'),
    };

  const saveMutation = useMutation({
    mutationFn: ({ id, enabled, domains }: { id: number; enabled: boolean; domains: string }) =>
      countryApi.update(id, {
        govLinkEnabled: enabled,
        officialDomains: domains.split(/\r?\n/).map((d) => d.trim()).filter(Boolean),
      }),
    onSuccess: (c) => {
      toast.success(`Config moteur enregistrée pour ${c.countryName}`);
      queryClient.invalidateQueries({ queryKey: ['admin-countries-engine'] });
      queryClient.invalidateQueries({ queryKey: ['gov-links-supported-countries'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur lors de l’enregistrement'),
  });

  return (
    <details className="rounded-2xl border border-gray-150 bg-white shadow-sm">
      <summary className="cursor-pointer select-none px-6 py-4 text-sm font-bold text-gray-800 flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-brand-ink" />
        Pays gérés par le moteur ({countries.filter((c) => c.govLinkEnabled).length}/{countries.length} activés)
      </summary>
      <div className="px-6 pb-5 space-y-3">
        <p className="text-xs text-gray-500">
          Activez un pays pour que le moteur puisse générer ses liens, et listez ses domaines officiels
          (un par ligne) — seuls ces domaines (et leurs sous-domaines) peuvent être retenus.
        </p>
        {countries.map((c) => {
          const row = rowOf(c);
          return (
            <div key={c.idCountry} className="flex flex-wrap items-start gap-3 border-t border-gray-100 pt-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 min-w-[160px]">
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [c.idCountry]: { ...row, enabled: e.target.checked } }))
                  }
                  className="w-4 h-4 accent-brand"
                />
                {c.countryName}
              </label>
              <textarea
                value={row.domains}
                onChange={(e) => setDraft((d) => ({ ...d, [c.idCountry]: { ...row, domains: e.target.value } }))}
                rows={2}
                placeholder={'gouv.fr\nservice-public.fr'}
                className="flex-1 min-w-[220px] px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 font-mono resize-y focus:outline-none focus:border-brand"
              />
              <button
                type="button"
                onClick={() => saveMutation.mutate({ id: c.idCountry, enabled: row.enabled, domains: row.domains })}
                disabled={saveMutation.isPending}
                className="px-3 py-1.5 bg-brand-ink hover:bg-brand-ink-hover text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Enregistrer
              </button>
            </div>
          );
        })}
      </div>
    </details>
  );
}

const CATEGORIES = [
  'visa', 'demarches', 'demarches-admin', 'logement', 'sante',
  'emploi', 'banque', 'transport', 'education', 'culture', 'business',
] as const;
type Category = typeof CATEGORIES[number];

function StatusBadge({ status }: { status: GovLink['status'] }) {
  const styles: Record<GovLink['status'], string> = {
    pending_review: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    needs_review: 'bg-amber-100 text-amber-700',
    dead: 'bg-red-100 text-red-700',
  };
  const labels: Record<GovLink['status'], string> = {
    pending_review: 'À valider',
    active: 'Publié',
    needs_review: 'À vérifier',
    dead: 'Mort',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// ── Per-country generation ────────────────────────────────────────────────────

type RunResult = 'verified' | 'needs_review' | 'failed' | null;

function RunResultIcon({ result }: { result: RunResult }) {
  if (result === null)
    return <Clock className="w-4 h-4 text-gray-400" aria-label="En attente" />;
  if (result === 'verified')
    return <CheckCircle2 className="w-4 h-4 text-green-600" aria-label="Vérifié" />;
  if (result === 'needs_review')
    return <AlertTriangle className="w-4 h-4 text-amber-500" aria-label="À vérifier" />;
  return <XCircle className="w-4 h-4 text-red-500" aria-label="Échoué" />;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminGovLinks() {
  const queryClient = useQueryClient();

  // Two clear workspaces instead of one long pile: the LINKS (result) and the RUNS (machine).
  const [tab, setTab] = useState<'links' | 'runs'>('links');

  // The countries this ENGINE can process — served by the backend registry (single source of
  // truth), NOT the platform's active-countries list (which may contain unsupported countries).
  const { data: countries = [] } = useQuery({
    queryKey: ['gov-links-supported-countries'],
    queryFn: govLinksApi.getSupportedCountries,
    staleTime: Infinity,
  });

  const [genCountry, setGenCountry] = useState<string>('FR');
  const [genCategory, setGenCategory] = useState<Category>('visa');
  const [activeGenKey, setActiveGenKey] = useState<string | null>(null);

  const [filterCountry, setFilterCountry] = useState<string>('all');

  // ── Per-country generation state ─────────────────────────────────────────
  const [activeRunId, setActiveRunId] = useState<number | null>(null);
  const [activeRunCountry, setActiveRunCountry] = useState<string>('FR');

  const { data: health } = useQuery({
    queryKey: ['gov-links-health'],
    queryFn: govLinksApi.health,
    refetchInterval: 20000,
  });

  const { data: links = [], isLoading, isError } = useQuery({
    queryKey: ['admin-gov-links'],
    queryFn: () => govLinksApi.list(),
  });

  const generateMutation = useMutation({
    mutationFn: ({ country, category }: { country: string; category: string }) =>
      govLinksApi.generate(country, category),
    onMutate: ({ country, category }) => {
      setActiveGenKey(`${country}__${category}`);
    },
    onSuccess: (res) => {
      toast.success(`${res.countryCode}/${res.category} → ${res.status}`);
      queryClient.invalidateQueries({ queryKey: ['admin-gov-links'] });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Erreur de génération');
    },
    onSettled: () => {
      setActiveGenKey(null);
    },
  });

  // HUMAN gate: approve publishes the machine-verified link (and re-syncs the checklist).
  const reviewLinkMutation = useMutation({
    mutationFn: ({ id, approve }: { id: number; approve: boolean }) =>
      approve ? govLinksApi.approveLink(id) : govLinksApi.rejectLink(id),
    onSuccess: (link, { approve }) => {
      toast.success(
        approve
          ? `${link.countryCode}/${link.category} validé et publié ✓`
          : `${link.countryCode}/${link.category} rejeté — non publié`,
      );
      queryClient.invalidateQueries({ queryKey: ['admin-gov-links'] });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Erreur lors de la validation');
    },
  });

  // Ce qui demande une action passe en tête : à valider, puis à vérifier,
  // puis le publié, puis les liens morts — et pays/catégorie stables ensuite.
  const STATUS_PRIORITY: Record<string, number> = {
    pending_review: 0,
    needs_review: 1,
    active: 2,
    dead: 3,
  };
  const filteredLinks = useMemo(() => {
    const base = filterCountry === 'all' ? links : links.filter((l) => l.countryCode === filterCountry);
    return [...base].sort(
      (a, b) =>
        (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9) ||
        a.countryCode.localeCompare(b.countryCode) ||
        a.category.localeCompare(b.category),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [links, filterCountry]);

  const handleGenerate = () => {
    if (generateMutation.isPending) return;
    generateMutation.mutate({ country: genCountry, category: genCategory });
  };

  const handleRegenerate = (countryCode: string, category: string) => {
    if (generateMutation.isPending) return;
    generateMutation.mutate({ country: countryCode, category });
  };

  const isRowPending = (countryCode: string, category: string) =>
    activeGenKey === `${countryCode}__${category}`;

  // ── Latest run for the selected country (load on mount / country change) ──
  const { data: latestRun, isLoading: latestRunLoading } = useQuery({
    queryKey: ['gov-run-latest', activeRunCountry],
    queryFn: () => govLinksApi.getLatestRun(activeRunCountry),
    staleTime: 0,
  });

  // Seed activeRunId from latestRun when it arrives (and we have no active run)
  useEffect(() => {
    if (latestRun && activeRunId === null) {
      setActiveRunId(latestRun.id);
    }
  }, [latestRun, activeRunId]);

  // ── Poll the active run while it is running ───────────────────────────────
  const { data: polledRun, refetch: refetchRun } = useQuery({
    queryKey: ['gov-run', activeRunId],
    queryFn: () => govLinksApi.getRun(activeRunId!),
    enabled: activeRunId !== null,
    refetchInterval: (query) =>
      query.state.data?.status === 'running' ? 2000 : false,
  });

  // Derive the run to display (polled takes precedence once we have it)
  const displayRun: GenerationRun | null = polledRun ?? latestRun ?? null;

  // ── Generate whole country ────────────────────────────────────────────────
  const generateCountryMutation = useMutation({
    mutationFn: (country: string) => govLinksApi.generateCountry(country),
    onSuccess: (res, country) => {
      setActiveRunId(res.runId);
      setActiveRunCountry(country);
      toast.success(`Génération lancée pour ${country} (run #${res.runId})`);
      queryClient.invalidateQueries({ queryKey: ['gov-run-latest', country] });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Erreur de lancement');
    },
  });

  // ── Rerun a single category ───────────────────────────────────────────────
  const rerunMutation = useMutation({
    mutationFn: ({ runId, category }: { runId: number; category: string }) =>
      govLinksApi.rerunCategory(runId, category),
    onSuccess: (updatedRun) => {
      queryClient.setQueryData(['gov-run', updatedRun.id], updatedRun);
      toast.success(`Relance de ${rerunMutation.variables?.category} lancée`);
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Erreur de relance');
    },
  });

  // ── Progress helpers ──────────────────────────────────────────────────────
  const runDone = displayRun
    ? displayRun.results.filter((r) => r.result !== null).length
    : 0;
  const runTotal = displayRun?.total ?? 0;
  const runPct = runTotal > 0 ? (runDone / runTotal) * 100 : 0;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const truncateUrl = (url: string, max = 50) =>
    url.length > max ? url.slice(0, max) + '…' : url;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold tracking-wide uppercase">
          <span>Admin</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold">Liens Gouvernementaux</span>
        </div>
        <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Link2 className="w-7 h-7 text-brand-ink" />
              Liens Gouvernementaux
            </h1>
            <p className="text-gray-500 mt-0.5">
              Consultez et (re)générez les liens officiels récupérés par l'IA pour chaque pays et catégorie.
            </p>
          </div>
          {/* Compact service health — a dot per service, details on hover */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                health === undefined ? 'bg-gray-100 text-gray-500' : health.llm.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
              title={health?.llm.ok ? `IA connectée — ${health.llm.model}` : 'IA non connectée — le lien sera choisi par repli (1ᵉʳ vérifié), sans tri IA'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${health === undefined ? 'bg-gray-400' : health.llm.ok ? 'bg-green-500' : 'bg-red-500'}`} />
              IA
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                health === undefined ? 'bg-gray-100 text-gray-500' : health.search.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
              title={health?.search.ok ? `Recherche (${health?.search.provider}) connectée` : `Recherche (${health?.search.provider ?? '?'}) injoignable — la génération est bloquée`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${health === undefined ? 'bg-gray-400' : health.search.ok ? 'bg-green-500' : 'bg-red-500'}`} />
              Recherche
            </span>
          </div>
        </div>
      </div>

      {/* Search engine down → generation is hard-blocked backend-side, say it upfront */}
      {health !== undefined && !health.search.ok && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          <Ban className="w-4 h-4 inline-block mr-1 -mt-0.5" /> Moteur de recherche ({health.search.provider}) injoignable — toute génération est refusée tant qu'il n'est pas rétabli
          {health.search.provider === 'searxng' ? <> (<code>docker start searxng</code>)</> : <> (vérifiez la clé API et la variable <code>SEARCH_PROVIDER</code>)</>}.
        </p>
      )}

      {/* Tabs: the LINKS (result) vs the RUNS (machine) */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('links')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 -mb-px ${
            tab === 'links' ? 'border-brand text-brand-ink bg-white' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Liens officiels
        </button>
        <button
          type="button"
          onClick={() => setTab('runs')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            tab === 'runs' ? 'border-brand text-brand-ink bg-white' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Génération par pays
          {displayRun?.status === 'running' && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />}
        </button>
      </div>

      {/* ═══ TAB : LIENS OFFICIELS ═══ */}
      {tab === 'links' && (
      <>
      {/* Generation Panel */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-brand-ink" />
          Générer / Mettre à jour un lien
          <span className="text-xs font-normal text-gray-500">(~10-30 s, résultat mis en cache)</span>
        </h2>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Pays</label>
            <select
              value={genCountry}
              onChange={(e) => setGenCountry(e.target.value)}
              disabled={generateMutation.isPending}
              className="px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-brand text-sm text-gray-900 min-w-[160px] disabled:opacity-60"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Catégorie</label>
            <select
              value={genCategory}
              onChange={(e) => setGenCategory(e.target.value as Category)}
              disabled={generateMutation.isPending}
              className="px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-brand text-sm text-gray-900 min-w-[160px] disabled:opacity-60"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="flex items-center gap-2 bg-brand-ink hover:bg-brand-ink-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generateMutation.isPending && activeGenKey === `${genCountry}__${genCategory}` ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération…
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Générer
              </>
            )}
          </button>
        </div>
      </div>
      </>
      )}

      {/* ═══ TAB : GÉNÉRATION PAR PAYS ═══ */}
      {tab === 'runs' && (
      <>
      <EngineCountriesConfig />
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 space-y-5">
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Lance la génération des 11 catégories officielles pour un pays en arrière-plan (~2-10 min). Suivez la progression ci-dessous — les liens vérifiés apparaissent dans l'onglet « Liens officiels ».
        </p>

        {/* ONE country selector drives everything (generate + run viewer) — scales to any
            number of countries, unlike a row of per-country buttons. */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Pays</label>
            <select
              value={activeRunCountry}
              onChange={(e) => {
                setActiveRunCountry(e.target.value);
                setActiveRunId(null);
              }}
              className="px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-brand text-sm text-gray-900 min-w-[220px]"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => generateCountryMutation.mutate(activeRunCountry)}
            disabled={generateCountryMutation.isPending || displayRun?.status === 'running'}
            title={
              displayRun?.status === 'running'
                ? 'Un run est déjà en cours pour ce pays — attendez la fin'
                : undefined
            }
            className="flex items-center gap-2 bg-brand-ink hover:bg-brand-ink-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generateCountryMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Générer pour {activeRunCountry}
          </button>
          <span className="text-xs text-gray-500 pb-2.5">
            Le dernier run du pays sélectionné s'affiche automatiquement ci-dessous.
          </span>
        </div>

        {/* Run status + progress */}
        {latestRunLoading && !displayRun ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin text-brand-ink" />
            Chargement du dernier run…
          </div>
        ) : displayRun ? (
          <div className="space-y-4">
            {/* Run header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="font-semibold">Run #{displayRun.id}</span>
                <span className="text-gray-500">·</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  displayRun.status === 'running'
                    ? 'bg-blue-100 text-blue-700'
                    : displayRun.status === 'done'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {displayRun.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                  {displayRun.status === 'running' ? 'En cours' : displayRun.status === 'done' ? 'Terminé' : 'Échoué'}
                </span>
                <span className="text-gray-500 text-xs">
                  Démarré le {new Date(displayRun.startedAt).toLocaleString('fr-FR')}
                  {displayRun.finishedAt && ` · Fini le ${new Date(displayRun.finishedAt).toLocaleString('fr-FR')}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => refetchRun()}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Rafraîchir
              </button>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Progression</span>
                <span className="font-semibold tabular-nums">{runDone}/{runTotal}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-brand-ink transition-all duration-500"
                  style={{ width: `${runPct}%` }}
                />
              </div>
            </div>

            {/* Review table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-2.5 text-left w-10">État</th>
                    <th className="px-4 py-2.5 text-left">Catégorie</th>
                    <th className="px-4 py-2.5 text-left">Lien</th>
                    <th className="px-4 py-2.5 text-left">Confiance</th>
                    <th className="px-4 py-2.5 text-left">Message</th>
                    <th className="px-4 py-2.5 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayRun.results.map((r) => {
                    const isRelaunching =
                      rerunMutation.isPending &&
                      rerunMutation.variables?.category === r.category &&
                      rerunMutation.variables?.runId === displayRun.id;
                    return (
                      <tr key={r.category} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <RunResultIcon result={r.result} />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{r.category}</td>
                        <td className="px-4 py-3 max-w-xs">
                          {r.url ? (
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-brand-ink hover:text-brand-ink-hover hover:underline font-medium truncate"
                              title={r.url}
                            >
                              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate max-w-[200px] block">{r.url}</span>
                            </a>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700 tabular-nums">
                          {r.confidence != null ? r.confidence.toFixed(2) : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate" title={r.message ?? undefined}>
                          {r.message ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              rerunMutation.mutate({ runId: displayRun.id, category: r.category })
                            }
                            disabled={rerunMutation.isPending || displayRun.status === 'running'}
                            title={
                              displayRun.status === 'running'
                                ? 'Attendez la fin du run — relancer pendant le run écraserait ses résultats'
                                : undefined
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isRelaunching ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3.5 h-3.5" />
                            )}
                            Relancer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucun run pour {activeRunCountry}. Cliquez sur « Générer (pays) » pour commencer.</p>
        )}
      </div>
      </>
      )}

      {/* Filter + Table */}
      {tab === 'links' && (
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        {/* Filter bar — select, not pills: must scale to many countries */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 flex-wrap">
          <span className="text-sm font-bold text-gray-700">Filtrer par pays :</span>
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-brand text-sm text-gray-900 min-w-[200px]"
          >
            <option value="all">Tous les pays</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.code})
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500">{filteredLinks.length} lien(s)</span>
        </div>

        {/* Table body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-brand-ink" />
            <span className="text-sm text-gray-500 font-medium">Chargement des liens…</span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-red-500 font-semibold text-sm">
            Erreur lors du chargement des liens gouvernementaux.
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Link2 className="w-12 h-12 mx-auto text-gray-300" />
            <p className="text-gray-500 font-medium text-sm">Aucun lien — générez-en un.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3 text-left">Pays</th>
                  <th className="px-5 py-3 text-left">Catégorie</th>
                  <th className="px-5 py-3 text-left">Statut</th>
                  <th className="px-5 py-3 text-left">Confiance</th>
                  <th className="px-5 py-3 text-left">Lien</th>
                  <th className="px-5 py-3 text-left">Vérifié le</th>
                  <th className="px-5 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLinks.map((link) => {
                  const country = countries.find((c) => c.code === link.countryCode);
                  const pending = isRowPending(link.countryCode, link.category);
                  return (
                    <tr key={link.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-800">
                        <span className="mr-1.5">{country?.flag ?? ''}</span>
                        {link.countryCode}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {link.category}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={link.status} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 tabular-nums">
                        {link.confidence.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 max-w-xs">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand-ink hover:text-brand-ink-hover hover:underline font-medium truncate"
                          title={link.url}
                        >
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{truncateUrl(link.url)}</span>
                        </a>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {formatDate(link.verifiedAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                        {link.status === 'pending_review' && (
                          <>
                            <button
                              type="button"
                              onClick={() => reviewLinkMutation.mutate({ id: link.id, approve: true })}
                              disabled={reviewLinkMutation.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                              title="Valider ce lien vérifié par la machine → publié dans la checklist"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Valider
                            </button>
                            <button
                              type="button"
                              onClick={() => reviewLinkMutation.mutate({ id: link.id, approve: false })}
                              disabled={reviewLinkMutation.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 bg-white hover:bg-red-50 text-red-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                              title="Rejeter — le lien reste caché (régénérez ou épinglez une URL dans le carnet)"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRegenerate(link.countryCode, link.category)}
                          disabled={generateMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {pending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          Régénérer
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
      )}
    </div>
  );
}
