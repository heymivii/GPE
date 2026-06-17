import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../api/admin';
import { destinationsApi } from '../../../api/destinations';
import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit2, Trash2, Globe, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CountryDestination } from '../../destinations/types';

export default function AdminProcedures() {
  const queryClient = useQueryClient();
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<any | null>(null);

  // Form Fields
  const [procedureType, setProcedureType] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('visa');
  const [stepOrder, setStepOrder] = useState(1);
  const [averageDelayDays, setAverageDelayDays] = useState(30);

  // Queries
  const { data: countries = [], isLoading: countriesLoading } = useQuery<CountryDestination[]>({
    queryKey: ['admin-countries'],
    queryFn: destinationsApi.getAll,
  });

  // Track selection using useEffect (onSuccess replacement for TanStack v5)
  useEffect(() => {
    if (countries.length > 0 && selectedCountryId === null) {
      setSelectedCountryId(countries[0].idCountry);
    }
  }, [countries, selectedCountryId]);

  const { data: procedures = [], isLoading: proceduresLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-procedures'],
    queryFn: () => adminApi.getAllProcedures(),
  });

  // Set initial country selection once loaded
  useMemo(() => {
    if (countries.length > 0 && selectedCountryId === null) {
      setSelectedCountryId(countries[0].idCountry);
    }
  }, [countries, selectedCountryId]);

  // Filter and sort procedures for the selected country
  const filteredProcedures = useMemo(() => {
    if (!selectedCountryId) return [];
    return procedures
      .filter((p: any) => p.country?.idCountry === selectedCountryId)
      .sort((a: any, b: any) => (a.stepOrder || 0) - (b.stepOrder || 0));
  }, [procedures, selectedCountryId]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: adminApi.createProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-procedures'] });
      queryClient.invalidateQueries({ queryKey: ['checklist-progress'] });
      toast.success('Démarche créée avec succès.');
      closeModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la création.';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: any }) => adminApi.updateProcedure(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-procedures'] });
      queryClient.invalidateQueries({ queryKey: ['checklist-progress'] });
      toast.success('Démarche mise à jour avec succès.');
      closeModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la modification.';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-procedures'] });
      queryClient.invalidateQueries({ queryKey: ['checklist-progress'] });
      toast.success('Démarche supprimée.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la suppression.';
      toast.error(msg);
    },
  });

  // Actions
  const openCreateModal = () => {
    setEditingProcedure(null);
    setProcedureType('');
    setDescription('');
    setCategory('visa');
    setStepOrder(filteredProcedures.length + 1);
    setAverageDelayDays(30);
    setModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProcedure(p);
    setProcedureType(p.procedureType);
    setDescription(p.description || '');
    setCategory(p.category || 'visa');
    setStepOrder(p.stepOrder || 1);
    setAverageDelayDays(p.averageDelayDays || 30);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProcedure(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountryId) return;

    const dto = {
      procedureType,
      description,
      category,
      stepOrder,
      averageDelayDays,
      countryId: selectedCountryId,
    };

    if (editingProcedure) {
      updateMutation.mutate({ id: editingProcedure.idAdminProcedure, dto });
    } else {
      createMutation.mutate(dto);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette démarche ?')) {
      deleteMutation.mutate(id);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'visa': return 'Visa';
      case 'pre-departure': return 'Avant départ';
      case 'administratif': return 'Administratif';
      case 'logement': return 'Logement';
      case 'sante': return 'Santé';
      case 'finance': return 'Finance';
      case 'arrival': return 'Arrivée';
      case 'integration': return 'Intégration';
      case 'vie-quotidienne': return 'Vie quotidienne';
      default: return cat;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'visa': return 'bg-orange-100 text-orange-800';
      case 'pre-departure': return 'bg-cyan-100 text-cyan-800';
      case 'administratif': return 'bg-purple-100 text-purple-800';
      case 'logement': return 'bg-emerald-100 text-emerald-800';
      case 'sante': return 'bg-rose-100 text-rose-800';
      case 'finance': return 'bg-yellow-100 text-yellow-800';
      case 'arrival': return 'bg-teal-100 text-teal-800';
      case 'integration': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestion des Démarches</h1>
          <p className="text-gray-500 mt-1">Gérer les étapes administratives de référence par pays de destination.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 text-gray-600 text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#5EA3C0] hover:bg-[#4891b0] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter une démarche
          </button>
        </div>
      </div>

      {/* Selector and Loading States */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Globe className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Pays cible :</span>
          {countriesLoading ? (
            <div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse"></div>
          ) : (
            <select
              value={selectedCountryId || ''}
              onChange={(e) => setSelectedCountryId(parseInt(e.target.value, 10))}
              className="bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 px-3 py-2 outline-none focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0]"
            >
              {countries.map((c: any) => (
                <option key={c.idCountry} value={c.idCountry}>
                  {c.countryName} ({c.isoCode})
                </option>
              ))}
            </select>
          )}
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {filteredProcedures.length} étape(s) configurée(s) pour ce pays.
        </span>
      </div>

      {/* Procedures Table */}
      {proceduresLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EA3C0]"></div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center">Ordre</th>
                  <th className="py-4 px-6 w-1/4">Démarche / Titre</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 w-32">Catégorie</th>
                  <th className="py-4 px-6 w-28 text-center">Délai estimé</th>
                  <th className="py-4 px-6 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-650">
                {filteredProcedures.map((proc: any) => (
                  <tr key={proc.idAdminProcedure} className="hover:bg-gray-50/45 transition-colors">
                    {/* Order */}
                    <td className="py-4 px-6 text-center font-bold text-gray-900 bg-gray-50/20">
                      {proc.stepOrder}
                    </td>

                    {/* Title */}
                    <td className="py-4 px-6 font-semibold text-gray-900">
                      {proc.procedureType}
                    </td>

                    {/* Description */}
                    <td className="py-4 px-6 text-gray-500 text-xs leading-relaxed max-w-sm truncate">
                      {proc.description || <span className="text-gray-300 italic">Aucune description</span>}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide whitespace-nowrap ${getCategoryColor(proc.category)}`}>
                        {getCategoryLabel(proc.category || '')}
                      </span>
                    </td>

                    {/* Delay */}
                    <td className="py-4 px-6 text-center text-gray-800 font-medium">
                      {proc.averageDelayDays || 30} jours
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(proc)}
                          disabled={isPending}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-[#5EA3C0] rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(proc.idAdminProcedure)}
                          disabled={isPending}
                          className="p-1.5 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProcedures.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      Aucune démarche configurée pour ce pays. Cliquez sur "Ajouter une démarche" pour commencer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal dialog for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingProcedure ? 'Modifier la démarche' : 'Ajouter une démarche'}
              </h2>
              <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Procedure Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Démarche / Titre</label>
                <input
                  type="text"
                  required
                  value={procedureType}
                  onChange={(e) => setProcedureType(e.target.value)}
                  placeholder="Ex: Demander le numéro de sécurité sociale"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0]"
                />
              </div>

              {/* Category, Order and Delay inline grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#5EA3C0]"
                  >
                    <option value="visa">Visa</option>
                    <option value="pre-departure">Avant départ</option>
                    <option value="administratif">Administratif</option>
                    <option value="logement">Logement</option>
                    <option value="sante">Santé</option>
                    <option value="finance">Finance</option>
                    <option value="arrival">Arrivée</option>
                    <option value="integration">Intégration</option>
                    <option value="vie-quotidienne">Vie quotidienne</option>
                  </select>
                </div>

                {/* Step Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Ordre d'affichage</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={stepOrder}
                    onChange={(e) => setStepOrder(parseInt(e.target.value, 10))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#5EA3C0]"
                  />
                </div>

                {/* Delay days */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Délai (jours)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={averageDelayDays}
                    onChange={(e) => setAverageDelayDays(parseInt(e.target.value, 10))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#5EA3C0]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Expliquez brièvement l'objet de cette démarche administrative..."
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0] resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-[#5EA3C0] hover:bg-[#4891b0] text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                >
                  {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
