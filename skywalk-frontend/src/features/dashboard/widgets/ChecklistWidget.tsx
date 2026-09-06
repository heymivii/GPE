import Widget from './Widget';
import { CheckCircle, Circle, ChevronDown, ChevronRight, ExternalLink, ArrowRight, AlertCircle, Calendar, Plane, Home } from 'lucide-react';
import { useState, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { CountryData } from '../../../hooks/useCountryData';
import { useChecklistProgress, getStepDeadline, filterStepsForProject } from '../hooks/useChecklistProgress';
import { personalizeFilter } from '../hooks/personalize';
import TrustBadge from '../../../components/TrustBadge';
import VisaNotice from '../../../components/VisaNotice';
import SubstepLinks from '../../../components/SubstepLinks';
import { extractLinks, type ExtractedLink } from '../../../lib/formatters';
import { getLinksForStep } from '../../../data/checklist-links';
import { useTranslation } from 'react-i18next';
import { getLocale } from '../../../data/supportedCountries';
import type { WidgetSize } from '../hooks/useDashboardPreferences';

const CK = 'dashboard.personalized.widgets.checklist';

const CATEGORY_LABELS: Record<string, string> = {
  visa: 'dashboard.personalized.widgets.checklist.categories.visa',
  'pre-departure': 'dashboard.personalized.widgets.checklist.categories.preDeparture',
  administratif: 'dashboard.personalized.widgets.checklist.categories.admin',
  logement: 'dashboard.personalized.widgets.checklist.categories.housing',
  sante: 'dashboard.personalized.widgets.checklist.categories.health',
  finance: 'dashboard.personalized.widgets.checklist.categories.finance',
  arrival: 'dashboard.personalized.widgets.checklist.categories.arrival',
  integration: 'dashboard.personalized.widgets.checklist.categories.integration',
};

// ✅ Badge deadline — ignoré pour les étapes à l'arrivée
function DeadlineBadge({ daysBeforeDeparture, departureDate, phase }: {
  daysBeforeDeparture?: number;
  departureDate?: string | Date | null;
  phase?: 'before' | 'on_arrival';
}) {
  const { t, i18n } = useTranslation();
  if (phase === 'on_arrival') return null;
  const deadline = getStepDeadline(daysBeforeDeparture, departureDate);
  if (!deadline.date) return null;

  const dateStr = deadline.date.toLocaleDateString(getLocale(i18n.language), { day: 'numeric', month: 'short', year: 'numeric' });

  if (deadline.isLate) return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-medium whitespace-nowrap">
      <AlertCircle className="w-2.5 h-2.5" /> {t(`${CK}.deadlineLate`, { date: dateStr })}
    </span>
  );
  if (deadline.isUrgent) return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium whitespace-nowrap">
      {t(`${CK}.deadlineUrgent`, { days: deadline.daysLeft, date: dateStr })}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">
      <Calendar className="w-2.5 h-2.5" /> {t(`${CK}.deadlineNormal`, { date: dateStr })}
    </span>
  );
}

// ✅ Liens officiels par étape
function StepLinks({ category, countryCode }: { category: string; countryCode?: string }) {
  const { t } = useTranslation();
  const links = getLinksForStep(category, countryCode);
  if (!links) return null;

  const hasLinks = links.serviceLink || (links.externalLinks && links.externalLinks.length > 0);
  if (!hasLinks) return null;

  return (
    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
      {links.serviceLink && (
        <Link
          to={links.serviceLink}
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5"
        >
          {t(`${CK}.seeService`)} <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      )}
      {links.externalLinks?.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-gray-500 hover:text-gray-600 flex items-center gap-0.5"
        >
          {link.label} <ExternalLink className="w-2.5 h-2.5" />
        </a>
      ))}
    </div>
  );
}

// ---- ChecklistItemCard — renders one item row (used for both phase groups) ----

