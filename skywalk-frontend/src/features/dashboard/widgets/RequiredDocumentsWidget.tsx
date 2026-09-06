import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FolderLock, Check, Circle, ArrowRight, Loader2 } from 'lucide-react';
import Widget from './Widget';
import type { WidgetSize } from '../hooks/useDashboardPreferences';
import { documentsApi } from '../../../api/documents';

interface Props {
  projectId?: number;
  onHide?: () => void;
  onResize?: (size: WidgetSize) => void;
  currentSize?: WidgetSize;
}

// Documents-clés d'une expatriation (le libellé est traduit via documents.types.*).
const KEY_DOCS = [
  'passport',
  'visa',
  'id_card',
  'residence_permit',
  'work_contract',
  'birth_certificate',
] as const;

export default function RequiredDocumentsWidget({
  projectId,
  onHide,
  onResize,
  currentSize,
}: Props) {
  const { t } = useTranslation();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['documents', 'project', projectId],
    queryFn: () => documentsApi.listByProject(projectId as number),
    enabled: !!projectId,
  });

  const present = useMemo(() => new Set(docs.map((d) => d.docType)), [docs]);
  const doneCount = KEY_DOCS.filter((k) => present.has(k)).length;
  const typeLabel = (k: string) => t(`documents.types.${k}`, { defaultValue: k });

  return (
    <Widget
      title={t('dashboard.personalized.widgets.requiredDocuments.title', { defaultValue: 'Documents requis' })}
      subtitle={t('dashboard.personalized.widgets.requiredDocuments.count', {
        done: doneCount,
        total: KEY_DOCS.length,
        defaultValue: '{{done}}/{{total}} documents-clés',
      })}
      icon={FolderLock}
      iconColor="text-green-600"
      onHide={onHide}
      onResize={onResize}
      currentSize={currentSize}
    >
      {!projectId ? (
        <p className="text-sm text-gray-500 text-center py-6 flex-grow">
          {t('dashboard.personalized.widgets.requiredDocuments.noProject', {
            defaultValue: 'Sélectionnez un projet pour suivre vos documents.',
          })}
        </p>
      ) : isLoading ? (
        <div className="flex justify-center py-6 text-gray-500 flex-grow">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col flex-grow">
          {/* Barre de progression */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(doneCount / KEY_DOCS.length) * 100}%` }}
            />
          </div>

          <ul className="space-y-1.5">
            {KEY_DOCS.map((k) => {
              const has = present.has(k);
              return (
                <li key={k} className="flex items-center gap-2 text-sm">
                  {has ? (
                    <span className="p-0.5 rounded-full bg-green-100 text-green-600 flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                  <span className={has ? 'text-gray-700' : 'text-gray-500'}>{typeLabel(k)}</span>
                </li>
              );
            })}
          </ul>

          <Link
            to="/documents"
            className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-ink hover:underline"
          >
            {doneCount < KEY_DOCS.length
              ? t('dashboard.personalized.widgets.requiredDocuments.add', { defaultValue: 'Ajouter des documents' })
              : t('dashboard.personalized.widgets.requiredDocuments.manage', { defaultValue: 'Gérer mes documents' })}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </Widget>
  );
}
