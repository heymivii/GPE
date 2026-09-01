import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  ShieldAlert,
  Plus,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Flag,
  Check,
  X,
  Search,
  Ban,
  Loader2,
} from 'lucide-react';
import {
  forumModerationApi,
  type WordSeverity,
  type ForbiddenWord,
} from '../../../api/forum-moderation';
import { userReportApi } from '../../../api/user-report';

const SEVERITIES: WordSeverity[] = ['low', 'medium', 'high', 'critical'];
const PAGE_SIZE = 40;

const SEVERITY_STYLE: Record<WordSeverity, string> = {
  low: 'bg-gray-100 text-gray-600 border-gray-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};

// low/medium → publié mais flaggé ; high/critical → bloqué.
const severityAction = (s: WordSeverity) =>
  s === 'high' || s === 'critical' ? 'bloque' : 'flag';

type Tab = 'words' | 'users' | 'reports';

export default function AdminModeration() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('words');

  // Filtres mots interdits
  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState<'all' | WordSeverity>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(0);

  const [newWord, setNewWord] = useState('');
  const [newSeverity, setNewSeverity] = useState<WordSeverity>('medium');
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

  const { data: words = [], isLoading: wordsLoading } = useQuery({
    queryKey: ['forbidden-words'],
    queryFn: forumModerationApi.listWords,
  });

  const { data: flaggedUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['flagged-users'],
    queryFn: () => forumModerationApi.flaggedUsers(1),
  });

  const { data: userWarnings = [] } = useQuery({
    queryKey: ['user-warnings', expandedUser],
    queryFn: () => forumModerationApi.userWarnings(expandedUser as number),
    enabled: expandedUser !== null,
  });

  const { data: userReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['user-reports', 'pending'],
    queryFn: () => userReportApi.list('pending'),
  });

  const invalidateWords = () =>
    queryClient.invalidateQueries({ queryKey: ['forbidden-words'] });

  const createMutation = useMutation({
    mutationFn: forumModerationApi.createWord,
    onSuccess: () => {
      setNewWord('');
      invalidateWords();
      toast.success('Mot ajouté');
    },
    onError: () => toast.error("Échec de l'ajout (déjà présent ?)"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ForbiddenWord> }) =>
      forumModerationApi.updateWord(id, data),
    onSuccess: invalidateWords,
    onError: () => toast.error('Échec de la mise à jour'),
  });

  const removeMutation = useMutation({
    mutationFn: forumModerationApi.removeWord,
    onSuccess: () => {
      invalidateWords();
      toast.success('Mot supprimé');
    },
    onError: () => toast.error('Échec de la suppression'),
  });

  const resolveReportMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'resolved' | 'rejected' }) =>
      userReportApi.resolve(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reports'] });
      toast.success('Signalement traité');
    },
    onError: () => toast.error('Échec du traitement'),
  });

  // ── Filtrage + pagination des mots ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return words.filter((w) => {
      if (q && !w.word.includes(q)) return false;
      if (sevFilter !== 'all' && w.severity !== sevFilter) return false;
      if (activeFilter === 'active' && !w.isActive) return false;
      if (activeFilter === 'inactive' && w.isActive) return false;
      return true;
    });
  }, [words, search, sevFilter, activeFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > pageCount - 1) setPage(0);
  }, [page, pageCount]);
  const pageWords = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const blockingCount = words.filter(
    (w) => w.isActive && (w.severity === 'high' || w.severity === 'critical'),
  ).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const word = newWord.trim();
    if (!word) return;
    createMutation.mutate({ word, severity: newSeverity });
  };

  const reasonLabel: Record<string, string> = {
    spam: 'Spam',
    harassment: 'Harcèlement',
    hate_speech: 'Propos haineux',
    impersonation: 'Usurpation',
    inappropriate: 'Inapproprié',
    other: 'Autre',
  };
  const displayName = (u?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }) =>
    u?.fullName ||
    `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim() ||
    u?.email ||
    'Utilisateur';

  const tabs: { id: Tab; label: string; count: number; icon: typeof Flag }[] = [
    { id: 'words', label: 'Mots interdits', count: words.length, icon: Ban },
    { id: 'users', label: 'Récidivistes', count: flaggedUsers.length, icon: AlertTriangle },
    { id: 'reports', label: 'Signalements', count: userReports.length, icon: Flag },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* En-tête (charte admin) */}
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold tracking-wide uppercase">
          <ShieldAlert className="w-3.5 h-3.5" /> Console d'admin
        </div>
        <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-[#5EA3C0]" />
            Modération Forum
          </h1>
          <div className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{words.length}</span> mots ·{' '}
            <span className="font-semibold text-red-600">{blockingCount}</span> bloquants
          </div>
        </div>
        <p className="text-sm text-gray-500">
          high/critical bloquent la publication · low/medium publient mais flaguent + avertissent l'auteur.
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-gray-100 -mt-3">
        {tabs.map((tItem) => {
          const Icon = tItem.icon;
          const active = tab === tItem.id;
          return (
            <button
              key={tItem.id}
              onClick={() => setTab(tItem.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                active
                  ? 'border-[#5EA3C0] text-[#5EA3C0]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tItem.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-[#5EA3C0]/10 text-[#5EA3C0]' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tItem.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ───────────── Onglet MOTS INTERDITS ───────────── */}
      {tab === 'words' && (
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
          {/* Barre d'outils : ajout + filtres */}
          <div className="px-6 py-4 border-b border-gray-100 space-y-3">
            <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
              <input
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Nouveau mot ou expression…"
                className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5EA3C0]/20 focus:border-[#5EA3C0]"
              />
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as WordSeverity)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s} — {severityAction(s)}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={createMutation.isPending || !newWord.trim()}
                className="flex items-center gap-2 bg-[#5EA3C0] hover:bg-[#4891b0] text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Rechercher un mot…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-gray-300"
                />
              </div>
              <select
                value={sevFilter}
                onChange={(e) => {
                  setSevFilter(e.target.value as 'all' | WordSeverity);
                  setPage(0);
                }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
              >
                <option value="all">Toutes sévérités</option>
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value as 'all' | 'active' | 'inactive');
                  setPage(0);
                }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
              >
                <option value="all">Tous</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
              <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Tableau */}
          {wordsLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-16">Aucun mot ne correspond.</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <th className="text-left px-6 py-3">Mot / expression</th>
                    <th className="text-left px-4 py-3 w-40">Sévérité</th>
                    <th className="text-left px-4 py-3 w-24">Actif</th>
                    <th className="px-4 py-3 w-16" />
                  </tr>
                </thead>
                <tbody>
                  {pageWords.map((w) => (
                    <tr
                      key={w.idForbiddenWord}
                      className={`border-b border-gray-50 hover:bg-gray-50/60 ${
                        !w.isActive ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-6 py-2.5 font-medium text-gray-800">{w.word}</td>
                      <td className="px-4 py-2.5">
                        <select
                          value={w.severity}
                          onChange={(e) =>
                            updateMutation.mutate({
                              id: w.idForbiddenWord,
                              data: { severity: e.target.value as WordSeverity },
                            })
                          }
                          className={`text-xs font-semibold px-2 py-1 rounded-lg border ${SEVERITY_STYLE[w.severity]}`}
                        >
                          {SEVERITIES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={w.isActive}
                            onChange={(e) =>
                              updateMutation.mutate({
                                id: w.idForbiddenWord,
                                data: { isActive: e.target.checked },
                              })
                            }
                          />
                        </label>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => removeMutation.mutate(w.idForbiddenWord)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pageCount > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 text-sm">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" /> Précédent
                  </button>
                  <span className="text-gray-500">
                    Page {page + 1} / {pageCount}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={page >= pageCount - 1}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Suivant <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ───────────── Onglet RÉCIDIVISTES ───────────── */}
      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-4">
            Utilisateurs ayant déclenché au moins un avertissement (mot interdit à la publication).
          </p>
          {usersLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : flaggedUsers.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">Aucun utilisateur signalé. 🎉</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {flaggedUsers.map((u) => {
                const open = expandedUser === u.idUser;
                return (
                  <div key={u.idUser} className="py-2.5">
                    <button
                      onClick={() => setExpandedUser(open ? null : u.idUser)}
                      className="w-full flex items-center gap-3 text-left"
                    >
                      {open ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{displayName(u)}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                        {u.warningCount} avert.
                      </span>
                    </button>
                    {open && (
                      <div className="mt-2 ml-7 space-y-1.5">
                        {userWarnings.length === 0 ? (
                          <p className="text-xs text-gray-400">Chargement…</p>
                        ) : (
                          userWarnings.map((warn) => (
                            <div
                              key={warn.idUserWarning}
                              className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 flex items-center justify-between gap-3"
                            >
                              <span className="truncate">{warn.reason}</span>
                              <span className="text-gray-400 whitespace-nowrap">
                                {new Date(warn.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ───────────── Onglet SIGNALEMENTS ───────────── */}
      {tab === 'reports' && (
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-4">
            Membres signalés par d'autres utilisateurs (en attente de traitement).
          </p>
          {reportsLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : userReports.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">Aucun signalement en attente. 🎉</p>
          ) : (
            <div className="space-y-2">
              {userReports.map((r) => (
                <div
                  key={r.idUserReport}
                  className="flex items-start gap-3 border border-gray-100 rounded-xl p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {displayName(r.reportedUser)}{' '}
                      <span className="text-xs font-normal text-gray-400">
                        signalé par {displayName(r.reporter)}
                      </span>
                    </p>
                    <p className="text-xs mt-0.5">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100 font-medium">
                        {reasonLabel[r.reason] ?? r.reason}
                      </span>
                      {r.details && <span className="text-gray-500 ml-2">{r.details}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() =>
                        resolveReportMutation.mutate({ id: r.idUserReport, action: 'resolved' })
                      }
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                      <Check className="w-3.5 h-3.5" /> Traiter
                    </button>
                    <button
                      onClick={() =>
                        resolveReportMutation.mutate({ id: r.idUserReport, action: 'rejected' })
                      }
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                    >
                      <X className="w-3.5 h-3.5" /> Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
