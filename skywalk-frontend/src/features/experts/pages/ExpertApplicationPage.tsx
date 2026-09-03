import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  FileUp,
  Loader2,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { expertApplicationsApi } from '../../../api/experts';
import { destinationsApi } from '../../../api/destinations';

const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo, aligné sur la limite du serveur
const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png'];
const MIN_MOTIVATION = 50;

export default function ExpertApplicationPage() {
  const queryClient = useQueryClient();

  const [expertTitle, setExpertTitle] = useState('');
  const [motivation, setMotivation] = useState('');
  const [countryId, setCountryId] = useState<string>('');
  const [diploma, setDiploma] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const { data: countries = [] } = useQuery({
    queryKey: ['destinations-list'],
    queryFn: destinationsApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const { data: mine = [], isLoading: loadingMine } = useQuery({
    queryKey: ['expert-applications-mine'],
    queryFn: expertApplicationsApi.mine,
  });

  const pending = mine.find((a) => a.status === 'pending');
  const lastDecision = mine.find((a) => a.status !== 'pending');

  const submit = useMutation({
    mutationFn: () =>
      expertApplicationsApi.create({
        expertTitle: expertTitle.trim(),
        motivation: motivation.trim(),
        countryId: countryId ? Number(countryId) : undefined,
        diploma: diploma as File,
      }),
    onSuccess: () => {
      toast.success('Candidature envoyée — elle part en vérification.');
      // On NE redirige pas : la page bascule sur le suivi « en attente ».
      // Rediriger vers /experts renvoyait l'utilisateur sur une liste où rien
      // n'indiquait que sa demande avait bien été enregistrée.
      queryClient.invalidateQueries({ queryKey: ['expert-applications-mine'] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "L'envoi de la candidature a échoué");
    },
  });

  const pickFile = (file: File | null) => {
    setFileError(null);
    if (!file) {
      setDiploma(null);
      return;
    }
    // Mêmes règles que le serveur, pour échouer ici plutôt qu'après l'upload.
    if (!ACCEPTED.includes(file.type)) {
      setFileError('Format non accepté — PDF, JPEG ou PNG uniquement.');
      setDiploma(null);
      return;
    }
    if (file.size > MAX_SIZE) {
      setFileError('Fichier trop lourd — 10 Mo maximum.');
      setDiploma(null);
      return;
    }
    setDiploma(file);
  };

  const motivationTooShort = motivation.trim().length < MIN_MOTIVATION;
  const canSubmit =
    expertTitle.trim().length >= 3 && !motivationTooShort && !!diploma && !submit.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Devenir expert vérifié"
        description="Vous accompagnez des expatriés à titre professionnel ? Déposez votre candidature : elle est examinée par notre équipe, justificatif à l'appui."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link
          to="/experts"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux experts
        </Link>

        {/* D'où viennent les experts — la question posée en recette. */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-gray-900">
            <ShieldCheck className="w-5 h-5 text-[#5EA3C0]" />
            Comment un expert est vérifié
          </h2>
          <ol className="mt-4 space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5EA3C0]/10 text-[#5EA3C0] font-semibold text-xs flex items-center justify-center">
                1
              </span>
              Le professionnel dépose sa candidature avec une pièce justificative
              (diplôme, attestation d'inscription à un ordre, certification).
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5EA3C0]/10 text-[#5EA3C0] font-semibold text-xs flex items-center justify-center">
                2
              </span>
              Notre équipe contrôle la pièce et le parcours déclaré. Le fichier est
              chiffré et n'est jamais rendu public.
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5EA3C0]/10 text-[#5EA3C0] font-semibold text-xs flex items-center justify-center">
                3
              </span>
              Une fois validé, le profil apparaît dans « Experts vérifiés » avec son
              badge. Le statut peut être retiré à tout moment.
            </li>
          </ol>
        </section>

        {loadingMine ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#5EA3C0]" />
          </div>
        ) : pending ? (
          <section className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/70 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">
                <Clock className="w-3.5 h-3.5" /> En attente
              </span>
              <p className="font-semibold text-amber-900">
                Votre candidature a bien été enregistrée
              </p>
            </div>

            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-amber-700/70">Spécialité déclarée</dt>
                <dd className="font-medium text-amber-900">{pending.expertTitle}</dd>
              </div>
              <div>
                <dt className="text-amber-700/70">Déposée le</dt>
                <dd className="font-medium text-amber-900">
                  {new Date(pending.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-amber-700/70">Justificatif transmis</dt>
                <dd className="font-medium text-amber-900">{pending.diplomaOriginalName}</dd>
              </div>
              {pending.country?.countryName && (
                <div>
                  <dt className="text-amber-700/70">Pays</dt>
                  <dd className="font-medium text-amber-900">{pending.country.countryName}</dd>
                </div>
              )}
            </dl>

            {/* Où en est le dossier — évite d'avoir à deviner ce qu'il reste à faire. */}
            <ol className="mt-5 space-y-2.5 border-t border-amber-200 pt-4 text-sm">
              <li className="flex items-center gap-2 text-amber-900">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                Demande reçue
              </li>
              <li className="flex items-center gap-2 font-semibold text-amber-900">
                <Clock className="w-4 h-4 flex-shrink-0 animate-pulse" />
                Vérification du justificatif par notre équipe — en cours
              </li>
              <li className="flex items-center gap-2 text-amber-700/60">
                <Circle className="w-4 h-4 flex-shrink-0" />
                Décision, affichée sur cette page
              </li>
            </ol>

            <p className="mt-4 text-sm text-amber-700">
              Inutile de renvoyer une demande : une seule candidature est examinée à la fois.
            </p>
          </section>
        ) : (
          <>
            {lastDecision?.status === 'rejected' && (
              <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="flex items-center gap-2 font-semibold text-red-800">
                  <XCircle className="w-5 h-5" /> Candidature précédente refusée
                </p>
                {lastDecision.reviewNote && (
                  <p className="text-sm text-red-700 mt-1">{lastDecision.reviewNote}</p>
                )}
                <p className="text-sm text-red-700/80 mt-1">
                  Vous pouvez postuler à nouveau en tenant compte de ce retour.
                </p>
              </section>
            )}

            {lastDecision?.status === 'approved' && (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="flex items-center gap-2 font-semibold text-emerald-800">
                  <BadgeCheck className="w-5 h-5" /> Vous êtes déjà expert vérifié
                </p>
              </section>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canSubmit) submit.mutate();
              }}
              className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5"
            >
              <div>
                <label htmlFor="expertTitle" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Votre spécialité <span className="text-red-500">*</span>
                </label>
                <input
                  id="expertTitle"
                  value={expertTitle}
                  onChange={(e) => setExpertTitle(e.target.value)}
                  maxLength={120}
                  placeholder="Ex : Avocate en droit de l'immigration"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#5EA3C0] outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="countryId" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Pays sur lequel vous intervenez
                </label>
                <select
                  id="countryId"
                  value={countryId}
                  onChange={(e) => setCountryId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#5EA3C0] outline-none"
                >
                  <option value="">Aucun pays en particulier</option>
                  {countries.map((c: any) => (
                    <option key={c.idCountry} value={c.idCountry}>
                      {c.countryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="motivation" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Votre parcours <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="motivation"
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  rows={6}
                  maxLength={4000}
                  placeholder="Formation, années d'expérience, types d'accompagnement proposés…"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#5EA3C0] outline-none resize-y"
                  required
                />
                <p className={`text-xs mt-1 ${motivationTooShort ? 'text-gray-500' : 'text-emerald-600'}`}>
                  {motivation.trim().length} / {MIN_MOTIVATION} caractères minimum
                </p>
              </div>

              <div>
                <span className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Justificatif <span className="text-red-500">*</span>
                </span>
                <label
                  htmlFor="diploma"
                  className="flex flex-col items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#5EA3C0] hover:bg-[#5EA3C0]/5 transition-colors"
                >
                  <FileUp className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {diploma ? diploma.name : 'Choisir un fichier (PDF, JPEG ou PNG — 10 Mo max)'}
                  </span>
                  <input
                    id="diploma"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="sr-only"
                    onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {fileError && <p className="text-xs text-red-600 mt-1.5">{fileError}</p>}
                <p className="text-xs text-gray-500 mt-1.5">
                  Diplôme, attestation d'inscription à un ordre ou certification
                  professionnelle. Le fichier est chiffré et seul un modérateur y accède.
                </p>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#5EA3C0] hover:bg-[#4891b0] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                {submit.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Envoi…
                  </>
                ) : (
                  'Envoyer ma candidature'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
