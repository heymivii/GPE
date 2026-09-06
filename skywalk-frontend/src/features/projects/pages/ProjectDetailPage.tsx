import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProject, useDeleteProject, useCompleteProject, useCancelProject, useReactivateProject, useUpdateProject } from '../hooks/useProjectMutations';
import { useQuery } from '@tanstack/react-query';
import { countryApi } from '../../../api/country';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocale } from '../../../data/supportedCountries';
// DOCUMENTS DÉSACTIVÉS : le coffre de documents n'est plus affiché sur le projet.
// import DocumentsVault from '../../documents/DocumentsVault';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Wallet, 
  Briefcase, GraduationCap, Heart, Globe, User, Users,
  CheckCircle2, AlertCircle, Trash2, Edit, Plane,
  Target, Flag, XCircle, RotateCcw, PartyPopper,
} from 'lucide-react';

const STATUS_STYLES = {
  planning: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: Calendar },
  active: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: Plane },
  completed: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: CheckCircle2 },
  cancelled: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: AlertCircle },
  on_hold: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: Clock },
};

const STATUS_LABEL_KEYS: Record<string, string> = {
  planning: 'projectDetail.statusPlanning',
  active: 'projectDetail.statusActive',
  completed: 'projectDetail.statusCompleted',
  cancelled: 'projectDetail.statusCancelled',
  on_hold: 'projectDetail.statusOnHold',
};

const OBJECTIVE_LABEL_KEYS: Record<string, string> = {
  work: 'projectDetail.objectiveWork',
  study: 'projectDetail.objectiveStudy',
  retirement: 'projectDetail.objectiveRetirement',
  adventure: 'projectDetail.objectiveAdventure',
  family_reunion: 'projectDetail.objectiveFamilyReunion',
  other: 'projectDetail.objectiveOther',
};

