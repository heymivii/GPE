import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Circle, ChevronDown, ChevronRight, ExternalLink, ArrowLeft, ArrowRight, List, Calendar } from 'lucide-react';
import { useProject } from '../hooks/useProjectMutations';
import { useChecklistProgress, getStepDeadline, filterStepsForProject } from '../../dashboard/hooks/useChecklistProgress';
import { getLinksForStep } from '../../../data/checklist-links';

// ---- Types ----
type FilterType = 'all' | 'todo' | 'urgent' | 'late' | 'completed';
type ViewType = 'list' | 'timeline';

// ---- Composants utilitaires ----

function DeadlineBadge({ daysBeforeDeparture, departureDate }: {
  daysBeforeDeparture?: number;
  departureDate?: string | Date | null;
}) {
  const deadline = getStepDeadline(daysBeforeDeparture, departureDate);
  if (!deadline.date) return null;

  if (deadline.isLate) return (
    <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
      🔴 En retard
    </span>
  );
  if (deadline.isUrgent) return (
    <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
      🟠 {deadline.daysLeft}j restants
    </span>
  );
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      📅 {deadline.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
    </span>
  );
}

function StepLinks({ category, countryCode }: { category: string; countryCode?: string }) {
  const links = getLinksForStep(category, countryCode);
  if (!links) return null;
  const hasLinks = links.serviceLink || (links.externalLinks && links.externalLinks.length > 0);
  if (!hasLinks) return null;

  return (
    <div className="flex items-center gap-3 mt-2 flex-wrap">
      {links.serviceLink && (
        <Link
          to={links.serviceLink}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
        >
          Voir le service <ArrowRight className="w-3 h-3" />
        </Link>
      )}
      {links.externalLinks?.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
        >
          {link.label} <ExternalLink className="w-3 h-3" />
        </a>
      ))}
    </div>
  );
}

// ---- Page principale ----

