import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

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
    mutationFn: (file: File) =>
      documentsApi.upload(projectId, file, procedureTrackingId),
    onSuccess: () => {
      invalidate();
      toast.success('Document ajouté');
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Échec de l'envoi"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentsApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success('Document supprimé');
    },
    onError: () => toast.error('Échec de la suppression'),
  });

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    // Validation côté client (meilleure UX que l'erreur serveur).
    if (!ACCEPTED_MIME.includes(file.type)) {
      toast.error('Format non autorisé (PDF, JPEG ou PNG)');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Fichier trop lourd (10 Mo max)');
      return;
    }
    uploadMutation.mutate(file);
  };

  const handleDownload = async (doc: UserDocument) => {
    try {
      await documentsApi.download(doc);
    } catch {
      toast.error('Téléchargement impossible');
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
            <h2 className="text-lg font-semibold text-gray-900">Mes documents</h2>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Chiffrés et accessibles à vous seul·e
            </p>
          </div>
        </div>
      )}

      {/* Zone d'upload */}
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
        className={`mt-3 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
          compact ? 'py-4' : 'py-6'
        } ${dragOver ? 'border-[#5EA3C0] bg-[#5EA3C0]/5' : 'border-gray-200 hover:border-gray-300'}`}
      >
        {uploadMutation.isPending ? (
          <Loader2 className="w-6 h-6 text-[#5EA3C0] animate-spin" />
        ) : (
          <UploadCloud className="w-6 h-6 text-gray-400" />
        )}
        <p className="text-sm text-gray-600">
          {uploadMutation.isPending ? 'Envoi…' : 'Glissez un fichier ou cliquez'}
        </p>
        <p className="text-[11px] text-gray-400">PDF, JPEG ou PNG · 10 Mo max</p>
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

      {/* Liste */}
      <div className="mt-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-4 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : docs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Aucun document pour l'instant.
          </p>
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
                <p className="text-sm font-medium text-gray-800 truncate">
                  {doc.originalName}
                </p>
                <p className="text-xs text-gray-400">
                  {fmtSize(doc.sizeBytes)} ·{' '}
                  {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button
                onClick={() => handleDownload(doc)}
                className="p-1.5 text-gray-400 hover:text-[#5EA3C0] hover:bg-[#5EA3C0]/10 rounded-lg transition-colors"
                title="Télécharger"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteMutation.mutate(doc.idDocument)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
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