const TRAVEL_TYPE_LABEL_KEYS: Record<string, string> = {
  alone: 'projectDetail.travelAlone',
  couple: 'projectDetail.travelCouple',
  family: 'projectDetail.travelFamily',
  friends: 'projectDetail.travelFriends',
  other: 'projectDetail.travelOther',
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data: project, isLoading, isError } = useProject(Number(id));
  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: completeProject, isPending: isCompleting } = useCompleteProject();
  const { mutate: cancelProject, isPending: isCancelling } = useCancelProject();
  const { mutate: updateProject } = useUpdateProject();
  const { mutate: reactivateProject, isPending: isReactivating } = useReactivateProject();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [completeReason, setCompleteReason] = useState('');
  const [completeFeedback, setCompleteFeedback] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelDetails, setCancelDetails] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [showDateModal, setShowDateModal] = useState(false);
  const [newDepartureDate, setNewDepartureDate] = useState('');

  const { data: country } = useQuery({
    queryKey: ['country', project?.idDestinationCountry],
    queryFn: () => countryApi.getById(project!.idDestinationCountry),
    enabled: !!project?.idDestinationCountry,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('projectDetail.notFound')}</h2>
          <p className="text-gray-600 mb-6">{t('projectDetail.notFoundDesc')}</p>
          <button
            onClick={() => navigate('/projects')}
            className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            {t('projectDetail.backToProjects')}
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteProject(project.idProject, {
      onSuccess: () => {
        navigate('/projects');
      },
    });
  };

  const statusKey = project.projectStatus as keyof typeof STATUS_STYLES;
  const statusStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.planning;
  const StatusIcon = statusStyle.icon;
  const statusLabel = t(STATUS_LABEL_KEYS[statusKey] || STATUS_LABEL_KEYS.planning);

  const dateLocale = getLocale(i18n.language);

  const getObjectiveIcon = (objective?: string) => {
    switch (objective) {
      case 'work': return <Briefcase className="w-5 h-5" />;
      case 'study': return <GraduationCap className="w-5 h-5" />;
      case 'family_reunion': return <Heart className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const getTravelTypeIcon = (type?: string) => {
    switch (type) {
      case 'alone': return <User className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/projects" className="hover:text-blue-600 transition-colors">{t('projectDetail.projects')}</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{t('projectDetail.project')} #{project.idProject}</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/projects')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                aria-label={t('projectDetail.back', { defaultValue: 'Retour à mes projets' })}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  {country?.countryName || t('projectDetail.loading')}
                  {country?.flagUrl && (
                    <img src={country.flagUrl} alt={country.countryName} className="w-8 h-6 object-cover rounded shadow-sm" />
                  )}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {t('projectDetail.createdOn')} {new Date(project.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {project.projectStatus !== 'completed' && project.projectStatus !== 'cancelled' && (
                <>
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t('projectDetail.completeProject')}
                  </button>
                  <button
                    onClick={() => {
                      setNewDepartureDate(project.expectedDepartureDate?.split('T')[0] || '');
                      setShowDateModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <Calendar className="w-4 h-4" />
                    Date de départ
                  </button>
                  <button
                    onClick={() => navigate(`/onboarding/${project.idProject}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    {t('projectDetail.edit')}
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    {t('projectDetail.cancelProject')}
                  </button>
                </>
              )}
              {(project.projectStatus === 'completed' || project.projectStatus === 'cancelled') && (
                <button
                  onClick={() => setShowReactivateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('projectDetail.reactivate')}
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                {t('projectDetail.delete')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                {t('projectDetail.destination')}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('projectDetail.country')}</p>
                  <p className="font-medium text-gray-900">{country?.countryName || t('projectDetail.loading')}</p>
                </div>
                {project.idDestinationCity && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">{t('projectDetail.city')}</p>
                    <p className="font-medium text-gray-900">
                      {project.destinationCity?.name || `#${project.idDestinationCity}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-gray-500" />
                {t('projectDetail.generalInfo')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                    {getObjectiveIcon(project.mainObjective)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('projectDetail.objective')}</p>
                    <p className="font-medium text-gray-900">
                      {project.mainObjective && OBJECTIVE_LABEL_KEYS[project.mainObjective] 
                        ? t(OBJECTIVE_LABEL_KEYS[project.mainObjective]) 
                        : project.mainObjective || t('projectDetail.notDefined')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                    {getTravelTypeIcon(project.travelType)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('projectDetail.travelType')}</p>
                    <p className="font-medium text-gray-900">
                      {project.travelType && TRAVEL_TYPE_LABEL_KEYS[project.travelType]
                        ? t(TRAVEL_TYPE_LABEL_KEYS[project.travelType])
                        : project.travelType || t('projectDetail.notDefined')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('projectDetail.departureDate')}</p>
                    <p className="font-medium text-gray-900">
                      {project.expectedDepartureDate 
                        ? new Date(project.expectedDepartureDate).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })
                        : t('projectDetail.notDefinedFem')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('projectDetail.expectedDuration')}</p>
                    <p className="font-medium text-gray-900">
                      {project.expectedDuration 
                        ? (() => {
                            const months = project.expectedDuration
                            if (months <= 6) return t('projectDetail.less6months')
                            if (months <= 12) return t('projectDetail.6to12months')
                            if (months <= 36) return t('projectDetail.1to3years')
                            return t('projectDetail.more3years')
                          })()
                        : t('projectDetail.notDefinedFem')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {project.priorities && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Flag className="w-5 h-5 text-gray-500" />
                  {t('projectDetail.priorities')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.priorities.split(',').map((priority, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
                    >
                      {priority.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ===== DOCUMENTS DÉSACTIVÉS — coffre chiffré rattaché au projet =====
            <DocumentsVault projectId={project.idProject} />
            ===== FIN DOCUMENTS DÉSACTIVÉS ===== */}

          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('projectDetail.projectStatus')}</h2>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${statusStyle.color}`}>
                <StatusIcon className="w-5 h-5" />
                <span className="font-medium">{statusLabel}</span>
              </div>
            </div>

            {project.projectStatus === 'completed' && project.completedAt && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <PartyPopper className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-800">{t('projectDetail.completedInfoTitle')}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">{t('projectDetail.completedDate')}:</span>{' '}
                    <span className="text-gray-900">{new Date(project.completedAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  {project.completedReason && (
                    <div>
                      <span className="text-gray-600 font-medium">{t('projectDetail.completedReasonInfo')}:</span>{' '}
                      <span className="text-gray-900">{project.completedReason}</span>
                    </div>
                  )}
                  {project.completedFeedback && (
                    <div>
                      <span className="text-gray-600 font-medium">{t('projectDetail.completedFeedbackInfo')}:</span>{' '}
                      <span className="text-gray-900">{project.completedFeedback}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {project.projectStatus === 'cancelled' && project.cancelledAt && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-800">{t('projectDetail.cancelledInfoTitle')}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">{t('projectDetail.cancelledDate')}:</span>{' '}
                    <span className="text-gray-900">{new Date(project.cancelledAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  {project.cancellationReason && (
                    <div>
                      <span className="text-gray-600 font-medium">{t('projectDetail.cancelledReasonInfo')}:</span>{' '}
                      <span className="text-gray-900">{project.cancellationReason}</span>
                    </div>
                  )}
                  {project.cancellationDetails && (
                    <div>
                      <span className="text-gray-600 font-medium">{t('projectDetail.cancelledDetailsInfo')}:</span>{' '}
                      <span className="text-gray-900">{project.cancellationDetails}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-gray-500" />
                {t('projectDetail.housingBudget')}
              </h2>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {project.housingBudget ? `${project.housingBudget} €` : t('projectDetail.notDefined')}
              </div>
              <p className="text-sm text-gray-500">{t('projectDetail.perMonth')}</p>
            </div>

            {project.needsSupport && (
              <div className="bg-gray-800 rounded-xl shadow-sm p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t('projectDetail.support')}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {t('projectDetail.supportDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('projectDetail.deleteTitle')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('projectDetail.deleteDesc')}
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('projectDetail.deleteReasonLabel')}
              </label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              >
                <option value="">{t('projectDetail.selectReason')}</option>
                <option value="completed">{t('projectDetail.deleteReasonCompleted')}</option>
                <option value="abandoned">{t('projectDetail.deleteReasonAbandoned')}</option>
                <option value="duplicate">{t('projectDetail.deleteReasonDuplicate')}</option>
                <option value="test">{t('projectDetail.deleteReasonTest')}</option>
                <option value="other">{t('projectDetail.deleteReasonOther')}</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteReason(''); }}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                {t('projectDetail.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={!deleteReason}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('projectDetail.deleteForever')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCompleteModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PartyPopper className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('projectDetail.completeTitle')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('projectDetail.completeDesc')}
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectDetail.completeReasonLabel')} *
                </label>
                <select
                  value={completeReason}
                  onChange={(e) => setCompleteReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                >
                  <option value="">{t('projectDetail.selectReason')}</option>
                  <option value="successful">{t('projectDetail.completeReasonSuccessful')}</option>
                  <option value="partial">{t('projectDetail.completeReasonPartial')}</option>
                  <option value="returned">{t('projectDetail.completeReasonReturned')}</option>
                  <option value="other">{t('projectDetail.completeReasonOther')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectDetail.completeFeedbackLabel')}
                </label>
                <textarea
                  value={completeFeedback}
                  onChange={(e) => setCompleteFeedback(e.target.value)}
                  placeholder={t('projectDetail.completeFeedbackPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowCompleteModal(false); setCompleteReason(''); setCompleteFeedback(''); }}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                {t('projectDetail.cancel')}
              </button>
              <button
                onClick={() => {
                  completeProject(
                    { projectId: project.idProject, data: { reason: completeReason, feedback: completeFeedback || undefined } },
                    { onSuccess: () => { setShowCompleteModal(false); setCompleteReason(''); setCompleteFeedback(''); } },
                  );
                }}
                disabled={!completeReason || isCompleting}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompleting ? '...' : t('projectDetail.completeConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('projectDetail.cancelTitle')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('projectDetail.cancelDesc')}
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectDetail.cancelReasonLabel')} *
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                >
                  <option value="">{t('projectDetail.selectReason')}</option>
                  <option value="financial">{t('projectDetail.cancelReasonFinancial')}</option>
                  <option value="personal">{t('projectDetail.cancelReasonPersonal')}</option>
                  <option value="professional">{t('projectDetail.cancelReasonProfessional')}</option>
                  <option value="destination">{t('projectDetail.cancelReasonDestination')}</option>
                  <option value="timing">{t('projectDetail.cancelReasonTiming')}</option>
                  <option value="other">{t('projectDetail.cancelReasonOther')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectDetail.cancelDetailsLabel')}
                </label>
                <textarea
                  value={cancelDetails}
                  onChange={(e) => setCancelDetails(e.target.value)}
                  placeholder={t('projectDetail.cancelDetailsPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(''); setCancelDetails(''); }}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                {t('projectDetail.cancel')}
              </button>
              <button
                onClick={() => {
                  cancelProject(
                    { projectId: project.idProject, data: { reason: cancelReason, details: cancelDetails || undefined } },
                    { onSuccess: () => { setShowCancelModal(false); setCancelReason(''); setCancelDetails(''); } },
                  );
                }}
                disabled={!cancelReason || isCancelling}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? '...' : t('projectDetail.cancelConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReactivateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReactivateModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('projectDetail.reactivateTitle')}
            </h3>
            <p className="text-gray-600 mb-8">
              {t('projectDetail.reactivateDesc')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowReactivateModal(false)}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                {t('projectDetail.cancel')}
              </button>
              <button
                onClick={() => {
                  reactivateProject(project.idProject, {
                    onSuccess: () => setShowReactivateModal(false),
                  });
                }}
                disabled={isReactivating}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
              >
                {isReactivating ? '...' : t('projectDetail.reactivateConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modale modification date de départ */}
      {showDateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDateModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Date de départ</h3>
            <p className="text-sm text-gray-500 mb-4">
              Précisez votre date de départ pour voir les deadlines sur chaque étape de votre checklist.
            </p>
            <input
              type="date"
              value={newDepartureDate}
              onChange={e => setNewDepartureDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDateModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (!newDepartureDate || !project) return;
                  updateProject({
                    projectId: project.idProject,
                    data: { expectedDepartureDate: newDepartureDate }
                  });
                  setShowDateModal(false);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}