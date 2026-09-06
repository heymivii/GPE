import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarClock, ArrowRight, AlertTriangle, Plane, CheckCircle2 } from 'lucide-react';
import Widget from './Widget';
import type { WidgetSize } from '../hooks/useDashboardPreferences';
import { useChecklistProgress, getStepDeadline, filterStepsForProject } from '../hooks/useChecklistProgress';
import { personalizeFilter } from '../hooks/personalize';

interface Props {
  projectId: number;
  departureDate?: string | null;
  /** Profil du projet — pour n'afficher QUE les étapes applicables (mêmes filtres que la checklist). */
  project?: {
    travelType?: string | null;
    objective?: string | null;
    nationality?: string | null;
    hasChildren?: boolean | null;
    priorities?: string | null;
  };
  /** ISO du pays de destination — nécessaire à l'exemption de visa (UE/CH). */
  countryCode?: string;
  onHide?: () => void;
  onResize?: (size: WidgetSize) => void;
  currentSize?: WidgetSize;
}

const MS_DAY = 1000 * 60 * 60 * 24;

export default function CountdownWidget({
  projectId,
  departureDate,
  project,
  countryCode,
  onHide,
  onResize,
  currentSize,
}: Props) {
  const { t, i18n } = useTranslation();
  const { progress } = useChecklistProgress(projectId);

  const daysToDeparture = useMemo(() => {
    if (!departureDate) return null;
    return Math.ceil((new Date(departureDate).getTime() - Date.now()) / MS_DAY);
  }, [departureDate]);

  // Étapes RÉELLEMENT applicables au profil — EXACTEMENT les deux filtres de la checklist :
  // filterStepsForProject (type/objectif) puis personalizeFilter (nationalité/visa, enfants…).
  // Sans ça, on afficherait une étape que la checklist masque (ex. visa exempté UE→CH).
  const applicable = useMemo(() => {
    if (!Array.isArray(progress)) return [] as Array<{
      title: string; category: string; phase: string; daysBeforeDeparture: number | undefined; completed: boolean;
    }>;
    const steps = progress.map((tr: any) => ({
      title: tr.admin_procedure?.procedureType ?? '',
      category: tr.admin_procedure?.category ?? 'other',
      phase: tr.admin_procedure?.phase ?? 'on_arrival',
      onlyFor: tr.admin_procedure?.onlyFor ?? null,
      daysBeforeDeparture: tr.admin_procedure?.daysBeforeDeparture,
      completed: tr.status === 'completed',
    }));
    const byProfile = filterStepsForProject(steps, {
      travelType: project?.travelType,
      objective: project?.objective,
    });
    return personalizeFilter(byProfile, {
      nationality: project?.nationality,
      destinationIso: countryCode,
      hasChildren: project?.hasChildren,
      priorities: project?.priorities,
      objective: project?.objective,
    });
  }, [progress, project?.travelType, project?.objective, project?.nationality, project?.hasChildren, project?.priorities, countryCode]);

  // Échéances = uniquement les étapes AVANT LE DÉPART (les démarches sur place n'ont pas
  // de deadline pré-départ — on ne peut les faire qu'une fois arrivé·e).
  const upcoming = useMemo(() => {
    if (!departureDate) return [];
    return applicable
      .filter((s) => s.phase === 'before' && !s.completed)
      .map((s) => ({
        title: s.title,
        deadline: getStepDeadline(s.daysBeforeDeparture, departureDate),
      }))
      .filter((s) => s.deadline.date !== null)
      .sort((a, b) => (a.deadline.daysLeft ?? 0) - (b.deadline.daysLeft ?? 0))
      .slice(0, 3);
  }, [applicable, departureDate]);

  // État de préparation par phase (pour le message honnête quand plus d'échéance).
  const beforeIncomplete = useMemo(
    () => applicable.filter((s) => s.phase === 'before' && !s.completed).length,
    [applicable],
  );
  const arrivalIncomplete = useMemo(
    () => applicable.filter((s) => s.phase !== 'before' && !s.completed).length,
    [applicable],
  );

  const fmtDate = (d: Date) =>
    d.toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'fr-FR', {
      day: 'numeric',
      month: 'short',
    });

  return (
    <Widget
      title={t('dashboard.personalized.widgets.countdown.title', { defaultValue: 'Compte à rebours' })}
      icon={CalendarClock}
      iconColor="text-purple-600"
      onHide={onHide}
      onResize={onResize}
      currentSize={currentSize}
    >
      {!departureDate ? (
        <div className="flex flex-col items-center justify-center text-center py-6 gap-2 flex-grow">
          <Plane className="w-8 h-8 text-gray-300" />
          <p className="text-sm text-gray-500">
            {t('dashboard.personalized.widgets.countdown.noDate', {
              defaultValue: 'Ajoutez une date de départ pour activer le compte à rebours.',
            })}
          </p>
          <Link
            to={`/onboarding/${projectId}`}
            className="text-xs font-medium text-brand-ink hover:underline"
          >
            {t('dashboard.personalized.widgets.countdown.addDate', { defaultValue: 'Ajouter une date' })}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col flex-grow">
          {/* Grand compteur */}
          <div className="text-center py-2">
            {daysToDeparture !== null && daysToDeparture >= 0 ? (
              <>
                <p className="text-4xl font-bold tracking-tight text-gray-900">
                  {t('dashboard.personalized.widgets.countdown.jMinus', {
                    days: daysToDeparture,
                    defaultValue: 'J-{{days}}',
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('dashboard.personalized.widgets.countdown.until', {
                    date: new Date(departureDate).toLocaleDateString(
                      i18n.language === 'en' ? 'en-GB' : 'fr-FR',
                      { day: 'numeric', month: 'long', year: 'numeric' },
                    ),
                    defaultValue: 'avant votre départ · {{date}}',
                  })}
                </p>
              </>
            ) : (
              <p className="text-lg font-semibold text-emerald-600">
                {t('dashboard.personalized.widgets.countdown.departed', {
                  defaultValue: 'Vous êtes parti·e !',
                })}
              </p>
            )}
          </div>

          {/* Prochaines échéances */}
          {upcoming.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                {t('dashboard.personalized.widgets.countdown.nextDeadlines', {
                  defaultValue: 'Prochaines échéances',
                })}
              </p>
              {upcoming.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      s.deadline.isLate
                        ? 'bg-red-500'
                        : s.deadline.isUrgent
                          ? 'bg-amber-500'
                          : 'bg-brand-ink'
                    }`}
                  />
                  <span className="flex-1 min-w-0 truncate text-gray-700">{s.title}</span>
                  <span
                    className={`text-xs flex-shrink-0 flex items-center gap-1 ${
                      s.deadline.isLate ? 'text-red-600 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {s.deadline.isLate && <AlertTriangle className="w-3 h-3" />}
                    {s.deadline.isLate
                      ? t('dashboard.personalized.widgets.countdown.late', { defaultValue: 'En retard' })
                      : fmtDate(s.deadline.date as Date)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {upcoming.length === 0 && beforeIncomplete === 0 && (
            <div className="mt-3 pt-3 border-t border-gray-50 text-center">
              <p className="inline-flex items-start gap-1.5 text-xs font-medium text-emerald-600 leading-snug">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-px" />{' '}
                {arrivalIncomplete > 0
                  ? t('dashboard.personalized.widgets.countdown.prepDone', {
                      defaultValue:
                        'Préparation terminée — les démarches sur place vous attendent à l’arrivée',
                    })
                  : t('dashboard.personalized.widgets.countdown.allDone', {
                      defaultValue: 'Toutes vos démarches sont à jour',
                    })}
              </p>
            </div>
          )}

          <Link
            to={`/projects/${projectId}/checklist`}
            className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-ink hover:underline"
          >
            {t('dashboard.personalized.widgets.countdown.seeChecklist', { defaultValue: 'Voir ma checklist' })}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </Widget>
  );
}
