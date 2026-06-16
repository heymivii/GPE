import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../api/admin';
import { useState, useMemo } from 'react';
import { Search, Globe, User, Calendar, DollarSign, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProjects() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: projects = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: adminApi.getAllProjects,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ projectId, status }: { projectId: number; status: string }) =>
      adminApi.updateProjectStatus(projectId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Le statut du projet a été mis à jour.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la mise à jour du statut.';
      toast.error(msg);
    },
  });

  const filteredProjects = useMemo(() => {
    return projects.filter((p: any) => {
      const search = searchTerm.toLowerCase();
      const userEmail = p.user?.email?.toLowerCase() || '';
      const userName = `${p.user?.firstname || ''} ${p.user?.lastname || ''}`.toLowerCase();
      const country = p.destinationCountry?.countryName?.toLowerCase() || '';
      const city = p.destinationCity?.name?.toLowerCase() || '';
      return userEmail.includes(search) || userName.includes(search) || country.includes(search) || city.includes(search);
    });
  }, [projects, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EA3C0]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200">
        <h2 className="text-lg font-bold mb-2">Erreur de chargement</h2>
        <p>Impossible de charger la liste des projets. Veuillez réessayer ultérieurement.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const base = 'px-2.5 py-1 rounded-full text-xs font-semibold';
    switch (status.toLowerCase()) {
      case 'planning': return `${base} bg-yellow-100 text-yellow-800`;
      case 'active': return `${base} bg-blue-100 text-blue-800`;
      case 'completed': return `${base} bg-green-100 text-green-800`;
      case 'cancelled': return `${base} bg-red-100 text-red-800`;
      case 'on_hold': return `${base} bg-gray-100 text-gray-800`;
      default: return `${base} bg-indigo-100 text-indigo-800`;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planning': return 'Planification';
      case 'active': return 'Actif';
      case 'completed': return 'Complété';
      case 'cancelled': return 'Annulé';
      case 'on_hold': return 'En pause';
      default: return status;
    }
  };

  const getObjectiveLabel = (obj: string) => {
    switch (obj?.toLowerCase()) {
      case 'work': return 'Travailler';
      case 'study': return 'Étudier';
      case 'retire': return 'Retraite';
      case 'investment': return 'Investissement';
      case 'other': return 'Autre';
      default: return obj || 'Non spécifié';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestion des Projets</h1>
          <p className="text-gray-500 mt-1">Superviser et modifier les projets d'expatriation actifs sur SkyWalk.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 text-gray-600 text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex items-center max-w-md bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
        <Search className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
        <input
          type="text"
          placeholder="Rechercher par email, utilisateur, pays..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-0 outline-none text-sm text-gray-800 placeholder-gray-400 p-0 focus:ring-0"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">ID / Utilisateur</th>
                <th className="py-4 px-6">Destination</th>
                <th className="py-4 px-6">Détails Projet</th>
                <th className="py-4 px-6">Date de Départ</th>
                <th className="py-4 px-6">Statut actuel</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {filteredProjects.map((project: any) => (
                <tr key={project.idProject} className="hover:bg-gray-50/45 transition-colors">
                  {/* ID / User */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm">
                        #{project.idProject}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-950 truncate">
                          {project.user?.firstname ? `${project.user.firstname} ${project.user.lastname || ''}` : 'Utilisateur'}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <User className="w-3.5 h-3.5" />
                          {project.user?.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Destination */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#5EA3C0] flex-shrink-0" />
                      <span className="font-semibold text-gray-800">
                        {project.destinationCountry?.countryName || 'Pays inconnu'}
                      </span>
                    </div>
                    {project.destinationCity?.name && (
                      <p className="text-xs text-gray-400 ml-6 mt-0.5">
                        {project.destinationCity.name}
                      </p>
                    )}
                  </td>

                  {/* Details */}
                  <td className="py-4 px-6 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-semibold text-gray-700">{getObjectiveLabel(project.objective)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-gray-400">
                      {project.budget && (
                        <span className="flex items-center gap-0.5">
                          <DollarSign className="w-3 h-3" />
                          {parseFloat(project.budget).toLocaleString('fr-FR')} €/mois
                        </span>
                      )}
                      {project.expectedDuration && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {project.expectedDuration} mois
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Departure Date */}
                  <td className="py-4 px-6 text-gray-800 font-medium">
                    {project.expectedDepartureDate ? (
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(project.expectedDepartureDate).toLocaleDateString('fr-FR')}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Non planifié</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span className={getStatusBadge(project.status)}>
                      {getStatusLabel(project.status)}
                    </span>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="py-4 px-6 text-right">
                    <select
                      value={project.status}
                      disabled={updateStatusMutation.isPending}
                      onChange={(e) => updateStatusMutation.mutate({ projectId: project.idProject, status: e.target.value })}
                      className="bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 px-2 py-1.5 focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0] outline-none"
                    >
                      <option value="planning">Planification</option>
                      <option value="active">Actif</option>
                      <option value="completed">Complété</option>
                      <option value="cancelled">Annulé</option>
                      <option value="on_hold">En pause</option>
                    </select>
                  </td>
                </tr>
              ))}

              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Aucun projet ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
