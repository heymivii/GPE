import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Calendar, Clock, Trash2, Edit } from 'lucide-react';
import { expatriationProjectApi } from '../../../api/expatriation-project';
import type { ExpatriationProject } from '../../../types/expatriation-project';

const PROJECT_STATUS_LABELS = {
  planning: 'En planification',
  active: 'Actif',
  completed: 'Terminé',
  cancelled: 'Annulé',
  on_hold: 'En pause',
};

const PROJECT_STATUS_COLORS = {
  planning: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
  on_hold: 'bg-yellow-100 text-yellow-700',
};

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['expatriation-projects'],
    queryFn: expatriationProjectApi.getAll,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600">Impossible de charger vos projets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes projets d'expatriation</h1>
          <p className="text-gray-600 mt-2">
            Gérez tous vos projets d'expatriation en un seul endroit
          </p>
        </div>
        <Link
          to="/onboarding"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nouveau projet
        </Link>
      </div>

      {/* Projects Grid */}
      {projects && projects.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun projet pour le moment
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez votre aventure en créant votre premier projet d'expatriation
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Créer mon premier projet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <ProjectCard key={project.idProject} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: ExpatriationProject }) {
  const statusLabel = PROJECT_STATUS_LABELS[project.projectStatus];
  const statusColor = PROJECT_STATUS_COLORS[project.projectStatus];

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 border border-gray-200">
      {/* Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {statusLabel}
        </span>
        <div className="flex gap-2">
          <button
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-gray-900 mb-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-lg">
            Projet #{project.idProject}
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Destination: Pays ID {project.idDestinationCountry}
          {project.idDestinationCity && ` - Ville ID ${project.idDestinationCity}`}
        </p>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        {project.mainObjective && (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="capitalize">{project.mainObjective}</span>
          </div>
        )}
        {project.expectedDepartureDate && (
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Départ: {new Date(project.expectedDepartureDate).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-500 text-xs pt-2 border-t">
          <Calendar className="w-3 h-3" />
          <span>
            Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <Link
        to={`/dashboard?project=${project.idProject}`}
        className="mt-4 block w-full text-center px-4 py-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg transition-colors font-medium text-sm"
      >
        Voir les détails
      </Link>
    </div>
  );
}
