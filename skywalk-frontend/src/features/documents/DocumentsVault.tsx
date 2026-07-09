import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  FolderLock,
  FileText,
  Image as ImageIcon,
  UploadCloud,
  Download,
  Trash2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import {
  documentsApi,
  ACCEPTED_MIME,
  MAX_SIZE_BYTES,
  DOC_TYPES,
  type UserDocument,
} from '../../api/documents';

interface Props {
  projectId: number;
  /** Si fourni, le coffre est celui d'une étape précise (rattachement). */
  procedureTrackingId?: number;
  /** Variante compacte (pour intégration dans une étape de checklist). */
  compact?: boolean;
}

const fmtSize = (b: number) =>
  b < 1024
    ? `${b} o`
    : b < 1024 * 1024
      ? `${(b / 1024).toFixed(0)} Ko`
      : `${(b / (1024 * 1024)).toFixed(1)} Mo`;

const isImage = (m: string) => m.startsWith('image/');

export default function DocumentsVault({ projectId, procedureTrackingId, compact }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [docType, setDocType] = useState<string>('passport');

  const typeLabel = (key: string) => t(`documents.types.${key}`, { defaultValue: key });

  const queryKey = procedureTrackingId
    ? ['documents', 'procedure', procedureTrackingId]
    : ['documents', 'project', projectId];

  const { data: docs = [], isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      procedureTrackingId
        ? documentsApi.listByProcedure(procedureTrackingId)
        : documentsApi.listByProject(projectId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const uploadMutation = useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) =>
      documentsApi.upload(projectId, file, type, procedureTrackingId),
    onSuccess: () => {
      invalidate();
      toast.success(t('documents.added'));
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || t('documents.uploadError')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentsApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success(t('documents.deleted'));
    },
    onError: () => toast.error(t('documents.deleteError')),
  });

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!ACCEPTED_MIME.includes(file.type)) {
      toast.error(t('documents.formatError'));
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(t('documents.sizeError'));
      return;
    }
    uploadMutation.mutate({ file, type: docType });
  };

  const handleDownload = async (doc: UserDocument) => {
    try {
      await documentsApi.download(doc);
    } catch {
      toast.error(t('documents.downloadError'));
    }
  };

  return (
    <div className={compact ? '' : 'bg-white rounded-2xl border border-gray-100 shadow-sm p-6'}>
      {!compact && (
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[#5EA3C0]/10 rounded-xl text-[#5EA3C0]">
            <FolderLock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('documents.title')}</h2>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {t('documents.subtitle')}
            </p>
          </div>
        </div>
      )}

      {/* Type de document + zone d'upload */}
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <label className="sr-only" htmlFor={`doctype-${projectId}-${procedureTrackingId ?? 'p'}`}>
          {t('documents.typeLabel')}
        </label>
        <select
          id={`doctype-${projectId}-${procedureTrackingId ?? 'p'}`}
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:border-[#5EA3C0] sm:w-56"
        >
          {DOC_TYPES.map((k) => (
            <option key={k} value={k}>
              {typeLabel(k)}
            </option>
          ))}
        </select>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors py-4 px-3 ${
            dragOver ? 'border-[#5EA3C0] bg-[#5EA3C0]/5' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {uploadMutation.isPending ? (
            <Loader2 className="w-5 h-5 text-[#5EA3C0] animate-spin" />
          ) : (
            <UploadCloud className="w-5 h-5 text-gray-400" />
          )}
          <div className="text-left">
            <p className="text-sm text-gray-600">
              {uploadMutation.isPending ? t('documents.uploading') : t('documents.dropzone')}
            </p>
            <p className="text-[11px] text-gray-400">{t('documents.constraints')}</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {/* Liste */}
      <div className="mt-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-4 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : docs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">{t('documents.empty')}</p>
        ) : (
          docs.map((doc) => (
            <div
              key={doc.idDocument}
              className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5 hover:bg-gray-50"
            >
              <div
                className={`p-2 rounded-lg flex-shrink-0 ${
                  isImage(doc.mimeType)
                    ? 'bg-purple-50 text-purple-500'
                    : 'bg-red-50 text-red-500'
                }`}
              >
                {isImage(doc.mimeType) ? (
                  <ImageIcon className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {typeLabel(doc.docType)}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {doc.originalName} · {fmtSize(doc.sizeBytes)} ·{' '}
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDownload(doc)}
                className="p-1.5 text-gray-400 hover:text-[#5EA3C0] hover:bg-[#5EA3C0]/10 rounded-lg transition-colors"
                title={t('documents.download')}
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteMutation.mutate(doc.idDocument)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t('documents.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
