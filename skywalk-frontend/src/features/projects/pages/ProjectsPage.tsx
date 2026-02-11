import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Trash2, Edit, ArrowRight, Globe, Briefcase, GraduationCap, Heart, Users, User, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocale } from '../../../data/supportedCountries';
import { expatriationProjectApi } from '../../../api/expatriation-project';
import { countryApi } from '../../../api/country';
import { useDeleteProject } from '../hooks/useProjectMutations';
import type { ExpatriationProject } from '../../../types/expatriation-project';
import { PageHeader } from '../../../components/PageHeader';

const STATUS_LABEL_KEYS: Record<string, string> = {
  planning: 'projectDetail.statusPlanning',
  active: 'projectDetail.statusActive',
  completed: 'projectDetail.statusCompleted',
  cancelled: 'projectDetail.statusCancelled',
  on_hold: 'projectDetail.statusOnHold',
};

const PROJECT_STATUS_STYLES = {
  planning: 'bg-[#5EA3C0]/10 text-[#5EA3C0] ring-1 ring-[#5EA3C0]/20',
  active: 'bg-green-50 text-green-700 ring-1 ring-green-600/10',
  completed: 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/10',
  cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-600/10',
  on_hold: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
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

export default function ProjectsPage() {
  const { t } = useTranslation();
  const { data: projects, isLoading: isLoadingProjects, error } = useQuery({
    queryKey: ['expatriation-projects'],
    queryFn: expatriationProjectApi.getAll,
  });

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: countryApi.getAll,
  });

  const getCountryName = (id: number) => {
    return countries?.find(c => c.idCountry === id)?.countryName || t('projectsPage.countryFallback', { id });
  };

  const getCountryFlag = (id: number) => {
    return countries?.find(c => c.idCountry === id)?.flagUrl;
  };

  if (isLoadingProjects) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5EA3C0]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm border border-red-100">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('projectsPage.errorTitle')}</h2>
          <p className="text-sm text-gray-600 mb-6">{t('projectsPage.errorDesc')}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            {t('projectsPage.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <PageHeader 
        title={t('projectsPage.pageTitle')} 
        description={t('projectsPage.pageDesc')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
          </div>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t('projectsPage.newProject')}
          </Link>
        </div>

        {projects && projects.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('projectsPage.noProjects')}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
              {t('projectsPage.noProjectsDesc')}
            </p>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              {t('projectsPage.createProject')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <ProjectCard 
                key={project.idProject} 
                project={project} 
                countryName={getCountryName(project.idDestinationCountry)}
                countryFlag={getCountryFlag(project.idDestinationCountry)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, countryName, countryFlag }: { project: ExpatriationProject; countryName: string; countryFlag?: string }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { mutate: deleteProject } = useDeleteProject();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  
  const statusLabel = t(STATUS_LABEL_KEYS[project.projectStatus] || STATUS_LABEL_KEYS.planning);
  const statusStyle = PROJECT_STATUS_STYLES[project.projectStatus];

  const handleDelete = () => {
    deleteProject(project.idProject, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
      },
    });
  };

  const getObjectiveIcon = (objective?: string) => {
    switch (objective) {
      case 'work': return <Briefcase className="w-4 h-4" />;
      case 'study': return <GraduationCap className="w-4 h-4" />;
      case 'family_reunion': return <Heart className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getTravelTypeIcon = (type?: string) => {
    switch (type) {
      case 'alone': return <User className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <>
      <div className="group bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-200 flex flex-col h-full">
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                {countryFlag ? (
                  <img src={countryFlag} alt={countryName} className="w-full h-full object-cover" />
                ) : (
                  <MapPin className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-1" title={countryName}>
                  {countryName}
                </h3>
                <p className="text-xs text-gray-500">
                  {t('projectsPage.projectId', { id: project.idProject })}
                </p>
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                    <button
                      onClick={() => {
                        navigate(`/projects/${project.idProject}`);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowRight className="w-4 h-4" />
                      {t('projectsPage.viewDetails')}
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/onboarding/${project.idProject}`);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                      {t('projectsPage.edit')}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('projectsPage.delete')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mb-6">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}>
              {statusLabel}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {project.mainObjective && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-[#5EA3C0]/10 flex items-center justify-center text-[#5EA3C0] shrink-0">
                  {getObjectiveIcon(project.mainObjective)}
                </div>
                <span className="font-medium">
                  {OBJECTIVE_LABEL_KEYS[project.mainObjective] ? t(OBJECTIVE_LABEL_KEYS[project.mainObjective]) : project.mainObjective}
                </span>
              </div>
            )}
            
            {project.travelType && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  {getTravelTypeIcon(project.travelType)}
                </div>
                <span className="font-medium">
                  {TRAVEL_TYPE_LABEL_KEYS[project.travelType] ? t(TRAVEL_TYPE_LABEL_KEYS[project.travelType]) : project.travelType}
                </span>
              </div>
            )}

            {project.expectedDepartureDate && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="font-medium">
                  {new Date(project.expectedDepartureDate).toLocaleDateString(getLocale(i18n.language), { month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <Link
            to={`/dashboard/personalized?project=${project.idProject}`}
            className="flex items-center justify-between w-full text-sm font-medium text-[#5EA3C0] hover:text-[#4A8299] transition-colors"
          >
            {t('projectsPage.goToDashboard')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('projectsPage.deleteTitle')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('projectsPage.deleteDesc')}
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('projectDetail.deleteReasonLabel')}
              </label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {t('projectsPage.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={!deleteReason}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('projectsPage.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

