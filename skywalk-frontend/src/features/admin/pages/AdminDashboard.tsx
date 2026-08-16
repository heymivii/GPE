import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../api/admin';
import { userApi } from '../../../api/user';
import {
  Users, FolderKanban, MessageSquare, Globe,
  RefreshCw, TrendingUp, MapPin, Target,
  ArrowUpRight, Plane, Clock, Pin, Lock, Unlock, Trash, X,
  Search, Eye
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  useForumTopic,
  useLockTopic,
  usePinTopic,
  useModeratorDeleteTopic,
  useModeratorDeleteMessage,
  useCreateForumMessage,
} from '../../../hooks/useForum';

/* ─── Couleurs destinations ──────────────────────────────── */
const DEST_COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#14b8a6'];

/* ─── Couleurs types de voyage ───────────────────────────── */
const TRAVEL_COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#14b8a6', '#a855f7'];

/* ─── Mappage traduction français ────────────────────────── */
const OBJECTIVE_MAP: Record<string, string> = {
  work: 'Travail',
  study: 'Études',
  retirement: 'Retraite',
  adventure: 'Aventure',
  family_reunion: 'Regroupement familial',
  other: 'Autre',
};

const TRAVEL_TYPE_MAP: Record<string, string> = {
  alone: 'Seul',
  couple: 'En couple',
  family: 'En famille',
  friends: 'Entre amis',
  other: 'Autre',
};

const formatObjective = (val?: string) => {
  if (!val) return 'Projet sans titre';
  const key = val.trim().toLowerCase();
  return OBJECTIVE_MAP[key] || val;
};

const formatTravelType = (val?: string | null) => {
  if (!val) return '';
  const key = val.trim().toLowerCase();
  if (key === 'non défini') return 'Non défini';
  return TRAVEL_TYPE_MAP[key] || val;
};

