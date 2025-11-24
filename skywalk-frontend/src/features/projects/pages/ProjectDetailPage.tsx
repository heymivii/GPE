import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useDeleteProject } from '../hooks/useProjectMutations';
import { useState } from 'react';

const statusLabels: Record<string, string> = {
  planning: 'En planification',
  in_progress: 'En cours',
  completed: 'Complété',
  cancelled: 'Annulé',
};

const statusColors: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const objectiveLabels: Record<string, string> = {
  work: 'Travail',
  study: 'Études',
  retirement: 'Retraite',
  adventure: 'Aventure',
  family: 'Regroupement familial',
  other: 'Autre',
};

const travelTypeLabels: Record<string, string> = {
  permanent: 'Installation permanente',
  temporary: 'Séjour temporaire',
  exploratory: 'Voyage exploratoire',
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, isError } = useProject(Number(id));
  const { mutate: deleteProject } = useDeleteProject();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Projet introuvable</h2>
          <p className="text-red-600 mb-4">Le projet demandé n'existe pas ou vous n'y avez pas accès.</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour aux projets
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header avec actions */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2"
          >
            ← Retour aux projets
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Expatriation vers {project.destinationCountry?.countryName || 'Destination'}
          </h1>
          <p className="text-gray-500 mt-2">
            Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[project.projectStatus]}`}>
          {statusLabels[project.projectStatus]}
        </span>
      </div>

      {/* Informations principales */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations générales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Type de voyage</label>
            <p className="text-gray-900">{travelTypeLabels[project.travelType]}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Objectif principal</label>
            <p className="text-gray-900">{objectiveLabels[project.mainObjective]}</p>
          </div>
          {project.destinationCity && (
            <div>
              <label className="text-sm font-medium text-gray-600">Ville de destination</label>
              <p className="text-gray-900">{project.destinationCity.cityName}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-600">Durée prévue</label>
            <p className="text-gray-900">{project.expectedDuration} mois</p>
          </div>
          {project.expectedDepartureDate && (
            <div>
              <label className="text-sm font-medium text-gray-600">Date de départ prévue</label>
              <p className="text-gray-900">
                {new Date(project.expectedDepartureDate).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          )}
          {project.housingBudget && (
            <div>
              <label className="text-sm font-medium text-gray-600">Budget logement mensuel</label>
              <p className="text-gray-900">{project.housingBudget} €</p>
            </div>
          )}
        </div>
      </div>

      {/* Priorités */}
      {project.priorities && project.priorities.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Priorités</h2>
          <div className="flex flex-wrap gap-2">
            {project.priorities.map((priority, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {priority}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Besoin d'accompagnement */}
      {project.needsSupport && project.needsSupport.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Accompagnement souhaité</h2>
          <div className="flex flex-wrap gap-2">
            {project.needsSupport.map((need, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
              >
                {need}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(`/projects/${project.idProject}/edit`)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Modifier le projet
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          Supprimer le projet
        </button>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