export default function ChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || '0', 10);

  const { data: project } = useProject(projectId);
  const { progress, updateStep, isLoading } = useChecklistProgress(projectId);
  // countryCode récupéré directement depuis la relation chargée

  const [filter, setFilter] = useState<FilterType>('all');
  const [view, setView] = useState<ViewType>('list');
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const countryCode = project?.destinationCountry?.isoCode;
  const departureDate = project?.expectedDepartureDate;

  // Construire la liste depuis progress
  const allSteps = useMemo(() => {
    if (!progress || !Array.isArray(progress)) return [];
    return progress.map((t) => ({
      id: t.idProcedureTracking.toString(),
      title: t.admin_procedure?.procedureType || '',
      completed: t.status === 'completed',
      category: t.admin_procedure?.category || 'other',
      substeps: [] as any[],
      daysBeforeDeparture: t.admin_procedure?.daysBeforeDeparture,
      onlyFor: t.admin_procedure?.onlyFor ?? null,
    }));
  }, [progress]);

  // Filtrage profil
  const profileSteps = useMemo(() => filterStepsForProject(allSteps, {
    travelType: project?.travelType ?? undefined,
    objective: project?.mainObjective ?? undefined,
  }), [allSteps, project]);

  // Filtrage UI + recherche
  const filteredSteps = useMemo(() => {
    return profileSteps
      .filter((step) => {
        const deadline = getStepDeadline(step.daysBeforeDeparture, departureDate);
        if (filter === 'todo') return !step.completed;
        if (filter === 'urgent') return !step.completed && deadline.isUrgent;
        if (filter === 'late') return !step.completed && deadline.isLate;
        if (filter === 'completed') return step.completed;
        return true;
      })
      .filter((step) =>
        search === '' || step.title.toLowerCase().includes(search.toLowerCase())
      );
  }, [profileSteps, filter, search, departureDate]);

  // Tri timeline : par deadline croissante
  const timelineSteps = useMemo(() => {
    return [...filteredSteps].sort((a, b) => {
      const da = getStepDeadline(a.daysBeforeDeparture, departureDate);
      const db = getStepDeadline(b.daysBeforeDeparture, departureDate);
      if (!da.date && !db.date) return 0;
      if (!da.date) return 1;
      if (!db.date) return -1;
      return da.date.getTime() - db.date.getTime();
    });
  }, [filteredSteps, departureDate]);

  // Stats
  const { totalSteps, completedSteps, lateSteps, urgentSteps } = useMemo(() => {
    const total = profileSteps.length;
    const completed = profileSteps.filter((s) => s.completed).length;
    const late = profileSteps.filter((s) => {
      const d = getStepDeadline(s.daysBeforeDeparture, departureDate);
      return !s.completed && d.isLate;
    }).length;
    const urgent = profileSteps.filter((s) => {
      const d = getStepDeadline(s.daysBeforeDeparture, departureDate);
      return !s.completed && d.isUrgent;
    }).length;
    return { totalSteps: total, completedSteps: completed, lateSteps: late, urgentSteps: urgent };
  }, [profileSteps, departureDate]);

  const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Jours avant le départ
  const daysUntilDeparture = useMemo(() => {
    if (!departureDate) return null;
    const diff = Math.ceil((new Date(departureDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [departureDate]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleItem = async (id: string) => {
    const item = profileSteps.find((i) => i.id === id);
    if (!item) return;
    await updateStep({
      trackingId: parseInt(id, 10),
      status: item.completed ? 'not_started' : 'completed',
    });
  };

  const displaySteps = view === 'timeline' ? timelineSteps : filteredSteps;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            to={`/projects/${projectId}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Retour au projet
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Ma checklist d'expatriation
          </h1>

          {departureDate && (
            <p className="text-sm text-gray-500">
              Départ le {new Date(departureDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              {daysUntilDeparture !== null && (
                <span className={`ml-2 font-medium ${daysUntilDeparture < 30 ? 'text-orange-600' : 'text-gray-700'}`}>
                  ({daysUntilDeparture > 0 ? `${daysUntilDeparture}j restants` : 'Date passée'})
                </span>
              )}
            </p>
          )}

          {/* Barre de progression */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-gray-600">
                {completedSteps} / {totalSteps} étapes complétées
              </span>
              <span className="text-sm font-bold text-gray-900">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-gray-900 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Résumé stats */}
          <div className="flex items-center gap-4 mt-4">
            {lateSteps > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                🔴 {lateSteps} en retard
              </span>
            )}
            {urgentSteps > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
                🟠 {urgentSteps} urgent{urgentSteps > 1 ? 's' : ''}
              </span>
            )}
            {lateSteps === 0 && urgentSteps === 0 && completedSteps < totalSteps && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                ✅ Tout est dans les temps
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filtres + vue */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Filtres */}
          <div className="flex items-center gap-2 flex-wrap">
            {([
              { key: 'all', label: 'Tout' },
              { key: 'todo', label: 'À faire' },
              { key: 'urgent', label: '🟠 Urgent' },
              { key: 'late', label: '🔴 En retard' },
              { key: 'completed', label: '✅ Complété' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  filter === key
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Vue liste / timeline */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Vue liste"
            >
              <List className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setView('timeline')}
              className={`p-1.5 rounded-md transition-colors ${view === 'timeline' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Vue timeline"
            >
              <Calendar className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Recherche */}
        <input
          type="text"
          placeholder="Rechercher une étape..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-3 w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Liste des étapes */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        {displaySteps.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">Aucune étape ne correspond à ce filtre.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displaySteps.map((item) => {
              const isExpanded = expandedIds.has(item.id);
              const deadline = getStepDeadline(item.daysBeforeDeparture, departureDate);

              return (
                <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div
                    className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                      item.completed ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <button className="mt-0.5 flex-shrink-0">
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5 text-gray-900" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        item.completed ? 'text-gray-400 line-through' : 'text-gray-900'
                      }`}>
                        {item.title}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                          {item.category}
                        </span>
                        {!item.completed && (
                          <DeadlineBadge
                            daysBeforeDeparture={item.daysBeforeDeparture}
                            departureDate={departureDate}
                          />
                        )}
                      </div>

                      {!item.completed && (
                        <StepLinks category={item.category} countryCode={countryCode} />
                      )}
                    </div>

                    {item.substeps && item.substeps.length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}
                        className="flex-shrink-0 p-1 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        {isExpanded
                          ? <ChevronDown className="w-4 h-4 text-gray-400" />
                          : <ChevronRight className="w-4 h-4 text-gray-400" />
                        }
                      </button>
                    )}
                  </div>

                  {isExpanded && item.substeps && item.substeps.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2 space-y-1">
                      {item.substeps.map((substep: any) => (
                        <div
                          key={substep.id}
                          className={`flex items-start gap-2.5 px-2 py-2 rounded-md ${
                            substep.completed ? 'bg-gray-100/60' : 'hover:bg-gray-100'
                          }`}
                        >
                          {substep.completed
                            ? <CheckCircle className="w-3.5 h-3.5 text-gray-900 flex-shrink-0 mt-0.5" />
                            : <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
                          }
                          <span className={`text-xs ${substep.completed ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                            {substep.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}