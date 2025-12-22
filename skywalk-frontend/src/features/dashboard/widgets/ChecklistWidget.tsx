import Widget from './Widget';
import { CheckCircle, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { CountryData } from '../../../hooks/useCountryData';
import { useChecklistProgress } from '../hooks/useChecklistProgress';
import { useTranslation } from 'react-i18next';

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  substeps?: Array<{
    id: string;
    label: string;
    isOptional: boolean;
    completed?: boolean;
  }>;
  expanded?: boolean;
}

interface ChecklistWidgetProps {
  countryData: CountryData | null;
  projectId: number;
  onEdit?: () => void;
  onHide?: () => void;
}

export default function ChecklistWidget({
  countryData,
  projectId,
  onEdit,
  onHide,
}: ChecklistWidgetProps) {
  const { t } = useTranslation()
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const { progress, updateStep, isLoading } = useChecklistProgress(projectId);

  useEffect(() => {
    if (!countryData?.expatProjectTemplate) {
      return;
    }

    const steps = countryData.expatProjectTemplate.steps.map((step) => {
      const stepProgress = progress[step.id.toString()];

      return {
        id: step.id.toString(),
        title: step.title,
        completed: stepProgress?.completed || false,
        category: step.category,
        substeps: step.substeps?.map((sub) => ({
          ...sub,
          completed: stepProgress?.substeps?.[sub.id]?.completed || false,
        })),
        expanded: false,
      };
    });

    setChecklist(steps);
  }, [countryData, progress]);

  const toggleItem = async (id: string) => {
    const item = checklist.find((i) => i.id === id);
    if (!item) return;

    const newCompletedStatus = !item.completed;
    const previousState = [...checklist];

    setChecklist((prev) =>
      prev.map((listItem) =>
        listItem.id === id
          ? {
              ...listItem,
              completed: newCompletedStatus,
              substeps: listItem.substeps?.map((sub) => ({
                ...sub,
                completed: newCompletedStatus,
              })),
            }
          : listItem
      )
    );

    try {
      if (item.substeps && item.substeps.length > 0) {
        const lastSubstep = item.substeps[item.substeps.length - 1];
        await updateStep({
          stepId: id,
          substepId: lastSubstep.id,
          completed: newCompletedStatus,
        });
        
        for (let i = 0; i < item.substeps.length - 1; i++) {
          await updateStep({
            stepId: id,
            substepId: item.substeps[i].id,
            completed: newCompletedStatus,
          });
        }
      } else {
        await updateStep({
          stepId: id,
          completed: newCompletedStatus,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'étape:', error);
      setChecklist(previousState);
    }
  };

  const toggleSubstep = async (
    itemId: string,
    substepId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    const item = checklist.find((i) => i.id === itemId);
    const substep = item?.substeps?.find((s) => s.id === substepId);
    if (!substep) return;

    const newCompletedStatus = !substep.completed;
    const previousState = [...checklist];

    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === itemId && item.substeps) {
          const updatedSubsteps = item.substeps.map((sub) =>
            sub.id === substepId
              ? { ...sub, completed: newCompletedStatus }
              : sub,
          );
          const allSubstepsCompleted = updatedSubsteps.every(
            (sub) => sub.completed,
          );
          return {
            ...item,
            substeps: updatedSubsteps,
            completed: allSubstepsCompleted,
          };
        }
        return item;
      }),
    );

    try {
      await updateStep({
        stepId: itemId,
        substepId,
        completed: newCompletedStatus,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la sous-étape:', error);
      setChecklist(previousState);
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, expanded: !item.expanded } : item,
      ),
    );
  };

  const { totalSteps, completedSteps } = checklist.reduce(
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
    { totalSteps: 0, completedSteps: 0 }
  );
  
  const completionPercentage =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  if (isLoading) {
    return (
      <Widget title={t('dashboard.personalized.widgets.checklist.title')} onEdit={onEdit} onHide={onHide}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Widget>
    );
  }

  if (!countryData || checklist.length === 0) {
    return (
      <Widget title={t('dashboard.personalized.widgets.checklist.title')} onEdit={onEdit} onHide={onHide}>
        <div className="text-center py-8 text-gray-500">
          <p>{t('dashboard.personalized.widgets.checklist.emptyState')}</p>
        </div>
      </Widget>
    )
  }

  return (
    <Widget title={t('dashboard.personalized.widgets.checklist.title')} onEdit={onEdit} onHide={onHide}>
      <div className="space-y-4">
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t('dashboard.personalized.widgets.checklist.progression')}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {t('dashboard.personalized.widgets.checklist.completed', {
                completed: completedSteps,
                total: totalSteps,
                percentage: Math.round(completionPercentage)
              })}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {checklist.map((item) => (
            <div key={item.id} className="space-y-1">
              <div 
                className={`flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer
                  ${item.completed ? 'opacity-75' : ''}
                `}
                onClick={() => toggleItem(item.id)}
              >
                <button className="mt-0.5">
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}>
                    {item.title}
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded capitalize">
                      {item.category}
                    </span>
                    {item.substeps && item.substeps.length > 0 && (
                      <button 
                        onClick={(e) => toggleExpand(item.id, e)}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                      >
                        {item.expanded ? (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            {t('dashboard.personalized.widgets.checklist.hide')}
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-3 h-3" />
                            {t('dashboard.personalized.widgets.checklist.show', { count: item.substeps.length })}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {item.expanded && item.substeps && item.substeps.length > 0 && (
                <div className="ml-8 space-y-1 pb-2">
                  {item.substeps.map((substep) => (
                    <div 
                      key={substep.id}
                      onClick={(e) => {
                        e.stopPropagation(); // Empêche le clic de remonter au parent
                        toggleSubstep(item.id, substep.id, e);
                      }}
                      className={`flex items-start gap-2 p-2 text-xs rounded cursor-pointer hover:bg-gray-100 transition-colors
                        ${substep.completed ? 'bg-green-50' : 'bg-gray-50'}
                      `}
                    >
                      <button className="flex-shrink-0 mt-0.5">
                        {substep.completed ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                          <Circle className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                      <span className={`flex-1 ${substep.completed ? 'text-gray-500 line-through' : 'text-gray-600'}`}>
                        {substep.label}
                        {substep.isOptional && (
                          <span className="ml-1 text-gray-400 italic">{t('dashboard.personalized.widgets.checklist.optional')}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Widget>
  )
}