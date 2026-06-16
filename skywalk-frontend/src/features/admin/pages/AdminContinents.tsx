import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { continentApi } from '../../../api/continent';
import { useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminContinents() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContinent, setEditingContinent] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [isoCode, setIsoCode] = useState('');

  // Fetch Continents
  const { data: continents = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-continents'],
    queryFn: continentApi.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: continentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-continents'] });
      toast.success('Continent créé avec succès.');
      closeModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la création.';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => continentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-continents'] });
      toast.success('Continent mis à jour avec succès.');
      closeModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la modification.';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: continentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-continents'] });
      toast.success('Continent supprimé.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la suppression.';
      toast.error(msg);
    },
  });

  const openCreateModal = () => {
    setEditingContinent(null);
    setName('');
    setIsoCode('');
    setModalOpen(true);
  };

  const openEditModal = (continent: any) => {
    setEditingContinent(continent);
    setName(continent.name);
    setIsoCode(continent.isoCode || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingContinent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Le nom est requis.');
      return;
    }

    const payload = {
      name: name.trim(),
      isoCode: isoCode.trim() || undefined,
    };

    if (editingContinent) {
      updateMutation.mutate({ id: editingContinent.idContinent, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce continent ? Tous les pays associés pourraient être impactés.')) {
      deleteMutation.mutate(id);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestion des Continents</h1>
          <p className="text-gray-500 mt-1">Gérer les continents de référence pour la catégorisation géographique des destinations.</p>
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
            Ajouter un continent
          </button>
        </div>
      </div>

      {/* Continents Table */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EA3C0]"></div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6 w-20 text-center">ID</th>
                  <th className="py-4 px-6">Nom</th>
                  <th className="py-4 px-6 w-40">Code ISO</th>
                  <th className="py-4 px-6 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-650">
                {continents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 px-6 text-center text-gray-400 italic">
                      Aucun continent configuré.
                    </td>
                  </tr>
                ) : (
                  continents.map((continent) => (
                    <tr key={continent.idContinent} className="hover:bg-gray-50/45 transition-colors">
                      <td className="py-4 px-6 text-center font-semibold text-gray-400">
                        {continent.idContinent}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {continent.name}
                      </td>
                      <td className="py-4 px-6">
                        {continent.isoCode ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-blue-100 text-blue-800 uppercase">
                            {continent.isoCode}
                          </span>
                        ) : (
                          <span className="text-gray-300 italic text-xs">Non configuré</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(continent)}
                            disabled={isPending}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-[#5EA3C0] rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(continent.idContinent)}
                            disabled={isPending}
                            className="p-1.5 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold tracking-wide">
                {editingContinent ? 'Modifier le continent' : 'Ajouter un continent'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Nom du Continent *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex. Europe, Amérique du Nord..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0] text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Code ISO (Optionnel, 2 lettres)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={isoCode}
                  onChange={(e) => setIsoCode(e.target.value.toUpperCase())}
                  placeholder="ex. EU, NA, AS..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0] text-sm text-gray-900 uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-[#5EA3C0] hover:bg-[#4891b0] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  {isPending ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
