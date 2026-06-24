import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { govLinksApi, type GovLink, type GenerationRun } from '../../../api/govLinks';
import { useSupportedCountries } from '../../../hooks/useSupportedCountries';
import { SUPPORTED_COUNTRIES } from '../../../data/supportedCountries';
import { useState, useMemo, useEffect } from 'react';
import { Loader2, RefreshCw, Link2, ExternalLink, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'visa', 'demarches', 'demarches-admin', 'logement', 'sante',
  'emploi', 'banque', 'transport', 'education', 'culture', 'business',
] as const;
type Category = typeof CATEGORIES[number];

function StatusBadge({ status }: { status: GovLink['status'] }) {
  const styles: Record<GovLink['status'], string> = {
    active: 'bg-green-100 text-green-700',
    needs_review: 'bg-amber-100 text-amber-700',
    dead: 'bg-red-100 text-red-700',
  };
  const labels: Record<GovLink['status'], string> = {
    active: 'Actif',
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
  const { countries } = useSupportedCountries();

  const [genCountry, setGenCountry] = useState<string>(() => countries[0]?.code ?? SUPPORTED_COUNTRIES[0].code);
  const [genCategory, setGenCategory] = useState<Category>('visa');
  const [activeGenKey, setActiveGenKey] = useState<string | null>(null);

  const [filterCountry, setFilterCountry] = useState<string>('all');

  // ── Per-country generation state ─────────────────────────────────────────
  const [activeRunId, setActiveRunId] = useState<number | null>(null);
  const [activeRunCountry, setActiveRunCountry] = useState<string>(
    () => countries[0]?.code ?? SUPPORTED_COUNTRIES[0].code,
  );

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

  const filteredLinks = useMemo(() => {
    if (filterCountry === 'all') return links;
    return links.filter((l) => l.countryCode === filterCountry);
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
              <Link2 className="w-7 h-7 text-[#5EA3C0]" />
              Liens Gouvernementaux
            </h1>
            <p className="text-gray-500 mt-0.5">
              Consultez et (re)générez les liens officiels récupérés par l'IA pour chaque pays et catégorie.
            </p>
          </div>
        </div>
      </div>

      {/* Services status banner */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-4 space-y-2">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">État des services</h2>
        <div className="flex flex-wrap gap-3">
          {/* LLM status */}
          {health === undefined ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Vérification…
            </span>
          ) : health.llm.ok ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              IA locale connectée — {health.llm.model}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              <XCircle className="w-3.5 h-3.5" />
              IA locale non connectée — lancez Ollama
            </span>
          )}

          {/* Search status */}
          {health === undefined ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Vérification…
            </span>
          ) : health.search.ok ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Recherche ({health.search.provider}) connectée
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              <XCircle className="w-3.5 h-3.5" />
              Recherche ({health.search.provider}) non connectée
            </span>
          )}
        </div>

        {/* Fallback note when LLM is down */}
        {health !== undefined && !health.llm.ok && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mt-2">
            Sans IA locale, la génération reste possible mais le lien est choisi par repli (1ᵉʳ lien officiel vérifié), sans tri par l'IA.
          </p>
        )}
      </div>

      {/* Generation Panel */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-[#5EA3C0]" />
          Générer / Mettre à jour un lien
        </h2>

        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          La génération interroge le web + l'IA locale et peut prendre ~10-30 s. Le résultat est mis en cache.
          Les catégories hors MVP (visa, demarches, logement, sante) peuvent retourner un statut "à vérifier".
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Pays</label>
            <select
              value={genCountry}
              onChange={(e) => setGenCountry(e.target.value)}
              disabled={generateMutation.isPending}
              className="px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 min-w-[160px] disabled:opacity-60"
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
              className="px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 min-w-[160px] disabled:opacity-60"
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
            className="flex items-center gap-2 bg-[#5EA3C0] hover:bg-[#4891b0] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
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

      {/* ── Génération par pays ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 space-y-5">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-[#5EA3C0]" />
          Génération par pays
        </h2>

        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Lance la génération des 11 catégories officielles pour un pays en arrière-plan (~1-2 min). Suivez la progression ci-dessous.
        </p>

        {/* Country buttons */}
        <div className="flex flex-wrap gap-3">
          {(countries.length > 0 ? countries : SUPPORTED_COUNTRIES).map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                setActiveRunCountry(c.code);
                setActiveRunId(null);
                generateCountryMutation.mutate(c.code);
              }}
              disabled={generateCountryMutation.isPending}
              className="flex items-center gap-2 bg-[#5EA3C0] hover:bg-[#4891b0] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generateCountryMutation.isPending &&
              generateCountryMutation.variables === c.code ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {'flag' in c ? `${c.flag} ` : ''}{c.code}
            </button>
          ))}
        </div>

        {/* Country selector for viewing runs */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Voir le dernier run pour :</span>
          <div className="flex flex-wrap gap-2">
            {(countries.length > 0 ? countries : SUPPORTED_COUNTRIES).map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setActiveRunCountry(c.code);
                  setActiveRunId(null);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  activeRunCountry === c.code
                    ? 'bg-[#5EA3C0] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {'flag' in c ? `${c.flag} ` : ''}{c.code}
              </button>
            ))}
          </div>
        </div>

        {/* Run status + progress */}
        {latestRunLoading && !displayRun ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#5EA3C0]" />
            Chargement du dernier run…
          </div>
        ) : displayRun ? (
          <div className="space-y-4">
            {/* Run header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="font-semibold">Run #{displayRun.id}</span>
                <span className="text-gray-400">·</span>
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
                  className="h-2 rounded-full bg-[#5EA3C0] transition-all duration-500"
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
                              className="inline-flex items-center gap-1 text-[#5EA3C0] hover:text-[#4891b0] hover:underline font-medium truncate"
                              title={r.url}
                            >
                              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate max-w-[200px] block">{r.url}</span>
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
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
                            disabled={rerunMutation.isPending}
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

      {/* Filter + Table */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 flex-wrap">
          <span className="text-sm font-bold text-gray-700">Filtrer par pays :</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCountry('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                filterCountry === 'all'
                  ? 'bg-[#5EA3C0] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            {countries.map((c) => (
              <button
                key={c.code}
                onClick={() => setFilterCountry(c.code)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filterCountry === c.code
                    ? 'bg-[#5EA3C0] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c.flag} {c.code}
              </button>
            ))}
          </div>
        </div>

        {/* Table body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#5EA3C0]" />
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
                          className="inline-flex items-center gap-1 text-[#5EA3C0] hover:text-[#4891b0] hover:underline font-medium truncate"
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
