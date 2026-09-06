import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Circle, ChevronDown, ChevronRight, ExternalLink, ArrowLeft, ArrowRight, List, Calendar, AlertCircle, AlertTriangle, Plane, Home, Lightbulb } from 'lucide-react';
// DOCUMENTS DÉSACTIVÉS : Paperclip et DocumentsVault ne servaient qu'au panneau par étape.
// import DocumentsVault from '../../documents/DocumentsVault';
import { useProject } from '../hooks/useProjectMutations';
// PRICING DÉSACTIVÉ : useUnlockProject servait la modale de paiement (mock).
// import { useUnlockProject } from '../hooks/useProjectMutations';
import { useChecklistProgress, getStepDeadline, filterStepsForProject } from '../../dashboard/hooks/useChecklistProgress';
import { getLinksForStep } from '../../../data/checklist-links';
import BuddySidebarCard from '../components/BuddySidebarCard';
import { useGovLink } from '../../../api/useGovLink';
import OfficialLinkCard from '../../../components/OfficialLinkCard';
import TrustBadge from '../../../components/TrustBadge';
import VisaNotice from '../../../components/VisaNotice';
import SubstepLinks from '../../../components/SubstepLinks';
import { extractLinks, type ExtractedLink } from '../../../lib/formatters';
import { personalizeFilter, sortByPriorities } from '../../dashboard/hooks/personalize';

// ---- Types ----
type FilterType = 'all' | 'todo' | 'urgent' | 'late' | 'completed';
type ViewType = 'list' | 'timeline';
type Phase = 'before' | 'on_arrival';

// ---- Composants utilitaires ----

// « ton objectif, ta nationalité et ta situation familiale » — liste FR naturelle.
function formatList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;
}

function DeadlineBadge({ daysBeforeDeparture, departureDate, phase }: {
  daysBeforeDeparture?: number;
  departureDate?: string | Date | null;
  phase?: Phase;
}) {
  // On-arrival steps have no pre-departure deadline
  if (phase === 'on_arrival') return null;
  const deadline = getStepDeadline(daysBeforeDeparture, departureDate);
  if (!deadline.date) return null;

  const dateStr = deadline.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  if (deadline.isLate) return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
      <AlertCircle className="w-3 h-3" /> En retard — deadline : {dateStr}
    </span>
  );
  if (deadline.isUrgent) return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
      <AlertTriangle className="w-3 h-3" /> {deadline.daysLeft}j restants — deadline : {dateStr}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      <Calendar className="w-3 h-3" /> deadline : {dateStr}
    </span>
  );
}

