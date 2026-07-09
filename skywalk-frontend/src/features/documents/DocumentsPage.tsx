import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  FileText,
  Image as ImageIcon,
  UploadCloud,
  Download,
  Trash2,
  Loader2,
  ShieldCheck,
  Search,
  Eye,
  X,
  FolderLock,
  MapPin,
} from 'lucide-react';
import {
  documentsApi,
  ACCEPTED_MIME,
  MAX_SIZE_BYTES,
  DOC_TYPES,
  type UserDocument,
} from '../../api/documents';
import { expatriationProjectApi } from '../../api/expatriation-project';
import { PageHeader } from '../../components/PageHeader';

const fmtSize = (b: number) =>
  b < 1024
    ? `${b} o`
    : b < 1024 * 1024
      ? `${(b / 1024).toFixed(0)} Ko`
      : `${(b / (1024 * 1024)).toFixed(1)} Mo`;

const isImage = (m: string) => m.startsWith('image/');

export default function DocumentsPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [docType, setDocType] = useState<string>('passport');
  const [projectId, setProjectId] = useState<string>(''); // '' = coffre personnel
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Aperçu : on garde le document + l'object-URL déchiffrée (révoquée à la fermeture).
  const [preview, setPreview] = useState<{ doc: UserDocument; url: string | null } | null>(
    null,
  );

  const typeLabel = (key: string) => t(`documents.types.${key}`, { defaultValue: key });
  const queryKey = ['documents', 'all'];

  const { data: docs = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => documentsApi.listAll(),
  });

  // Liste des projets pour rattacher (optionnellement) un document.
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: () => expatriationProjectApi.getAll(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const uploadMutation = useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) =>
      documentsApi.upload(file, type, {
        projectId: projectId ? Number(projectId) : undefined,
      }),
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

  const openPreview = async (doc: UserDocument) => {
    setPreview({ doc, url: null }); // ouvre la modale en état de chargement
    try {
      const url = await documentsApi.blobUrl(doc);
      setPreview({ doc, url });
    } catch {
      toast.error(t('documents.downloadError'));
      setPreview(null);
    }
  };

  // Révoque l'object-URL quand l'aperçu change ou que la page se démonte (anti-fuite mémoire).
  useEffect(() => {
    const url = preview?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [preview?.url]);

  // Fermeture de la modale à la touche Échap.
  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreview(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);

  const projectLabel = (doc: UserDocument): string | null => {
    if (!doc.project) return null;
    return (
      doc.project.destinationCountry?.countryName || `#${doc.project.idProject}`
    );
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs.filter((d) => {
      if (filterType !== 'all' && d.docType !== filterType) return false;
      if (!q) return true;
      return (
        d.originalName.toLowerCase().includes(q) ||
        typeLabel(d.docType).toLowerCase().includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs, search, filterType, i18n.language]);

  // Types réellement présents (pour ne montrer que des filtres utiles).
  const presentTypes = useMemo(
    () => Array.from(new Set(docs.map((d) => d.docType))),
    [docs],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={t('documents.page.title', { defaultValue: 'Mes documents' })}
        description={t('documents.page.subtitle', {
          defaultValue:
            'Votre coffre-fort personnel : passeport, visa, contrats… chiffrés et accessibles à tout moment.',
        })}
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          {t('documents.subtitle')}
        </span>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Carte d'upload */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[#5EA3C0]/10 rounded-xl text-[#5EA3C0]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              {t('documents.page.uploadTitle', { defaultValue: 'Ajouter un document' })}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-stretch gap-2">
            {/* Type */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="doc-type"
                className="text-[11px] font-medium text-gray-500"
              >
                {t('documents.typeLabel')}
              </label>
              <select
                id="doc-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="px-2.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:border-[#5EA3C0] sm:w-44"
              >
                {DOC_TYPES.map((k) => (
                  <option key={k} value={k}>
                    {typeLabel(k)}
                  </option>
                ))}
              </select>
            </div>

            {/* Projet (optionnel) */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="doc-project"
                className="text-[11px] font-medium text-gray-500"
              >
                {t('documents.page.projectLabel', { defaultValue: 'Projet (optionnel)' })}
              </label>
              <select
                id="doc-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="px-2.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:border-[#5EA3C0] sm:w-48"
              >
                <option value="">
                  {t('documents.page.noProject', { defaultValue: 'Aucun (personnel)' })}
                </option>
                {projects.map((p) => (
                  <option key={p.idProject} value={p.idProject}>
                    {p.destinationCountry?.countryName || `#${p.idProject}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropzone */}
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
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors py-3 px-3 sm:mt-[18px] ${
                dragOver
                  ? 'border-[#5EA3C0] bg-[#5EA3C0]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="w-5 h-5 text-[#5EA3C0] animate-spin" />
              ) : (
                <UploadCloud className="w-5 h-5 text-gray-400" />
              )}
              <div className="text-left">
                <p className="text-sm text-gray-600">
                  {uploadMutation.isPending
                    ? t('documents.uploading')
                    : t('documents.dropzone')}
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
        </div>

        {/* Barre d'outils : recherche + filtre par type */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('documents.page.searchPlaceholder', {
                defaultValue: 'Rechercher un document…',
              })}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#5EA3C0]"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#5EA3C0]"
          >
            <option value="all">
              {t('documents.page.filterAll', { defaultValue: 'Tous les types' })}
            </option>
            {presentTypes.map((k) => (
              <option key={k} value={k}>
                {typeLabel(k)}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {t('documents.page.count', {
              count: filtered.length,
              defaultValue: '{{count}} document(s)',
            })}
          </span>
        </div>

        {/* Liste */}
        {isLoading ? (
          <div className="flex justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : docs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <FolderLock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">{t('documents.empty')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {t('documents.page.noResults', {
                defaultValue: 'Aucun document ne correspond à votre recherche.',
              })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((doc) => {
              const label = projectLabel(doc);
              return (
                <div
                  key={doc.idDocument}
                  className="group bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col hover:shadow-md hover:border-gray-200 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-lg flex-shrink-0 ${
                        isImage(doc.mimeType)
                          ? 'bg-purple-50 text-purple-500'
                          : 'bg-red-50 text-red-500'
                      }`}
                    >
                      {isImage(doc.mimeType) ? (
                        <ImageIcon className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {typeLabel(doc.docType)}
                      </p>
                      <p className="text-xs text-gray-400 truncate" title={doc.originalName}>
                        {doc.originalName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {label ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5EA3C0] bg-[#5EA3C0]/10 px-2 py-0.5 rounded-full">
                        <MapPin className="w-3 h-3" />
                        {label}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {t('documents.page.personal', { defaultValue: 'Personnel' })}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400">
                      {fmtSize(doc.sizeBytes)} · {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1">
                    <button
                      onClick={() => openPreview(doc)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#5EA3C0] hover:bg-[#5EA3C0]/10 rounded-lg py-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {t('documents.page.preview', { defaultValue: 'Aperçu' })}
                    </button>
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modale d'aperçu */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {typeLabel(preview.doc.docType)}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {preview.doc.originalName}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleDownload(preview.doc)}
                  className="p-2 text-gray-500 hover:text-[#5EA3C0] hover:bg-[#5EA3C0]/10 rounded-lg transition-colors"
                  title={t('documents.download')}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title={t('documents.page.close', { defaultValue: 'Fermer' })}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center min-h-[50vh]">
              {!preview.url ? (
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              ) : isImage(preview.doc.mimeType) ? (
                <img
                  src={preview.url}
                  alt={preview.doc.originalName}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              ) : (
                <iframe
                  src={preview.url}
                  title={preview.doc.originalName}
                  className="w-full h-[80vh] bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
