import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  ShieldAlert,
  Plus,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Flag,
  Check,
  X,
} from 'lucide-react';
import {
  forumModerationApi,
  type WordSeverity,
  type ForbiddenWord,
} from '../../../api/forum-moderation';
import { userReportApi } from '../../../api/user-report';

const SEVERITIES: WordSeverity[] = ['low', 'medium', 'high', 'critical'];

const SEVERITY_STYLE: Record<WordSeverity, string> = {
  low: 'bg-gray-100 text-gray-600 border-gray-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};

// low/medium → publié mais flaggé ; high/critical → bloqué.
const severityAction = (s: WordSeverity) =>
  s === 'high' || s === 'critical' ? 'Bloque' : 'Flague';

export default function AdminModeration() {
  const queryClient = useQueryClient();
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

  const resolveReportMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'resolved' | 'rejected' }) =>
      userReportApi.resolve(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reports'] });
      toast.success('Signalement traité');
    },
    onError: () => toast.error('Échec du traitement'),
  });

  const reasonLabel: Record<string, string> = {
    spam: 'Spam',
    harassment: 'Harcèlement',
    hate_speech: 'Propos haineux',
    impersonation: 'Usurpation',
    inappropriate: 'Inapproprié',
    other: 'Autre',
  };

  const displayName = (u?: { fullName?: string; firstName?: string; lastName?: string; email?: string }) =>
    u?.fullName || `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim() || u?.email || `#${''}`;

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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const word = newWord.trim();
    if (!word) return;
    createMutation.mutate({ word, severity: newSeverity });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-red-50 rounded-xl text-red-600">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modération Forum</h1>
          <p className="text-sm text-gray-500">
            Mots interdits (high/critical = bloqué, low/medium = publié mais flaggé)
            et utilisateurs récidivistes.
          </p>
        </div>
      </div>

      {/* ── Mots interdits ── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Mots interdits ({words.length})
        </h2>

        <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2 mb-5">
          <input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="mot ou expression…"
            className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400"
          />
          <select
            value={newSeverity}
            onChange={(e) => setNewSeverity(e.target.value as WordSeverity)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
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
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </form>

        {wordsLoading ? (
          <p className="text-sm text-gray-400 py-4">Chargement…</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {words.map((w) => (
              <div key={w.idForbiddenWord} className="flex items-center gap-3 py-2.5">
                <span className="flex-1 font-medium text-gray-800 truncate">{w.word}</span>

                <select
                  value={w.severity}
                  onChange={(e) =>
                    updateMutation.mutate({
                      id: w.idForbiddenWord,
                      data: { severity: e.target.value as WordSeverity },
                    })
                  }
                  className={`text-xs font-medium px-2 py-1 rounded-lg border ${SEVERITY_STYLE[w.severity]}`}
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
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
                  actif
                </label>

                <button
                  onClick={() => removeMutation.mutate(w.idForbiddenWord)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {words.length === 0 && (
              <p className="text-sm text-gray-400 py-4">Aucun mot interdit.</p>
            )}
          </div>
        )}
      </section>

      {/* ── Utilisateurs récidivistes ── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Utilisateurs à surveiller ({flaggedUsers.length})
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Utilisateurs ayant déclenché au moins un avertissement.
        </p>

        {usersLoading ? (
          <p className="text-sm text-gray-400 py-4">Chargement…</p>
        ) : flaggedUsers.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">Aucun utilisateur signalé. 🎉</p>
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
                      <p className="font-medium text-gray-800 truncate">
                        {u.fullName || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                      {u.warningCount} avert.
                    </span>
                  </button>

                  {open && (
                    <div className="mt-2 ml-7 space-y-1.5">
                      {userWarnings.length === 0 ? (
                        <p className="text-xs text-gray-400">Chargement des avertissements…</p>
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
      </section>

      {/* ── Signalements de comptes ── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Flag className="w-5 h-5 text-red-500" />
          Signalements de comptes ({userReports.length} en attente)
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Membres signalés par d'autres utilisateurs.
        </p>

        {reportsLoading ? (
          <p className="text-sm text-gray-400 py-4">Chargement…</p>
        ) : userReports.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">Aucun signalement en attente. 🎉</p>
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
                    title="Traité (action prise)"
                  >
                    <Check className="w-3.5 h-3.5" /> Traiter
                  </button>
                  <button
                    onClick={() =>
                      resolveReportMutation.mutate({ id: r.idUserReport, action: 'rejected' })
                    }
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                    title="Rejeter le signalement"
                  >
                    <X className="w-3.5 h-3.5" /> Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
