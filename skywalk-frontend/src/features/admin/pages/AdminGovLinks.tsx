import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { govLinksApi, type GovLink } from '../../../api/govLinks';
import { SUPPORTED_COUNTRIES } from '../../../data/supportedCountries';
import { useState, useMemo } from 'react';
import { Loader2, RefreshCw, Link2, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['visa', 'demarches', 'logement', 'sante'] as const;
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

export default function AdminGovLinks() {
  const queryClient = useQueryClient();

  const [genCountry, setGenCountry] = useState<string>(SUPPORTED_COUNTRIES[0].code);
  const [genCategory, setGenCategory] = useState<Category>('visa');
  const [activeGenKey, setActiveGenKey] = useState<string | null>(null);

  const [filterCountry, setFilterCountry] = useState<string>('all');

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
              {SUPPORTED_COUNTRIES.map((c) => (
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
            {SUPPORTED_COUNTRIES.map((c) => (
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
                  const country = SUPPORTED_COUNTRIES.find((c) => c.code === link.countryCode);
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