interface ChecklistItemCardProps {
  item: {
    id: string;
    trackingId: number;
    title: string;
    completed: boolean;
    category: string;
    substeps: { id: string; label: string; completed: boolean; isOptional: boolean; links: ExtractedLink[] }[];
    completedFacts: number[];
    daysBeforeDeparture?: number;
    phase: 'before' | 'on_arrival';
    onlyFor?: { travelType?: string[]; objective?: string[] } | null;
  };
  isExpanded: boolean;
  departureDate?: string | Date | null;
  countryCode?: string;
  t: (key: string) => string;
  onToggleExpand: (id: string, e: React.MouseEvent) => void;
  onToggleItem: (id: string) => void;
  onToggleSubstep: (itemId: string, substepId: string, e: React.MouseEvent) => void;
}

function ChecklistItemCard({
  item,
  isExpanded,
  departureDate,
  countryCode,
  t,
  onToggleExpand,
  onToggleItem,
  onToggleSubstep,
}: ChecklistItemCardProps) {
  const substepsDone = item.substeps?.filter((s) => s.completed).length ?? 0;
  const substepsTotal = item.substeps?.length ?? 0;

  return (
    <div className="rounded-lg border border-gray-100 overflow-hidden">
      <div
        className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
          item.completed ? 'bg-gray-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => substepsTotal === 0 ? onToggleItem(item.id) : onToggleExpand(item.id, { stopPropagation: () => {} } as React.MouseEvent)}
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
              {t(CATEGORY_LABELS[item.category] || item.category)}
            </span>
            {substepsTotal > 0 && (
              <span className="text-[11px] text-gray-500">
                {substepsDone}/{substepsTotal}
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
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500 whitespace-nowrap">
                    {t(`${CK}.onSite`)}
                  </span>
                )}
              </>
            )}
          </div>

          {!item.completed && substepsTotal === 0 && (
            <StepLinks category={item.category} countryCode={countryCode} />
          )}
        </div>

        {substepsTotal > 0 && (
          <button
            onClick={(e) => onToggleExpand(item.id, e)}
            className="flex-shrink-0 mt-1 p-1 rounded-md hover:bg-gray-200 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        )}
      </div>

      {isExpanded && substepsTotal > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-3 py-2 space-y-1">
          {item.substeps.map((substep) => (
            <div
              key={substep.id}
              onClick={(e) => onToggleSubstep(item.id, substep.id, e)}
              className={`flex items-start gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-colors ${
                substep.completed ? 'bg-gray-100/60' : 'hover:bg-gray-100'
              }`}
            >
              <span className="flex-shrink-0 mt-0.5">
                {substep.completed ? (
                  <CheckCircle className="w-3.5 h-3.5 text-gray-900" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-gray-300" />
                )}
              </span>
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-x-3 gap-y-1">
                <span className={`text-xs leading-relaxed ${
                  substep.completed ? 'text-gray-500 line-through' : 'text-gray-600'
                }`}>
                  {substep.label}
                  {substep.isOptional && (
                    <span className="ml-1 text-gray-500 italic">
                      ({t('dashboard.personalized.widgets.checklist.optional')})
                    </span>
                  )}
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

interface ChecklistWidgetProps {
  countryData: CountryData | null;
  projectId: number;
  project?: {
    travelType?: string | null;
    objective?: string | null;
    expectedDepartureDate?: string | Date | null;
    idProject?: number;
    nationality?: string | null;
    hasChildren?: boolean | null;
    priorities?: string | null;
    isPaid?: boolean;
  };
  onEdit?: () => void;
  onHide?: () => void;
  onResize?: (size: WidgetSize) => void;
  currentSize?: WidgetSize;
}

interface ChecklistSubstep {
  id: string;
  label: string;
  completed: boolean;
  isOptional: boolean;
  links: ExtractedLink[];
}

interface ChecklistItem {
  id: string;
  trackingId: number;
  title: string;
  completed: boolean;
  status: string;
  category: string;
  substeps: ChecklistSubstep[];
  completedFacts: number[];
  daysBeforeDeparture?: number;
  phase: 'before' | 'on_arrival';
  onlyFor?: { travelType?: string[]; objective?: string[] } | null;
  sourceUrl?: string;
}

export default function ChecklistWidget({
  countryData: _countryData,
  projectId,
  project,
  onEdit,
  onHide,
  onResize,
  currentSize,
}: ChecklistWidgetProps) {
  const { t } = useTranslation();
  const { progress, updateStep, updateFacts, isLoading } = useChecklistProgress(projectId);

  /* ===== PRICING DÉSACTIVÉ — verrou du widget =====
  // Projet non payé → on ne montrait que l'aperçu (les étapes urgentes) ; le reste
  // était verrouillé derrière le déblocage, comme sur la page checklist.
  const isLocked = project?.isPaid === false;
  ===== FIN PRICING DÉSACTIVÉ ===== */

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const pendingRef = useRef<Set<string>>(new Set());

  // Récupérer le code ISO du pays depuis countryData
  const countryCode = (_countryData as any)?.isoCode || (_countryData as any)?.code;
  const departureDate = project?.expectedDepartureDate;

  const allChecklist = useMemo<ChecklistItem[]>(() => {
    if (!progress || !Array.isArray(progress)) return [];

    return progress.map((t) => {
      const trackingId = t.idProcedureTracking;
      const completedFacts = t.completedFacts ?? [];
      const actionItems = t.admin_procedure?.actionItems ?? [];

      // Checkable sub-steps = concrete ACTIONS to do (not descriptive facts).
      const substeps: ChecklistSubstep[] = actionItems.map((action, i) => {
        // Inline URLs / emails move out of the sentence and render as chips on the right.
        const { text, links } = extractLinks(action);
        return {
          id: `${trackingId}-${i}`,
          label: text,
          links,
          completed: completedFacts.includes(i),
          isOptional: false,
        };
      });

      return {
        id: trackingId.toString(),
        trackingId,
        title: t.admin_procedure?.procedureType || '',
        completed: t.status === 'completed',
        status: t.status,
        category: t.admin_procedure?.category || 'other',
        substeps,
        completedFacts,
        daysBeforeDeparture: t.admin_procedure?.daysBeforeDeparture,
        phase: (t.admin_procedure?.phase ?? 'on_arrival') as 'before' | 'on_arrival',
        onlyFor: t.admin_procedure?.onlyFor ?? null,
        sourceUrl: t.admin_procedure?.sourceUrl,
      };
    });
  }, [progress]);

  // ✅ Filtrage profil + personnalisation par règles (nationalité/enfants)
  const checklist = useMemo(() => {
    const base = filterStepsForProject(allChecklist, {
      travelType: project?.travelType,
      objective: project?.objective,
    });
    return personalizeFilter(base, {
      nationality: project?.nationality,
      destinationIso: countryCode,
      hasChildren: project?.hasChildren,
      priorities: project?.priorities,
      objective: project?.objective,
    });
  }, [allChecklist, project?.travelType, project?.objective, project?.nationality, project?.hasChildren, project?.priorities, countryCode]);

  // ✅ Les 3 étapes urgentes/en retard pour l'aperçu widget — seulement phase 'before'
  const urgentSteps = useMemo(() => {
    return checklist
      .filter((item) => !item.completed && item.phase === 'before')
      .map((item) => ({
        ...item,
        deadline: getStepDeadline(item.daysBeforeDeparture, departureDate),
      }))
      .filter((item) => item.deadline.isLate || item.deadline.isUrgent || item.deadline.date !== null)
      .sort((a, b) => {
        if (a.deadline.isLate && !b.deadline.isLate) return -1;
        if (!a.deadline.isLate && b.deadline.isLate) return 1;
        if (a.deadline.daysLeft !== null && b.deadline.daysLeft !== null) {
          return a.deadline.daysLeft - b.deadline.daysLeft;
        }
        return 0;
      })
      .slice(0, 3);
  }, [checklist, departureDate]);

  // Avoid showing the priority-preview items again in the full list below.
  const urgentIds = useMemo(() => new Set(urgentSteps.map((s) => s.id)), [urgentSteps]);
  const remainingChecklist = useMemo(
    () => checklist.filter((item) => !urgentIds.has(item.id)),
    [checklist, urgentIds],
  );

  // Split remaining list by phase for grouped display
  const remainingBefore = useMemo(
    () => remainingChecklist.filter((item) => item.phase === 'before'),
    [remainingChecklist],
  );
  const remainingArrival = useMemo(
    () => remainingChecklist.filter((item) => item.phase !== 'before'),
    [remainingChecklist],
  );

  const toggleExpand = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleItem = useCallback(async (id: string) => {
    const item = checklist.find((i) => i.id === id);
    if (!item || pendingRef.current.has(id)) return;

    pendingRef.current.add(id);
    const newCompleted = !item.completed;

    try {
      await updateStep({
        trackingId: parseInt(id, 10),
        status: newCompleted ? 'completed' : 'not_started',
      });
    } catch (error) {
      console.error('Error updating step:', error);
    } finally {
      pendingRef.current.delete(id);
    }
  }, [checklist, updateStep]);

  const toggleSubstep = useCallback(async (
    itemId: string,
    substepId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    const item = checklist.find((i) => i.id === itemId);
    if (!item) return;

    // substepId is `${trackingId}-${factIndex}`
    const factIndex = parseInt(substepId.split('-').pop() ?? '', 10);
    if (isNaN(factIndex)) return;

    const current = item.completedFacts;
    const next = current.includes(factIndex)
      ? current.filter((f) => f !== factIndex)
      : [...current, factIndex];

    // Même règle que sur la page checklist : cocher toutes les sous-étapes
    // coche l'étape. Sans cela « 7/7 » restait affiché non complété.
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
  }, [checklist, updateFacts, updateStep]);

  // Progression par PHASE — on ne mélange plus « avant le départ » et « sur place » :
  // sinon on afficherait « 100% terminé » alors que la personne n'est même pas partie.
  const phase = useMemo(() => {
    const before = checklist.filter((i) => i.phase === 'before');
    const arrival = checklist.filter((i) => i.phase !== 'before');
    return {
      beforeTotal: before.length,
      beforeDone: before.filter((i) => i.completed).length,
      arrivalTotal: arrival.length,
      arrivalDone: arrival.filter((i) => i.completed).length,
    };
  }, [checklist]);
  const pct = (done: number, total: number) => (total > 0 ? (done / total) * 100 : 0);

  if (isLoading) {
    return (
      <Widget title={t('dashboard.personalized.widgets.checklist.title')} onEdit={onEdit} onHide={onHide} onResize={onResize} currentSize={currentSize}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Widget>
    );
  }

  if (checklist.length === 0) {
    return (
      <Widget title={t('dashboard.personalized.widgets.checklist.title')} onEdit={onEdit} onHide={onHide} onResize={onResize} currentSize={currentSize}>
        <div className="text-center py-8 text-gray-500">
          <p>{t('dashboard.personalized.widgets.checklist.emptyState')}</p>
        </div>
      </Widget>
    );
  }

  return (
    <Widget title={t('dashboard.personalized.widgets.checklist.title')} onEdit={onEdit} onHide={onHide} onResize={onResize} currentSize={currentSize}>
      <div className="space-y-4">
        {/* Progression par phase — jamais un « 100% » global tant que « sur place » n'est pas fait */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
          {phase.beforeTotal > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Plane className="w-3.5 h-3.5 text-gray-400" /> {t(`${CK}.beforeDeparture`)}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {phase.beforeDone}/{phase.beforeTotal}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-900 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pct(phase.beforeDone, phase.beforeTotal)}%` }}
                />
              </div>
            </div>
          )}
          {phase.arrivalTotal > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Home className="w-3.5 h-3.5 text-gray-400" /> {t(`${CK}.onArrival`)}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {phase.arrivalDone}/{phase.arrivalTotal}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-brand-ink h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pct(phase.arrivalDone, phase.arrivalTotal)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Conditions d'entrée selon la nationalité (installation, pas tourisme) */}
        <VisaNotice
          nationality={project?.nationality}
          destinationIso={countryCode}
          destinationName={(_countryData as any)?.name}
          sourceUrl={allChecklist.find((s) => s.category === 'visa')?.sourceUrl}
        />

        {/* Alerte date de départ manquante */}
        {!departureDate && (
          <div className="text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
            {t(`${CK}.missingDepartureDate`)}
          </div>
        )}

        {/* Aperçu : 3 étapes urgentes */}
        {urgentSteps.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t(`${CK}.priorityToDo`)}
            </p>
            {urgentSteps.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleItem(item.id)}
              >
                <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium truncate">{item.title}</p>
                  {item.sourceUrl ? (
                    <div className="mt-1"><TrustBadge url={item.sourceUrl} /></div>
                  ) : (
                    <StepLinks category={item.category} countryCode={countryCode} />
                  )}
                </div>
                <DeadlineBadge daysBeforeDeparture={item.daysBeforeDeparture} departureDate={departureDate} phase={item.phase} />
              </div>
            ))}
          </div>
        )}

        {/* Liste complète — groupée par phase */}
        <div className="space-y-3 max-h-[24rem] overflow-y-auto pr-1">
          {/* Avant le départ */}
          {remainingBefore.length > 0 && (
            <div className="space-y-1.5">
              <p className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                <Plane className="w-3 h-3" /> {t(`${CK}.beforeDeparture`)}
              </p>
              {remainingBefore.map((item) => (
                <ChecklistItemCard
                  key={item.id}
                  item={item}
                  isExpanded={expandedIds.has(item.id)}
                  departureDate={departureDate}
                  countryCode={countryCode}
                  t={t}
                  onToggleExpand={toggleExpand}
                  onToggleItem={toggleItem}
                  onToggleSubstep={toggleSubstep}
                />
              ))}
            </div>
          )}

          {/* À l'arrivée */}
          {remainingArrival.length > 0 && (
            <div className="space-y-1.5">
              <p className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                <Home className="w-3 h-3" /> {t(`${CK}.onArrival`)}
              </p>
              {remainingArrival.map((item) => (
                <ChecklistItemCard
                  key={item.id}
                  item={item}
                  isExpanded={expandedIds.has(item.id)}
                  departureDate={departureDate}
                  countryCode={countryCode}
                  t={t}
                  onToggleExpand={toggleExpand}
                  onToggleItem={toggleItem}
                  onToggleSubstep={toggleSubstep}
                />
              ))}
            </div>
          )}
        </div>

        {/* ===== PRICING DÉSACTIVÉ — CTA « Débloquez votre plan complet » =====
        -- Verrou : plan complet réservé aux projets débloqués (payés)
        {isLocked && project?.idProject && (
          <Link
            to={`/projects/${project.idProject}/checklist`}
            className="flex flex-col items-center gap-0.5 w-full py-4 rounded-xl border-2 border-dashed border-brand/40 bg-brand-ink/5 text-center hover:bg-brand-ink/10 transition-colors"
          >
            <span className="text-2xl">🔒</span>
            <span className="text-sm font-semibold text-gray-800">Débloquez votre plan complet</span>
            <span className="text-xs text-gray-500">Toutes les démarches + liens officiels vérifiés</span>
          </Link>
        )}
        ===== FIN PRICING DÉSACTIVÉ ===== */}

        {/* Lien vers la page dédiée */}
        {project?.idProject && (
          <Link
            to={`/projects/${project.idProject}/checklist`}
            className="flex items-center justify-center gap-1.5 w-full py-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-100 hover:border-gray-300 rounded-lg transition-colors"
          >
            {t(`${CK}.seeFullChecklist`)}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </Widget>
  );
}
