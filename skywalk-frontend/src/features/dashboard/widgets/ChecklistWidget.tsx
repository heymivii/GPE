import Widget from './Widget';
import { CheckCircle, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useMemo, useCallback, useRef } from 'react';
import type { CountryData } from '../../../hooks/useCountryData';
import { useChecklistProgress } from '../hooks/useChecklistProgress';
import { useTranslation } from 'react-i18next';
import type { WidgetSize } from '../hooks/useDashboardPreferences';

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

interface ChecklistWidgetProps {
  countryData: CountryData | null;
  projectId: number;
  onEdit?: () => void;
  onHide?: () => void;
  onResize?: (size: WidgetSize) => void;
  currentSize?: WidgetSize;
}

export default function ChecklistWidget({
  countryData,
  projectId,
  onEdit,
  onHide,
  onResize,
  currentSize,
}: ChecklistWidgetProps) {
  const { t } = useTranslation();
  const { progress, updateStep, isLoading } = useChecklistProgress(projectId);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const pendingRef = useRef<Set<string>>(new Set());

  const checklist = useMemo(() => {
    if (!countryData?.expatProjectTemplate) return [];

    return countryData.expatProjectTemplate.steps.map((step) => {
      const stepId = step.id.toString();
      const stepProgress = progress[stepId];

      const substeps = step.substeps?.map((sub) => ({
        ...sub,
        completed: stepProgress?.substeps?.[sub.id]?.completed || false,
      }));

      const completed = substeps && substeps.length > 0
        ? substeps.every((s) => s.completed)
        : stepProgress?.completed || false;

      return {
        id: stepId,
        title: step.title,
        completed,
        category: step.category,
        substeps,
      };
    });
  }, [countryData, progress]);

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
      if (item.substeps && item.substeps.length > 0) {
        await Promise.all(
          item.substeps.map((sub) =>
            updateStep({ stepId: id, substepId: sub.id, completed: newCompleted })
          )
        );
      } else {
        await updateStep({ stepId: id, completed: newCompleted });
      }
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

    const key = `${itemId}.${substepId}`;
    if (pendingRef.current.has(key)) return;

    const item = checklist.find((i) => i.id === itemId);
    const substep = item?.substeps?.find((s) => s.id === substepId);
    if (!substep) return;

    pendingRef.current.add(key);

    try {
      await updateStep({
        stepId: itemId,
        substepId,
        completed: !substep.completed,
      });
    } catch (error) {
      console.error('Error updating substep:', error);
    } finally {
      pendingRef.current.delete(key);
    }
  }, [checklist, updateStep]);

  const { totalSteps, completedSteps } = useMemo(() => {
    return checklist.reduce(
      (acc, item) => {
        if (item.substeps && item.substeps.length > 0) {
          acc.totalSteps += item.substeps.length;
          acc.completedSteps += item.substeps.filter((sub) => sub.completed).length;
        } else {
          acc.totalSteps += 1;
          acc.completedSteps += item.completed ? 1 : 0;
        }
        return acc;
      },
      { totalSteps: 0, completedSteps: 0 },
    );
  }, [checklist]);

  const completionPercentage =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  if (isLoading) {
    return (
      <Widget title={t('dashboard.personalized.widgets.checklist.title')} onEdit={onEdit} onHide={onHide} onResize={onResize} currentSize={currentSize}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Widget>
    );
  }

  if (!countryData || checklist.length === 0) {
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
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t('dashboard.personalized.widgets.checklist.progression')}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {t('dashboard.personalized.widgets.checklist.completed', {
                completed: completedSteps,
                total: totalSteps,
                percentage: Math.round(completionPercentage),
              })}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-900 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5 max-h-[28rem] overflow-y-auto pr-1">
          {checklist.map((item) => {
            const isExpanded = expandedIds.has(item.id);
            const substepsDone = item.substeps?.filter((s) => s.completed).length ?? 0;
            const substepsTotal = item.substeps?.length ?? 0;

            return (
              <div key={item.id} className="rounded-lg border border-gray-100 overflow-hidden">
                <div
                  className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
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

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                        {t(CATEGORY_LABELS[item.category] || item.category)}
                      </span>
                      {substepsTotal > 0 && (
                        <span className="text-[11px] text-gray-400">
                          {substepsDone}/{substepsTotal}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.substeps && item.substeps.length > 0 && (
                    <button
                      onClick={(e) => toggleExpand(item.id, e)}
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

                {isExpanded && item.substeps && item.substeps.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-3 py-2 space-y-1">
                    {item.substeps.map((substep) => (
                      <div
                        key={substep.id}
                        onClick={(e) => toggleSubstep(item.id, substep.id, e)}
                        className={`flex items-start gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-colors ${
                          substep.completed
                            ? 'bg-gray-100/60'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className="flex-shrink-0 mt-0.5">
                          {substep.completed ? (
                            <CheckCircle className="w-3.5 h-3.5 text-gray-900" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-gray-300" />
                          )}
                        </span>
                        <span className={`text-xs leading-relaxed ${
                          substep.completed ? 'text-gray-400 line-through' : 'text-gray-600'
                        }`}>
                          {substep.label}
                          {substep.isOptional && (
                            <span className="ml-1 text-gray-400 italic">
                              ({t('dashboard.personalized.widgets.checklist.optional')})
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Widget>
  );
}