function StepLinks({ category, countryCode }: { category: string; countryCode?: string }) {
  const { link: govLink } = useGovLink(countryCode, category);
  const links = getLinksForStep(category, countryCode);
  const hasLinks = links && (links.serviceLink || (links.externalLinks && links.externalLinks.length > 0));
  if (!govLink && !hasLinks) return null;

  return (
    <div className="flex flex-col gap-2 mt-2">
      {govLink && (
        <OfficialLinkCard
          label={govLink.label}
          url={govLink.url}
          verifiedAt={govLink.verifiedAt}
          summary={govLink.summary}
        />
      )}
      {hasLinks && (
        <div className="flex items-center gap-3 flex-wrap">
          {links!.serviceLink && (
            <Link
              to={links!.serviceLink}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-brand-ink hover:text-brand-ink-hover hover:underline flex items-center gap-1"
            >
              Voir le service <ArrowRight className="w-3 h-3" />
            </Link>
          )}
          {links!.externalLinks?.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-gray-500 hover:text-gray-600 flex items-center gap-1"
            >
              {link.label} <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Composant ligne de checklist (factorisé pour les deux sections) ----

interface ChecklistItemData {
  id: string;
  trackingId: number;
  adminProcedureId: number;
  title: string;
  completed: boolean;
  completedAt: string | null;
  category: string;
  status: string;
  substeps: { id: string; label: string; completed: boolean; links: ExtractedLink[] }[];
  completedFacts: number[];
  daysBeforeDeparture?: number;
  phase: Phase;
  onlyFor?: { travelType?: string[]; objective?: string[] } | null;
  sourceUrl?: string;
  keyFacts: string[];
}

function ChecklistItemRow({
  item,
  isExpanded,
  departureDate,
  countryCode,
  onToggleExpand,
  onToggleItem,
  onToggleSubstep,
}: {
  item: ChecklistItemData;
  isExpanded: boolean;
  departureDate?: string | Date | null;
  countryCode?: string;
  onToggleExpand: (id: string) => void;
  onToggleItem: (id: string) => void;
  onToggleSubstep: (itemId: string, substepId: string, e: React.MouseEvent) => void;
}) {
  const substepsTotal = item.substeps.length;
  const substepsDone = item.substeps.filter((s) => s.completed).length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div
        className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
          item.completed ? 'bg-gray-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => substepsTotal > 0 ? onToggleExpand(item.id) : onToggleItem(item.id)}
      >
        <button
          className="mt-0.5 flex-shrink-0"
          aria-pressed={item.completed}
          aria-label={`${item.completed ? 'Marquer comme à faire' : 'Marquer comme terminée'} : ${item.title}`}
          onClick={(e) => { e.stopPropagation(); onToggleItem(item.id); }}
        >
          {item.completed ? (
            <CheckCircle className="w-5 h-5 text-gray-900" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${
            item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
          }`}>
            {item.title}
          </p>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
              {item.category}
            </span>
            {item.sourceUrl && <TrustBadge url={item.sourceUrl} />}
            {substepsTotal > 0 && (
              <span className="text-[11px] text-gray-500">
                {substepsDone}/{substepsTotal} tâches
              </span>
            )}
            {!item.completed && (
              <>
                <DeadlineBadge
                  daysBeforeDeparture={item.daysBeforeDeparture}
                  departureDate={departureDate}
                  phase={item.phase}
                />
                {item.phase === 'on_arrival' && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    À faire sur place
                  </span>
                )}
              </>
            )}
            {item.completed && item.completedAt && (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle className="w-3 h-3" /> Complété le {new Date(item.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>

          {!item.completed && substepsTotal === 0 && (
            <>
              {(item.sourceUrl || item.keyFacts.length > 0) ? null : (
                <StepLinks category={item.category} countryCode={countryCode} />
              )}
            </>
          )}

          {!item.completed && substepsTotal === 0 && item.sourceUrl && (
            <div className="mt-2">
              <OfficialLinkCard
                label={item.title || 'Source officielle'}
                url={item.sourceUrl || '#'}
                summary={item.keyFacts}
              />
            </div>
          )}

        </div>

        {substepsTotal > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand(item.id); }}
            className="flex-shrink-0 p-1 rounded-md hover:bg-gray-200 transition-colors"
            aria-expanded={isExpanded}
            aria-label="Afficher les sous-étapes"
          >
            {isExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-400" />
              : <ChevronRight className="w-4 h-4 text-gray-400" />
            }
          </button>
        )}
      </div>

      {isExpanded && substepsTotal > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2 space-y-1">
          {item.substeps.map((substep) => (
            <div
              key={substep.id}
              onClick={(e) => onToggleSubstep(item.id, substep.id, e)}
              className={`flex items-start gap-2.5 px-2 py-2 rounded-md cursor-pointer transition-colors ${
                substep.completed ? 'bg-gray-100/60' : 'hover:bg-gray-100'
              }`}
            >
              {substep.completed
                ? <CheckCircle className="w-3.5 h-3.5 text-gray-900 flex-shrink-0 mt-0.5" />
                : <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-x-3 gap-y-1">
                <span className={`text-xs ${substep.completed ? 'text-gray-500 line-through' : 'text-gray-600'}`}>
                  {substep.label}
                </span>
                <SubstepLinks links={substep.links} />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// ---- Page principale ----

export default function ChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || '0', 10);

  const { data: project } = useProject(projectId);
  const { progress, updateStep, updateFacts, isLoading } = useChecklistProgress(projectId);
  // countryCode récupéré directement depuis la relation chargée

  const [filter, setFilter] = useState<FilterType>('all');
  const [view, setView] = useState<ViewType>('list');
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  /* ===== PRICING DÉSACTIVÉ — état de la modale de paiement =====
  const [showPaywall, setShowPaywall] = useState(false);
  const unlockProject = useUnlockProject();
  ===== FIN PRICING DÉSACTIVÉ ===== */

  const countryCode = project?.destinationCountry?.isoCode;
  const departureDate = project?.expectedDepartureDate;

  // Construire la liste depuis progress
  const allSteps = useMemo(() => {
    if (!progress || !Array.isArray(progress)) return [];
    return progress.map((t) => {
      const trackingId = t.idProcedureTracking;
      const completedFacts = t.completedFacts ?? [];
      const keyFacts = t.admin_procedure?.keyFacts ?? [];
      const actionItems = t.admin_procedure?.actionItems ?? [];

      // Checkable sub-steps = concrete ACTIONS to do; keyFacts stay as read-only "à savoir".
      const substeps = actionItems.map((action, i) => {
        // Inline URLs / emails move out of the sentence and render as chips on the right.
        const { text, links } = extractLinks(action);
        return {
          id: `${trackingId}-${i}`,
          label: text,
          links,
          completed: completedFacts.includes(i),
        };
      });

      return {
        id: trackingId.toString(),
        trackingId,
        adminProcedureId: t.admin_procedure?.idAdminProcedure ?? 0,
        title: t.admin_procedure?.procedureType || '',
        completed: t.status === 'completed',
        status: t.status,
        completedAt: t.end_date || null, // date de complétion
        category: t.admin_procedure?.category || 'other',
        substeps,
        completedFacts,
        daysBeforeDeparture: t.admin_procedure?.daysBeforeDeparture,
        phase: (t.admin_procedure?.phase ?? 'on_arrival') as Phase,
        onlyFor: t.admin_procedure?.onlyFor ?? null,
        // Gov-link enrichment
        sourceUrl: t.admin_procedure?.sourceUrl,
        keyFacts,
      };
    });
  }, [progress]);

  // Filtrage profil + personnalisation par règles (nationalité/enfants → masquage, priorités → tri)
  const profileSteps = useMemo(() => {
    const base = filterStepsForProject(allSteps, {
      travelType: project?.travelType ?? undefined,
      objective: project?.mainObjective ?? undefined,
    });
    return personalizeFilter(base, {
      nationality: project?.nationality,
      destinationIso: countryCode,
      hasChildren: project?.hasChildren,
      priorities: project?.priorities,
      objective: project?.mainObjective,
    });
  }, [allSteps, project, countryCode]);

  // Champs de profil absents = personnalisation impossible sur ces axes.
  const missingProfileFields = useMemo(() => {
    if (!project) return [];
    const missing: string[] = [];
    if (!project.mainObjective) missing.push('ton objectif');
    if (!project.nationality) missing.push('ta nationalité');
    if (project.hasChildren == null) missing.push('ta situation familiale');
    return missing;
  }, [project]);

  // Filtrage UI + recherche
  const filteredSteps = useMemo(() => {
    return profileSteps
      .filter((step) => {
        const deadline = step.phase === 'before' ? getStepDeadline(step.daysBeforeDeparture, departureDate) : { isUrgent: false, isLate: false };
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

  // Tri timeline : avant-départ d'abord (par deadline croissante), puis à l'arrivée
  const timelineSteps = useMemo(() => {
    return [...filteredSteps].sort((a, b) => {
      // on_arrival always after before
      if (a.phase !== b.phase) return a.phase === 'before' ? -1 : 1;
      if (a.phase !== 'before') return 0;
      const da = getStepDeadline(a.daysBeforeDeparture, departureDate);
      const db = getStepDeadline(b.daysBeforeDeparture, departureDate);
      if (!da.date && !db.date) return 0;
      if (!da.date) return 1;
      if (!db.date) return -1;
      return da.date.getTime() - db.date.getTime();
    });
  }, [filteredSteps, departureDate]);

  // Stats — deadlines/urgency only apply to 'before' phase items
  const {
    totalSteps, completedSteps, lateSteps, urgentSteps,
    beforeTotal, beforeDone, arrivalTotal, arrivalDone,
  } = useMemo(() => {
    const total = profileSteps.length;
    const completed = profileSteps.filter((s) => s.completed).length;
    const late = profileSteps.filter((s) => {
      if (s.phase !== 'before') return false;
      const d = getStepDeadline(s.daysBeforeDeparture, departureDate);
      return !s.completed && d.isLate;
    }).length;
    const urgent = profileSteps.filter((s) => {
      if (s.phase !== 'before') return false;
      const d = getStepDeadline(s.daysBeforeDeparture, departureDate);
      return !s.completed && d.isUrgent;
    }).length;
    const before = profileSteps.filter((s) => s.phase === 'before');
    const arrival = profileSteps.filter((s) => s.phase !== 'before');
    return {
      totalSteps: total,
      completedSteps: completed,
      lateSteps: late,
      urgentSteps: urgent,
      beforeTotal: before.length,
      beforeDone: before.filter((s) => s.completed).length,
      arrivalTotal: arrival.length,
      arrivalDone: arrival.filter((s) => s.completed).length,
    };
  }, [profileSteps, departureDate]);

  const pct = (done: number, total: number) => (total > 0 ? Math.round((done / total) * 100) : 0);

  // Jours avant le départ
  const daysUntilDeparture = useMemo(() => {
    if (!departureDate) return null;
    const diff = Math.ceil((new Date(departureDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [departureDate]);

  // « Prochaine action » : l'étape non faite la plus urgente (avant-départ par échéance, sinon 1ʳᵉ).
  const nextAction = useMemo(() => {
    const incomplete = profileSteps.filter((s) => !s.completed);
    if (incomplete.length === 0) return null;
    const before = incomplete
      .filter((s) => s.phase === 'before')
      .map((s) => ({ s, date: getStepDeadline(s.daysBeforeDeparture, departureDate).date }))
      .sort((a, b) => (a.date?.getTime() ?? Infinity) - (b.date?.getTime() ?? Infinity));
    return before[0]?.s ?? incomplete[0];
  }, [profileSteps, departureDate]);

  // L'échéance « avant le … » n'a de sens que pour une étape AVANT le départ.
  // Une étape à l'arrivée ne doit pas afficher de date relative au départ.
  const nextActionDeadline =
    nextAction && nextAction.phase === 'before'
      ? getStepDeadline(nextAction.daysBeforeDeparture, departureDate)
      : null;

  // Système « intelligent » de faisabilité : un départ est-il encore tenable ?
  // Si des démarches d'avant-départ ont une échéance DÉJÀ PASSÉE (délai requis >
  // temps restant), le départ à cette date n'est plus réaliste.
  const feasibility = useMemo(() => {
    if (!departureDate) return null;
    const lateBefore = profileSteps.filter(
      (s) =>
        s.phase === 'before' &&
        !s.completed &&
        getStepDeadline(s.daysBeforeDeparture, departureDate).isLate,
    );
    if (lateBefore.length === 0) return null;
    const worst = lateBefore.reduce((a, b) =>
      (a.daysBeforeDeparture ?? 0) >= (b.daysBeforeDeparture ?? 0) ? a : b,
    );
    const worstLead = worst.daysBeforeDeparture ?? 0;
    const suggested = new Date();
    suggested.setDate(suggested.getDate() + worstLead);
    return {
      count: lateBefore.length,
      worstTitle: worst.title,
      worstLead,
      suggested: suggested.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
  }, [profileSteps, departureDate]);

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

  const toggleSubstep = useCallback(async (
    itemId: string,
    substepId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    const item = profileSteps.find((i) => i.id === itemId);
    if (!item) return;

    // substepId is `${trackingId}-${factIndex}`
    const factIndex = parseInt(substepId.split('-').pop() ?? '', 10);
    if (isNaN(factIndex)) return;

    const current = item.completedFacts;
    const next = current.includes(factIndex)
      ? current.filter((f) => f !== factIndex)
      : [...current, factIndex];

    // Cocher toutes les sous-étapes doit cocher l'étape : jusqu'ici seul
    // completedFacts était écrit, et « 4/4 tâches » restait affiché non complété
    // (retour de recette). On aligne le statut parent sur l'avancement réel.
    const total = item.substeps.length;
    const derivedStatus =
      total > 0 && next.length === total
        ? 'completed'
        : next.length > 0
          ? 'in_progress'
          : 'not_started';

    try {
      await updateFacts({ trackingId: item.trackingId, completedFacts: next });
      if (derivedStatus !== item.status) {
        await updateStep({ trackingId: item.trackingId, status: derivedStatus });
      }
    } catch (error) {
      console.error('Error updating fact:', error);
    }
  }, [profileSteps, updateFacts, updateStep]);

  // Réconciliation au chargement : des sous-tâches TOUTES cochées avec un statut parent
  // resté « à faire » (données écrites avant l'auto-complétion, ou écritures concurrentes)
  // s'affichaient incohérentes — « 5/5 tâches » et un rond vide. On aligne le statut une
  // seule fois par tracking, exactement comme le ferait le dernier clic de sous-tâche.
  const healedTrackingIds = useRef<Set<number>>(new Set());
  useEffect(() => {
    for (const item of profileSteps) {
      const total = item.substeps.length;
      const done = item.substeps.filter((s) => s.completed).length;
      if (
        total > 0 &&
        done === total &&
        item.status !== 'completed' &&
        !healedTrackingIds.current.has(item.trackingId)
      ) {
        healedTrackingIds.current.add(item.trackingId);
        updateStep({ trackingId: item.trackingId, status: 'completed' }).catch(() => {
          healedTrackingIds.current.delete(item.trackingId);
        });
      }
    }
  }, [profileSteps, updateStep]);

  const displaySteps = view === 'timeline' ? timelineSteps : filteredSteps;

  /* ===== PRICING DÉSACTIVÉ — verrou « par projet » =====
  // Un projet non payé n'affichait qu'un aperçu (3 étapes) ; le reste était
  // verrouillé derrière le déblocage (paiement mock).
  const isLocked = project?.isPaid === false;
  const PREVIEW_COUNT = 3;
  const gatedSteps = isLocked ? displaySteps.slice(0, PREVIEW_COUNT) : displaySteps;
  const lockedCount = isLocked ? displaySteps.length - gatedSteps.length : 0;
  ===== FIN PRICING DÉSACTIVÉ ===== */

  // Toutes les étapes sont affichées : plus aucun verrou payant.
  const gatedSteps = displaySteps;

  // Split into two phase groups. En vue LISTE, les catégories prioritaires
  // remontent en tête de chaque section ; en vue TIMELINE on préserve l'ordre
  // chronologique (par deadline) calculé dans timelineSteps — le re-tri par
  // priorités l'écrasait et rendait les deux vues identiques.
  const orderSection = (steps: typeof gatedSteps) =>
    view === 'timeline' ? steps : sortByPriorities(steps, project?.priorities);
  const beforeSteps = orderSection(gatedSteps.filter((s) => s.phase === 'before'));
  const arrivalSteps = orderSection(gatedSteps.filter((s) => s.phase !== 'before'));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header épuré : titre seul — l'état du projet vit dans la sidebar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <Link
            to={`/projects/${projectId}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Retour au projet
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">
            Ma checklist d'expatriation
          </h1>
        </div>
      </div>

      {/* Corps : sidebar d'état (sticky) + liste pleine largeur */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-12">
        <div className="grid gap-6 items-start lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* ── Sidebar : où j'en suis / à faire maintenant ── */}
          <aside className="min-w-0 lg:sticky lg:top-6 space-y-3">
          {/* Où j'en suis — compte à rebours + progression, une seule carte */}
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-brand/10 to-transparent bg-white p-4">

          {departureDate ? (
            <div className="flex items-center gap-4">
              <div className="text-center px-2 flex-shrink-0">
                <div
                  className={`text-3xl font-bold font-outfit leading-none ${
                    daysUntilDeparture !== null && daysUntilDeparture < 30
                      ? 'text-orange-600'
                      : 'text-brand-ink'
                  }`}
                >
                  {daysUntilDeparture === null
                    ? '—'
                    : daysUntilDeparture > 0
                      ? `J-${daysUntilDeparture}`
                      : daysUntilDeparture === 0
                        ? 'Jour J'
                        : 'Parti·e'}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">
                  avant le départ
                </div>
              </div>
              <div className="h-12 w-px bg-gray-200 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-gray-600">
                  Départ le{' '}
                  <span className="font-semibold text-gray-800">
                    {new Date(departureDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {lateSteps > 0 && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                      {lateSteps} en retard
                    </span>
                  )}
                  {urgentSteps > 0 && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                      {urgentSteps} urgentes
                    </span>
                  )}
                  {lateSteps === 0 && urgentSteps === 0 && completedSteps < totalSteps && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                      Dans les temps
                    </span>
                  )}
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {pct(completedSteps, totalSteps)}% fait
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-2 inline-flex items-start gap-1.5 text-sm text-gray-500">
              <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
              Ajoutez une date de départ à votre projet pour activer le compte à rebours et les
              échéances.
            </p>
          )}

          {/* Progression par phase — on ne mélange plus « avant le départ » et « sur place » :
              dire « 100% » alors que la personne n'est pas encore installée n'aurait pas de sens. */}
          <div className="mt-4 space-y-3">
            {beforeTotal > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                    <Plane className="w-4 h-4 text-gray-400" /> Avant le départ — {beforeDone} / {beforeTotal}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{pct(beforeDone, beforeTotal)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gray-900 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct(beforeDone, beforeTotal)}%` }}
                  />
                </div>
              </div>
            )}
            {arrivalTotal > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                    <Home className="w-4 h-4 text-gray-400" /> Sur place — {arrivalDone} / {arrivalTotal}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{pct(arrivalDone, arrivalTotal)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-brand-ink h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct(arrivalDone, arrivalTotal)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Prochaine action recommandée — le guide « et maintenant, je fais quoi ? »,
              avec le verdict de faisabilité replié dedans (même sujet : la démarche en retard). */}
          {nextAction ? (
            <div className="rounded-xl border border-brand/30 bg-brand-ink/5 px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-brand-ink/15 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-brand-ink" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-ink">Prochaine action</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{nextAction.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {nextActionDeadline?.date ? (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        nextActionDeadline.isLate ? 'text-red-600' : nextActionDeadline.isUrgent ? 'text-orange-600' : 'text-gray-500'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        avant le {nextActionDeadline.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      </span>
                    ) : nextAction.phase === 'on_arrival' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500">
                        <Home className="w-3 h-3" /> à faire à l'arrivée
                      </span>
                    ) : null}
                    {/* Pas de TrustBadge ici : trop large pour la sidebar, il est déjà
                        affiché sur l'étape elle-même dans la liste. */}
                  </div>
                </div>
                <button
                  onClick={() => toggleItem(nextAction.id)}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-ink hover:bg-brand-ink-hover text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Fait
                </button>
              </div>
              {feasibility && (
                <p className="mt-2.5 pt-2.5 border-t border-red-200/60 text-xs text-red-700 leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                  <span className="font-semibold">Ce départ n'est peut-être plus tenable</span> —
                  « {feasibility.worstTitle} » demande ~{feasibility.worstLead} jours : un départ
                  réaliste serait plutôt{' '}
                  <span className="font-semibold">à partir du {feasibility.suggested}</span>.{' '}
                  <Link
                    to={`/projects/${projectId}`}
                    className="font-semibold underline underline-offset-2 hover:text-red-900"
                  >
                    Modifier ma date de départ
                  </Link>
                </p>
              )}
            </div>
          ) : completedSteps > 0 && completedSteps === totalSteps ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Toutes tes démarches sont faites — bravo !
            </div>
          ) : null}

          {/* Buddies : UNE carte agrégée pour toute la checklist — fini l'encart
              social répété sous chaque étape. */}
          <BuddySidebarCard
            steps={profileSteps.map((s) => ({
              adminProcedureId: s.adminProcedureId,
              title: s.title,
            }))}
            countryId={project?.idDestinationCountry ?? 0}
          />

          {/* Personnalisation : ligne discrète — sans objectif / nationalité / situation
              familiale, le moteur ne peut pas affiner la checklist. */}
          {missingProfileFields.length > 0 && (
            <p className="px-1 text-[13px] text-gray-500 leading-relaxed">
              <Lightbulb className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-amber-500" />
              <span className="font-medium text-gray-700">Checklist partiellement personnalisée.</span>{' '}
              Renseigne {formatList(missingProfileFields)} pour ne voir que les étapes qui te
              concernent vraiment.{' '}
              <Link
                to={`/onboarding/${projectId}`}
                className="font-semibold text-brand-ink hover:text-brand-ink-hover underline underline-offset-2"
              >
                Compléter mon profil
              </Link>
            </p>
          )}

          {/* Conditions d'entrée : seulement quand la nationalité est connue — sinon le
              message vague (« selon votre nationalité… ») doublonne la ligne profil. */}
          {project?.nationality && (
            <VisaNotice
              nationality={project?.nationality}
              destinationIso={countryCode}
              destinationName={project?.destinationCountry?.countryName}
              sourceUrl={allSteps.find((s) => s.category === 'visa')?.sourceUrl}
            />
          )}
          </aside>

          {/* ── Colonne principale : filtres, recherche, étapes ── */}
          <div className="min-w-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Filtres */}
          <div className="flex items-center gap-2 flex-wrap">
            {([
              { key: 'all', label: 'Tout', icon: null, tone: '' },
              { key: 'todo', label: 'À faire', icon: null, tone: '' },
              { key: 'urgent', label: 'Urgent', icon: AlertTriangle, tone: 'text-orange-500' },
              { key: 'late', label: 'En retard', icon: AlertCircle, tone: 'text-red-500' },
              { key: 'completed', label: 'Complété', icon: CheckCircle, tone: 'text-green-600' },
            ] as const).map(({ key, label, icon: Icon, tone }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  filter === key
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {/* Sur la puce active (fond sombre) l'icône reprend la couleur du texte,
                    sinon elle garde sa teinte de statut. */}
                {Icon && <Icon className={`w-3.5 h-3.5 ${filter === key ? 'text-current' : tone}`} />}
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

      {/* Liste des étapes */}
      <div className="mt-4">
        {displaySteps.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-sm">Aucune étape ne correspond à ce filtre.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ---- Section : Avant le départ ---- */}
            {beforeSteps.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5" /> Avant le départ
                  <span className="text-gray-500 font-normal normal-case tracking-normal">({beforeSteps.length})</span>
                </h2>
                <div className="space-y-2">
                  {beforeSteps.map((item) => (
                    <ChecklistItemRow
                      key={item.id}
                      item={item}
                      isExpanded={expandedIds.has(item.id)}
                      departureDate={departureDate}
                      countryCode={countryCode}
                      onToggleExpand={toggleExpand}
                      onToggleItem={toggleItem}
                      onToggleSubstep={toggleSubstep}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ---- Section : À l'arrivée ---- */}
            {arrivalSteps.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" /> À l'arrivée
                  <span className="text-gray-500 font-normal normal-case tracking-normal">({arrivalSteps.length})</span>
                </h2>
                <div className="space-y-2">
                  {arrivalSteps.map((item) => (
                    <ChecklistItemRow
                      key={item.id}
                      item={item}
                      isExpanded={expandedIds.has(item.id)}
                      departureDate={departureDate}
                      countryCode={countryCode}
                      onToggleExpand={toggleExpand}
                      onToggleItem={toggleItem}
                      onToggleSubstep={toggleSubstep}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== PRICING DÉSACTIVÉ — CTA « Débloquez votre plan complet » =====
        -- Paywall : le reste du plan est verrouillé tant que le projet n'est pas débloqué
        {isLocked && lockedCount > 0 && (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-brand/40 bg-brand-ink/5 p-6 text-center">
            <div className="text-3xl mb-2">🔒</div>
            <p className="font-bold text-gray-900">
              {lockedCount} étape{lockedCount > 1 ? 's' : ''} verrouillée{lockedCount > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-gray-600 mt-1 mb-4 max-w-md mx-auto">
              Débloquez votre plan complet : toutes les démarches, les liens officiels vérifiés, les
              deadlines et le suivi de progression.
            </p>
            <button
              onClick={() => setShowPaywall(true)}
              className="inline-flex items-center gap-2 bg-brand-ink hover:bg-brand-ink-hover text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors"
            >
              Débloquer mon projet — 49 €
            </button>
          </div>
        )}
        ===== FIN PRICING DÉSACTIVÉ ===== */}
      </div>
          </div>{/* fin colonne principale */}
        </div>{/* fin grid sidebar + liste */}
      </div>{/* fin corps */}

      {/* ===== PRICING DÉSACTIVÉ — modale de paiement (mock) =====
      -- Modale de paiement (mock)
      {showPaywall && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPaywall(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-1">Débloquer ce projet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Plan complet : checklist entière, liens officiels vérifiés, deadlines & budget.
            </p>

            <div className="rounded-xl border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Projet d'expatriation</span>
                <span className="text-lg font-bold text-gray-900">49 €</span>
              </div>
              <input
                disabled
                value="4242 4242 4242 4242"
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2 bg-gray-50 text-gray-500"
              />
              <div className="flex gap-2">
                <input
                  disabled
                  value="12/29"
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                />
                <input
                  disabled
                  value="123"
                  readOnly
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                💳 Démo — aucune vraie carte, aucun débit réel.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPaywall(false)}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() =>
                  unlockProject.mutate(projectId, { onSuccess: () => setShowPaywall(false) })
                }
                disabled={unlockProject.isPending}
                className="px-5 py-2 text-sm bg-brand-ink hover:bg-brand-ink-hover text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {unlockProject.isPending ? 'Traitement…' : 'Payer 49 € (démo)'}
              </button>
            </div>
          </div>
        </div>
      )}
      ===== FIN PRICING DÉSACTIVÉ ===== */}
    </div>
  );
}
