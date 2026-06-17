import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { countryApi } from '../../../api/country';
import { continentApi } from '../../../api/continent';
import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Globe, RefreshCw, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCountries() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<any | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinentFilter, setSelectedContinentFilter] = useState<string>('all');

  // Form Fields
  const [countryName, setCountryName] = useState('');
  const [isoCode, setIsoCode] = useState('');
  const [continentId, setContinentId] = useState<number | ''>('');

  // Fetch Countries & Continents
  const { data: countries = [] as any[], isLoading: countriesLoading, refetch, isRefetching } = useQuery<any[]>({
    queryKey: ['admin-countries-list'],
    queryFn: countryApi.getAll as any,
  });

  const { data: continents = [], isLoading: continentsLoading } = useQuery({
    queryKey: ['admin-continents-dropdown'],
    queryFn: continentApi.getAll,
  });

  // Reference list of all countries (name + ISO) for the picker autocomplete.
  const { data: availableCountries = [] } = useQuery({
    queryKey: ['geo-available-countries'],
    queryFn: countryApi.getAvailable,
    staleTime: 1000 * 60 * 60,
  });

  // Filter & Search Logic
  const filteredCountries = useMemo(() => {
    return countries.filter((c: any) => {
      const matchesSearch = c.countryName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.isoCode && c.isoCode.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesContinent = selectedContinentFilter === 'all' || 
        c.continentId.toString() === selectedContinentFilter;
      return matchesSearch && matchesContinent;
    });
  }, [countries, searchQuery, selectedContinentFilter]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: countryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-countries-list'] });
      queryClient.invalidateQueries({ queryKey: ['destinations-list'] });
      toast.success('Pays créé avec succès.');
      closeModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la création.';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => countryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-countries-list'] });
      queryClient.invalidateQueries({ queryKey: ['destinations-list'] });
      toast.success('Pays mis à jour avec succès.');
      closeModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la modification.';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: countryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-countries-list'] });
      queryClient.invalidateQueries({ queryKey: ['destinations-list'] });
      toast.success('Pays supprimé.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la suppression.';
      toast.error(msg);
    },
  });

  const openCreateModal = () => {
    setEditingCountry(null);
    setCountryName('');
    setIsoCode('');
    setContinentId(continents.length > 0 ? continents[0].idContinent : '');
    setModalOpen(true);
  };

  const openEditModal = (country: any) => {
    setEditingCountry(country);
    setCountryName(country.countryName);
    setIsoCode(country.isoCode || '');
    setContinentId(country.continentId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCountry(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryName.trim()) {
      toast.error('Le nom du pays est requis.');
      return;
    }
    if (!continentId) {
      toast.error('Veuillez sélectionner un continent.');
      return;
    }

    const payload = {
      countryName: countryName.trim(),
      isoCode: isoCode.trim().toUpperCase() || undefined,
      continentId: Number(continentId),
    };

    if (editingCountry) {
      updateMutation.mutate({ id: editingCountry.idCountry, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce pays ? Toutes les villes et projets d\'expatriation rattachés seront affectés.')) {
      deleteMutation.mutate(id);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestion des Pays</h1>
          <p className="text-gray-500 mt-1">Gérer les pays de destination, leurs codes ISO et leurs continents d'appartenance.</p>
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
            Ajouter un pays
          </button>
        </div>
      </div>

      {/* Filters Dashboard */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, code ISO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 bg-gray-50/50 rounded-lg text-sm focus:outline-none focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0]"
          />
        </div>

        {/* Continent Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-650">Continent :</span>
          <select
            value={selectedContinentFilter}
            onChange={(e) => setSelectedContinentFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 px-3 py-1.5 outline-none focus:border-[#5EA3C0]"
          >
            <option value="all">Tous les continents</option>
            {continents.map((cont) => (
              <option key={cont.idContinent} value={cont.idContinent}>
                {cont.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400 ml-2 font-medium">
            {filteredCountries.length} résultat(s)
          </span>
        </div>
      </div>

      {/* Countries Table */}
      {countriesLoading || continentsLoading ? (
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
                  <th className="py-4 px-6">Nom du Pays</th>
                  <th className="py-4 px-6 w-32">Code ISO</th>
                  <th className="py-4 px-6 w-1/4">Continent</th>
                  <th className="py-4 px-6 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-650">
                {filteredCountries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-6 text-center text-gray-400 italic">
                      Aucun pays ne correspond aux critères.
                    </td>
                  </tr>
                ) : (
                  filteredCountries.map((country) => (
                    <tr key={country.idCountry} className="hover:bg-gray-50/45 transition-colors">
                      <td className="py-4 px-6 text-center font-semibold text-gray-400">
                        {country.idCountry}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {country.countryName}
                      </td>
                      <td className="py-4 px-6">
                        {country.isoCode ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-blue-100 text-blue-800 uppercase">
                            {country.isoCode}
                          </span>
                        ) : (
                          <span className="text-gray-300 italic text-xs">Aucun</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-650 font-medium">
                        {country.continent?.name || <span className="text-gray-400 italic">Inconnu</span>}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(country)}
                            disabled={isPending}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-[#5EA3C0] rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(country.idCountry)}
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
                {editingCountry ? 'Modifier le pays' : 'Ajouter un pays'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Nom du Pays *
                </label>
                <input
                  type="text"
                  required
                  list="rc-countries"
                  value={countryName}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCountryName(v);
                    const match = availableCountries.find(
                      (c) => c.name.toLowerCase() === v.toLowerCase(),
                    );
                    if (match) setIsoCode(match.code);
                  }}
                  placeholder="Tape ou choisis un pays (ex. Canada)..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0] text-sm text-gray-900"
                />
                <datalist id="rc-countries">
                  {availableCountries.map((c) => (
                    <option key={c.code} value={c.name} />
                  ))}
                </datalist>
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
                  placeholder="ex. CA, FR..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0] text-sm text-gray-900 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Continent parent *
                </label>
                <select
                  required
                  value={continentId}
                  onChange={(e) => setContinentId(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0] text-sm text-gray-900"
                >
                  <option value="" disabled>-- Sélectionner un continent --</option>
                  {continents.map((cont) => (
                    <option key={cont.idContinent} value={cont.idContinent}>
                      {cont.name}
                    </option>
                  ))}
                </select>
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