/* ─── Sparkline ─────────────────────────────────────────── */
function Sparkline({ seed, color }: { seed: number; color: string }) {
  const pts = useMemo(() => {
    const raw = Array.from({ length: 8 }, (_, i) =>
      Math.max(2, (seed * (i + 1) * 37) % 40 + 10)
    );
    const max = Math.max(...raw);
    return raw.map((v, i) => `${i * (56 / 7)},${26 - (v / max) * 22}`).join(' ');
  }, [seed]);

  return (
    <svg viewBox="0 0 56 28" className="w-14 h-7">
      <defs>
        <linearGradient id={`sp${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,28 ${pts} 56,28`} fill={`url(#sp${seed})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Donut générique ────────────────────────────────────── */
function Donut({
  segments, total, colors,
}: {
  segments: { label: string; count: number }[];
  total: number;
  colors: string[];
}) {
  const R = 48; const C = 2 * Math.PI * R;
  let off = 0;
  const segs = segments.map((s, i) => {
    const dash = (s.count / (total || 1)) * C;
    const seg = { ...s, color: colors[i % colors.length], dash, off };
    off += dash;
    return seg;
  });

  return (
    <div className="flex items-center gap-5">
      {/* SVG */}
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
          <circle cx="55" cy="55" r={R} fill="none" stroke="#f1f5f9" strokeWidth="11" />
          {segs.map((s, i) => (
            <circle key={i} cx="55" cy="55" r={R} fill="none"
              stroke={s.color} strokeWidth="11"
              strokeDasharray={`${s.dash} ${C - s.dash}`}
              strokeDashoffset={-s.off}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-gray-900">{total}</span>
          <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Total</span>
        </div>
      </div>
      {/* Légende */}
      <div className="flex-1 space-y-2 min-w-0">
        {segs.map((s, i) => {
          const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-gray-600 flex-1 truncate">{s.label}</span>
              <span className="text-xs font-bold text-gray-900">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Badge statut projet ────────────────────────────────── */
const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  planning:  { label: 'Planification', cls: 'bg-amber-50  text-amber-700  border-amber-200' },
  active:    { label: 'Actif',         cls: 'bg-blue-50   text-blue-700   border-blue-200' },
  completed: { label: 'Complété',      cls: 'bg-green-50  text-green-700  border-green-200' },
  cancelled: { label: 'Annulé',        cls: 'bg-red-50    text-red-700    border-red-200' },
  on_hold:   { label: 'En pause',      cls: 'bg-gray-100  text-gray-600   border-gray-200' },
};
const statusBadge = (s: string) => STATUS_CFG[s.toLowerCase()] ?? { label: s, cls: 'bg-gray-100 text-gray-600 border-gray-200' };

/* ─── Composant principal ────────────────────────────────── */
export default function AdminDashboard() {
  const [activeTopicId, setActiveTopicId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [projectsPage, setProjectsPage] = useState(0);
  const PER_PAGE = 5;

  // Tabs state
  const [activeTab, setActiveTab] = useState<'stats' | 'history'>('stats');

  // History Tab State & Queries
  const [selectedAdminId, setSelectedAdminId] = useState<number | 'global' | null>(null);
  const [drawerSearch, setDrawerSearch] = useState('');
  
  const { data: logs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: adminApi.getLogs,
    enabled: activeTab === 'history',
  });

  const { data: allAdmins = [], isLoading: adminsLoading } = useQuery({
    queryKey: ['admin-collaborators'],
    queryFn: () => userApi.getUsersAdmin(1, 100).then(res => res.data.filter((u: any) => u.roles === 'admin')),
    enabled: activeTab === 'history',
  });

  const { data: stats, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
  });

  const handleRefresh = () => {
    if (activeTab === 'stats') refetch();
    else if (activeTab === 'history') {
      refetchLogs();
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5EA3C0]" />
    </div>
  );

  if (error || !stats) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <p className="text-gray-500">Impossible de charger les données.</p>
      <button onClick={() => refetch()} className="px-5 py-2 bg-[#5EA3C0] text-white rounded-lg text-sm font-semibold">Réessayer</button>
    </div>
  );

  const { counts, distribution, recentActivity } = stats;
  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'Admin';
  const currentUserId = user?.idUser || (user as any)?.id || (user as any)?.userId;

  /* KPI */
  const kpis = [
    { id: 'users',    label: 'Membres inscrits',  value: counts.users,    sub: `+${counts.newUsersThisWeek ?? 0} cette semaine`, icon: Users,        color: '#22c55e' },
    { id: 'projects', label: "Projets d'expat.",   value: counts.projects, sub: `${distribution.projects.find(p => p.status === 'active') ? parseInt(distribution.projects.find(p => p.status === 'active')!.count) : 0} actifs`, icon: FolderKanban, color: '#3b82f6' },
    { id: 'topics',   label: 'Sujets Forum',       value: counts.topics,   sub: `${counts.messages} messages au total`,          icon: MessageSquare, color: '#a855f7' },
    { id: 'countries',label: 'Pays disponibles',   value: counts.countries,sub: `${counts.cities} villes référencées`,           icon: Globe,         color: '#f59e0b' },
  ];

  /* Destinations */
  const destinations = (distribution.destinations ?? []).map(d => ({ label: d.country, count: parseInt(d.count, 10) }));
  const destTotal = destinations.reduce((s, d) => s + d.count, 0);

  /* Types de voyage */
  const travelTypes = (distribution.travelTypes ?? []).map(t => ({ label: formatTravelType(t.travelType), count: parseInt(t.count, 10) }));
  const travelTotal = travelTypes.reduce((s, t) => s + t.count, 0);

  /* Projets récents paginés */
  const recentProjects = recentActivity.projects ?? [];
  const pagedProjects = recentProjects.slice(projectsPage * PER_PAGE, (projectsPage + 1) * PER_PAGE);
  const totalPages = Math.ceil(recentProjects.length / PER_PAGE);

  /* Objectifs */
  const goals = [
    { label: 'Nouvelles inscriptions', current: counts.users,    target: Math.ceil(counts.users / 10) * 10 + 10,    color: '#22c55e' },
    { label: 'Projets créés',          current: counts.projects, target: Math.ceil(counts.projects / 10) * 10 + 5,  color: '#3b82f6' },
    { label: 'Engagement Forum',       current: counts.topics,   target: Math.ceil(counts.topics / 5) * 5 + 5,      color: '#a855f7' },
  ];


  // Filter logs for selected administrator
  const filteredLogs = logs.filter((log: any) => {
    if (selectedAdminId === null || selectedAdminId === 'global') return true;
    return log.userId === selectedAdminId;
  });

  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Bienvenue, <span className="font-medium text-gray-700">{firstName}</span>. Voici ce qui se passe.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefetching || logsLoading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 text-gray-600 text-sm transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching || logsLoading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      {/* ── Onglets Dashboard ── */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto pb-px">
        {[
          { id: 'stats', label: 'Statistiques', icon: TrendingUp },
          { id: 'history', label: 'Historique des modifications', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? 'border-[#5EA3C0] text-[#5EA3C0]'
                  : 'border-transparent text-gray-400 hover:text-gray-650 hover:border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── CONTENU : STATISTIQUES ── */}
      {activeTab === 'stats' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k) => {
              const Icon = k.icon;
              return (
                <div key={k.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{k.label}</p>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${k.color}18` }}>
                      <Icon className="w-4 h-4" style={{ color: k.color }} />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-gray-900 leading-none mb-1">{k.value.toLocaleString('fr-FR')}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" style={{ color: k.color }} />
                      {k.sub}
                    </p>
                    <Sparkline seed={k.value} color={k.color} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Table des projets récents */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Derniers projets créés</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Projets d'expatriation récemment soumis</p>
                </div>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                  {recentProjects.length} projets
                </span>
              </div>

              {pagedProjects.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-50">
                    {pagedProjects.map((project) => {
                      const authorName = project.user?.firstName
                        ? `${project.user.firstName} ${project.user.lastName || ''}`.trim()
                        : project.user?.email ?? 'Anonyme';
                      const initials = authorName.slice(0, 2).toUpperCase();
                      const hue = ((authorName.charCodeAt(0) ?? 65) * 137) % 360;
                      const badge = statusBadge(project.status);

                      return (
                        <div key={project.idProject} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: `hsl(${hue}, 50%, 45%)` }}
                          >
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {formatObjective(project.objective)}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-400">{authorName}</span>
                              {project.destinationCountry && (
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {project.destinationCountry.countryName}
                                </span>
                              )}
                              {project.travelType && (
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                                  <Plane className="w-2.5 h-2.5" />
                                  {formatTravelType(project.travelType)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.cls}`}>
                              {badge.label}
                            </span>
                            {project.expectedDepartureDate && (
                              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Clock className="w-2.5 h-2.5" />
                                {new Date(project.expectedDepartureDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-50 bg-gray-50/50">
                      <span className="text-xs text-gray-400">
                        Page {projectsPage + 1} / {totalPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setProjectsPage(p => Math.max(0, p - 1))}
                          disabled={projectsPage === 0}
                          className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
                        >
                          ← Préc.
                        </button>
                        <button
                          onClick={() => setProjectsPage(p => Math.min(totalPages - 1, p + 1))}
                          disabled={projectsPage >= totalPages - 1}
                          className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
                        >
                          Suiv. →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-300">
                  <FolderKanban className="w-8 h-8" />
                  <p className="text-sm">Aucun projet pour l'instant</p>
                </div>
              )}
            </div>

            {/* Colonne droite */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900">Destinations souhaitées</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">Pays cibles des projets</p>
                {destinations.length > 0
                  ? <Donut segments={destinations} total={destTotal} colors={DEST_COLORS} />
                  : <p className="text-xs text-gray-300 text-center py-4">Aucune donnée</p>
                }
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Plane className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900">Types de voyage</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">Répartition par motif d'expatriation</p>
                {travelTypes.length > 0
                  ? <Donut segments={travelTypes} total={travelTotal} colors={TRAVEL_COLORS} />
                  : <p className="text-xs text-gray-300 text-center py-4">Aucune donnée</p>
                }
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900">Objectifs</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">Progression trimestrielle</p>
                <div className="space-y-4">
                  {goals.map((g) => {
                    const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                    return (
                      <div key={g.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-semibold text-gray-700">{g.label}</span>
                          <span className="text-gray-400">{g.current}/{g.target}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Activité Forum */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Activité Forum</h2>
                <p className="text-xs text-gray-400 mt-0.5">Derniers sujets publiés sur la communauté</p>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>
            {recentActivity.topics.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {recentActivity.topics.map((topic) => {
                  const name = topic.user?.firstName
                    ? `${topic.user.firstName} ${topic.user.lastName || ''}`.trim()
                    : topic.user?.email ?? 'Anonyme';
                  const initials = name.slice(0, 2).toUpperCase();
                  const hue = ((name.charCodeAt(0) ?? 65) * 137) % 360;
                  return (
                    <button
                      key={topic.idForumTopic}
                      onClick={() => setActiveTopicId(topic.idForumTopic)}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors group cursor-pointer w-full text-left"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: `hsl(${hue}, 50%, 45%)` }}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#5EA3C0] transition-colors">{topic.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{name}</p>
                      </div>
                      {topic.country && (
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:block">
                          {topic.country.countryName}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(topic.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-300">
                <TrendingUp className="w-8 h-8" />
                <p className="text-sm">Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CONTENU : HISTORIQUE DES CHANGEMENTS ── */}
      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Historique d'activité des Administrateurs</h2>
              <p className="text-xs text-gray-400">Consultez les actions et modifications effectuées par chaque administrateur sur les données du site.</p>
            </div>
            
            {/* Global History Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedAdminId('global');
                setDrawerSearch('');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              Voir l'historique global
            </button>
          </div>

          {/* Quick Last Modified Summary Widget */}
          {logs.length > 0 && (
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#5EA3C0]/10 flex items-center justify-center text-[#5EA3C0]">
                  <RefreshCw className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Dernière modification sur le site</span>
                  <p className="text-xs text-gray-750 font-medium mt-0.5">
                    {logs[0].user ? (
                      <span className="font-semibold text-gray-900">
                        {`${logs[0].user.firstName || ''} ${logs[0].user.lastName || ''}`.trim() || logs[0].user.email}
                      </span>
                    ) : (
                      <span className="font-semibold text-gray-900">Admin (ID {logs[0].userId})</span>
                    )}{' '}
                    a effectué un{' '}
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${
                      logs[0].action === 'CREATE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      logs[0].action === 'UPDATE' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {logs[0].action}
                    </span>{' '}
                    sur{' '}
                    <span className="font-semibold text-slate-800">
                      {logs[0].entityType === 'Country' ? 'un Pays' :
                       logs[0].entityType === 'City' ? 'une Ville' :
                       logs[0].entityType === 'CostOfLiving' ? 'un Coût de la vie' :
                       logs[0].entityType === 'AdminProcedure' ? 'une Démarche' :
                       logs[0].entityType === 'Resource' ? 'une Ressource' :
                       logs[0].entityType === 'User' ? 'un Rôle Utilisateur' : logs[0].entityType}
                    </span>{' '}
                    ({logs[0].details || `ID: ${logs[0].entityId}`})
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-gray-450 whitespace-nowrap bg-white px-2 py-1 border border-slate-100 rounded-lg">
                {new Date(logs[0].createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          {adminsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EA3C0]" />
              <p className="text-xs text-gray-400">Chargement de la liste des administrateurs...</p>
            </div>
          ) : allAdmins.length === 0 ? (
            <p className="text-center py-12 text-gray-400 text-sm italic">Aucun administrateur trouvé.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Administrateur</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Dernière connexion</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                  {allAdmins.map((admin: any) => {
                    const fullName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'Sans nom';
                    const initials = fullName.slice(0, 2).toUpperCase();
                    const isSelf = admin.idUser === currentUserId;

                    return (
                      <tr key={admin.idUser} className="hover:bg-gray-50/45 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#5EA3C0]/10 text-[#5EA3C0] text-[10px] font-bold flex items-center justify-center">
                              {initials}
                            </div>
                            <span>
                              {fullName}
                              {isSelf && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-slate-900 text-white font-extrabold">
                                  Vous
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">{admin.email}</td>
                        <td className="py-3 px-4 text-gray-500">
                          {admin.lastLoginAt ? (
                            new Date(admin.lastLoginAt).toLocaleString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          ) : (
                            <span className="text-gray-350 italic">Jamais connecté</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAdminId(admin.idUser);
                              setDrawerSearch('');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5EA3C0]/10 hover:bg-[#5EA3C0]/20 text-[#5EA3C0] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Voir les modifications
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
      )}

      {/* ── Slide-over Activity Drawer ── */}
      {selectedAdminId !== null && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop overlay */}
            <div 
              className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300 ease-in-out" 
              onClick={() => setSelectedAdminId(null)}
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-lg transform bg-white shadow-2xl flex flex-col border-l border-gray-150 animate-in slide-in-from-right duration-350 ease-out">
                {/* Header */}
                <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="min-w-0">
                    <h2 className="text-base font-bold leading-6 truncate" id="slide-over-title">
                      {selectedAdminId === 'global' ? (
                        "Historique global des modifications"
                      ) : (
                        `Activité de ${
                          allAdmins.find((a: any) => a.idUser === selectedAdminId)?.firstName ||
                          allAdmins.find((a: any) => a.idUser === selectedAdminId)?.email ||
                          'l\'administrateur'
                        }`
                      )}
                    </h2>
                    <p className="text-[11px] text-slate-350 truncate mt-0.5">
                      {selectedAdminId === 'global' ? (
                        "Suivi en temps réel de toutes les actions sur la plateforme"
                      ) : (
                        allAdmins.find((a: any) => a.idUser === selectedAdminId)?.email || ""
                      )}
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSelectedAdminId(null)}
                    className="rounded-lg p-1 text-slate-350 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sub-Header: Details of Connection */}
                {selectedAdminId !== 'global' && (
                  <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex justify-between text-[11px] text-gray-500">
                    <span>
                      Dernière connexion :{' '}
                      <span className="font-semibold text-gray-755">
                        {(() => {
                          const admin = allAdmins.find((a: any) => a.idUser === selectedAdminId);
                          return admin?.lastLoginAt 
                            ? new Date(admin.lastLoginAt).toLocaleString('fr-FR')
                            : 'Jamais';
                        })()}
                      </span>
                    </span>
                    <span>
                      Total :{' '}
                      <span className="font-semibold text-gray-755">
                        {filteredLogs.length} action{filteredLogs.length > 1 ? 's' : ''}
                      </span>
                    </span>
                  </div>
                )}

                {/* Search Bar in Drawer */}
                <div className="relative px-6 py-3 border-b border-gray-100">
                  <Search className="absolute left-9 top-5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filtrer par entité, action, ou mot-clé..."
                    value={drawerSearch}
                    onChange={(e) => setDrawerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-250 bg-gray-50/50 rounded-xl text-xs focus:outline-none focus:border-[#5EA3C0]"
                  />
                </div>

                {/* Body: Timeline of changes */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {(() => {
                    const drawerFilteredLogs = filteredLogs.filter((log: any) => {
                      if (!drawerSearch.trim()) return true;
                      const q = drawerSearch.toLowerCase();
                      const ENTITY_TRANSLATIONS: Record<string, string> = {
                        Country: 'Pays',
                        City: 'Ville',
                        CostOfLiving: 'Coût de la vie',
                        AdminProcedure: 'Démarche',
                        Resource: 'Ressource',
                        User: 'Utilisateur',
                      };
                      const translatedEntity = ENTITY_TRANSLATIONS[log.entityType] || log.entityType;
                      return (
                        translatedEntity.toLowerCase().includes(q) ||
                        log.action.toLowerCase().includes(q) ||
                        (log.details || '').toLowerCase().includes(q) ||
                        (log.user ? `${log.user.firstName || ''} ${log.user.lastName || ''} ${log.user.email}`.toLowerCase() : '').includes(q)
                      );
                    });

                    if (drawerFilteredLogs.length === 0) {
                      return (
                        <div className="text-center py-12 text-gray-400 flex flex-col items-center justify-center gap-2">
                          <Clock className="w-8 h-8 text-gray-350" />
                          <p className="text-xs font-semibold">Aucune modification correspondante</p>
                          <p className="text-[10px] text-gray-400">Essayez d'ajuster votre filtre ou recherche.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="relative border-l border-slate-100 ml-4 pl-6 space-y-5">
                        {drawerFilteredLogs.map((log: any) => {
                          const logDate = new Date(log.createdAt).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          });

                          let actionColor = 'bg-slate-100 text-slate-700 border-slate-200';
                          if (log.action === 'CREATE') actionColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          if (log.action === 'UPDATE') actionColor = 'bg-amber-50 text-amber-700 border-amber-100';
                          if (log.action === 'DELETE') actionColor = 'bg-rose-50 text-rose-700 border-rose-100';

                          const ENTITY_TRANSLATIONS: Record<string, string> = {
                            Country: 'Pays',
                            City: 'Ville',
                            CostOfLiving: 'Coût de la vie',
                            AdminProcedure: 'Démarche',
                            Resource: 'Ressource',
                            User: 'Utilisateur',
                          };
                          const translatedEntity = ENTITY_TRANSLATIONS[log.entityType] || log.entityType;

                          return (
                            <div key={log.idAdminLog} className="relative">
                              {/* Timeline indicator point */}
                              <span className="absolute -left-[31px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white border-2 border-slate-200">
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  log.action === 'CREATE' ? 'bg-emerald-500' :
                                  log.action === 'UPDATE' ? 'bg-amber-500' :
                                  'bg-rose-500'
                                }`} />
                              </span>

                              <div className="p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors space-y-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${actionColor}`}>
                                    {log.action}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                    {translatedEntity}
                                  </span>
                                  <span className="text-[10px] text-gray-400 ml-auto">{logDate}</span>
                                </div>

                                <p className="text-xs text-gray-850 font-medium leading-normal whitespace-pre-line">
                                  {log.details || `Modification de ${translatedEntity} (ID: ${log.entityId})`}
                                </p>

                                {selectedAdminId === 'global' && (
                                  <p className="text-[9px] text-gray-450 border-t border-slate-50 pt-1.5 mt-1">
                                    Effectué par :{' '}
                                    <span className="font-semibold text-gray-600">
                                      {log.user ? (
                                        `${log.user.firstName || ''} ${log.user.lastName || ''} (${log.user.email})`
                                      ) : (
                                        `Utilisateur ID ${log.userId}`
                                      )}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-slate-50 flex items-center justify-end flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedAdminId(null)}
                    className="px-4 py-2 border border-gray-250 hover:bg-gray-100 text-gray-650 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Topics moderation modal */}
      {activeTopicId !== null && (
        <TopicModerationModal
          topicId={activeTopicId}
          onClose={() => setActiveTopicId(null)}
          queryClient={queryClient}
        />
      )}
    </div>
  );
}

interface TopicModerationModalProps {
  topicId: number;
  onClose: () => void;
  queryClient: any;
}

function TopicModerationModal({ topicId, onClose, queryClient }: TopicModerationModalProps) {
  const { user } = useAuth();
  const { data: topic, isLoading, error } = useForumTopic(topicId);
  const [replyText, setReplyText] = useState('');

  const lockMutation = useLockTopic();
  const pinMutation = usePinTopic();
  const deleteTopicMutation = useModeratorDeleteTopic();
  const deleteMessageMutation = useModeratorDeleteMessage();
  const createMessageMutation = useCreateForumMessage();

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Le contenu du message ne peut pas être vide.');
      return;
    }
    const userId = user?.idUser || (user as any)?.id;
    if (!userId) {
      toast.error('Utilisateur non connecté ou ID manquant.');
      return;
    }

    createMessageMutation.mutate({
      content: replyText.trim(),
      topicId,
    }, {
      onSuccess: () => {
        setReplyText('');
        toast.success('Réponse publiée.');
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      },
      onError: (err: any) => {
        console.error('Error replying:', err);
        const errMsg = err?.response?.data?.message || 'Erreur lors de la publication de la réponse.';
        toast.error(errMsg);
      }
    });
  };

  const handleLock = () => {
    lockMutation.mutate(topicId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        toast.success(topic?.is_locked ? 'Sujet déverrouillé.' : 'Sujet verrouillé.');
      },
    });
  };

  const handlePin = () => {
    pinMutation.mutate(topicId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        toast.success(topic?.is_pinned ? 'Sujet désépinglé.' : 'Sujet épinglé.');
      },
    });
  };

  const handleDeleteTopic = () => {
    if (window.confirm('Voulez-vous vraiment supprimer ce sujet et tous ses messages ?')) {
      deleteTopicMutation.mutate(topicId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          toast.success('Sujet supprimé avec succès.');
          onClose();
        },
      });
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce message ?')) {
      deleteMessageMutation.mutate(
        { id: messageId, topicId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            toast.success('Message supprimé.');
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center max-w-lg w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EA3C0] mb-2" />
          <p className="text-sm text-gray-500">Chargement du sujet...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center max-w-lg w-full gap-3">
          <p className="text-gray-500">Erreur lors du chargement du sujet.</p>
          <button onClick={onClose} className="px-4 py-2 bg-[#5EA3C0] text-white rounded-lg text-sm">Fermer</button>
        </div>
      </div>
    );
  }

  const authorName = topic.user?.fullName || 'Anonyme';

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-100 shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold tracking-wide truncate">Modération du Sujet</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {topic.is_pinned && (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">
                  Épinglé
                </span>
              )}
              {topic.is_locked && (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">
                  Verrouillé
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Topic Detail */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-gray-900 text-lg leading-snug">{topic.title}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Publié par <span className="font-semibold text-gray-700">{authorName}</span> le {new Date(topic.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {topic.category && (
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {topic.category}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{topic.content}</p>
          </div>

          {/* Action Panel */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-150">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Actions Sujet :</span>
            <button
              onClick={handlePin}
              disabled={pinMutation.isPending}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                topic.is_pinned
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              {topic.is_pinned ? 'Désépingler' : 'Épingler'}
            </button>
            <button
              onClick={handleLock}
              disabled={lockMutation.isPending}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                topic.is_locked
                  ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {topic.is_locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {topic.is_locked ? 'Déverrouiller' : 'Verrouiller'}
            </button>
            <button
              onClick={handleDeleteTopic}
              disabled={deleteTopicMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all ml-auto"
            >
              <Trash className="w-3.5 h-3.5" />
              Supprimer le sujet
            </button>
          </div>

          {/* Reply Form */}
          <form onSubmit={handlePostReply} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <label htmlFor="reply-input" className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Répondre au sujet
              </label>
              {topic.is_locked && (
                <span className="text-[10px] bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Sujet verrouillé (Accès Admin)
                </span>
              )}
            </div>
            <textarea
              id="reply-input"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Saisissez votre réponse en tant qu'administrateur..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#5EA3C0] focus:border-[#5EA3C0] bg-white resize-none"
              disabled={createMessageMutation.isPending}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createMessageMutation.isPending || !replyText.trim()}
                className="px-4 py-2 bg-[#5EA3C0] hover:bg-[#4d8ca7] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {createMessageMutation.isPending ? 'Envoi...' : 'Répondre'}
              </button>
            </div>
          </form>

          {/* Messages list */}
          <div className="space-y-4">
            <h5 className="font-bold text-gray-900 border-b border-gray-100 pb-2">
              Messages ({topic.messages?.length || 0})
            </h5>
            {topic.messages && topic.messages.length > 0 ? (
              <div className="space-y-3.5">
                 {topic.messages.map((msg) => {
                  const isAdmin = msg.user?.roles === 'admin' || msg.user?.email === 'admin@skywalk.com';
                  const msgAuthor = isAdmin ? 'Administrateur' : (msg.user?.fullName || 'Anonyme');
                  return (
                    <div key={msg.message_id} className="p-4 bg-white border border-gray-100 rounded-xl space-y-2 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isAdmin ? 'text-[#5EA3C0] bg-[#5EA3C0]/10 px-2 py-0.5 rounded-full border border-[#5EA3C0]/20' : 'text-gray-800'}`}>
                          {msgAuthor}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">
                            {new Date(msg.sent_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            onClick={() => handleDeleteMessage(msg.message_id)}
                            disabled={deleteMessageMutation.isPending}
                            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-650 rounded transition-colors"
                            title="Supprimer le message"
                          >
                            <Trash className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-650 leading-relaxed whitespace-pre-line">{msg.content}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-400 text-xs italic">Aucun message dans ce sujet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
