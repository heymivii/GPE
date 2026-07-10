import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarClock, ArrowRight, AlertTriangle, Plane } from 'lucide-react';
import Widget from './Widget';
import type { WidgetSize } from '../hooks/useDashboardPreferences';
import { useChecklistProgress, getStepDeadline, filterStepsForProject } from '../hooks/useChecklistProgress';

interface Props {
  projectId: number;
  departureDate?: string | null;
  /** Profil du projet — pour n'afficher QUE les étapes applicables (comme la checklist). */
  project?: { travelType?: string | null; objective?: string | null };
  onHide?: () => void;
  onResize?: (size: WidgetSize) => void;
  currentSize?: WidgetSize;
}

const MS_DAY = 1000 * 60 * 60 * 24;

export default function CountdownWidget({
  projectId,
  departureDate,
  project,
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

  // Les 3 prochaines échéances non terminées, en n'incluant QUE les étapes applicables
  // au profil (même filtre que la checklist) — sinon on affiche des étapes qu'elle masque.
  const upcoming = useMemo(() => {
    if (!Array.isArray(progress) || !departureDate) return [];
    const steps = progress.map((tr: any) => ({
      title: tr.admin_procedure?.procedureType ?? '',
      onlyFor: tr.admin_procedure?.onlyFor ?? null,
      daysBeforeDeparture: tr.admin_procedure?.daysBeforeDeparture,
      completed: tr.status === 'completed',
    }));
    return filterStepsForProject(steps, {
      travelType: project?.travelType,
      objective: project?.objective,
    })
      .filter((s) => !s.completed)
      .map((s) => ({
        title: s.title,
        deadline: getStepDeadline(s.daysBeforeDeparture, departureDate),
      }))
      .filter((s) => s.deadline.date !== null)
      .sort((a, b) => (a.deadline.daysLeft ?? 0) - (b.deadline.daysLeft ?? 0))
      .slice(0, 3);
  }, [progress, departureDate, project?.travelType, project?.objective]);

  // Y a-t-il encore des étapes applicables non terminées ? (pour l'état « tout est à jour »)
  const hasApplicableIncomplete = useMemo(() => {
    if (!Array.isArray(progress)) return false;
    const steps = progress.map((tr: any) => ({
      onlyFor: tr.admin_procedure?.onlyFor ?? null,
      completed: tr.status === 'completed',
    }));
    return filterStepsForProject(steps, {
      travelType: project?.travelType,
      objective: project?.objective,
    }).some((s) => !s.completed);
  }, [progress, project?.travelType, project?.objective]);

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
            className="text-xs font-medium text-[#5EA3C0] hover:underline"
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
                  defaultValue: '🎉 Vous êtes parti·e !',
                })}
              </p>
            )}
          </div>

          {/* Prochaines échéances */}
          {upcoming.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
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
                          : 'bg-[#5EA3C0]'
                    }`}
                  />
                  <span className="flex-1 min-w-0 truncate text-gray-700">{s.title}</span>
                  <span
                    className={`text-xs flex-shrink-0 flex items-center gap-1 ${
                      s.deadline.isLate ? 'text-red-600 font-medium' : 'text-gray-400'
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

          {upcoming.length === 0 && !hasApplicableIncomplete && (
            <div className="mt-3 pt-3 border-t border-gray-50 text-center">
              <p className="text-xs font-medium text-emerald-600">
                ✅{' '}
                {t('dashboard.personalized.widgets.countdown.allDone', {
                  defaultValue: 'Toutes vos démarches sont à jour',
                })}
              </p>
            </div>
          )}

          <Link
            to={`/projects/${projectId}/checklist`}
            className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-medium text-[#5EA3C0] hover:underline"
          >
            {t('dashboard.personalized.widgets.countdown.seeChecklist', { defaultValue: 'Voir ma checklist' })}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </Widget>
  );
}
