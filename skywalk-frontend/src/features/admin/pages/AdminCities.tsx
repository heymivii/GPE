import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cityApi } from '../../../api/city';
import { countryApi } from '../../../api/country';
import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Globe, RefreshCw, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCities() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<any | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('all');

  // Form Fields
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [population, setPopulation] = useState('');
  const [timezone, setTimezone] = useState('');
  const [isCapital, setIsCapital] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [countryId, setCountryId] = useState<number | ''>('');

  // Fetch Cities & Countries
  const { data: cities = [], isLoading: citiesLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-cities-list'],
    queryFn: cityApi.getAll,
  });

  const { data: countries = [], isLoading: countriesLoading } = useQuery({
    queryKey: ['admin-countries-dropdown'],
    queryFn: countryApi.getAll,
  });

  const filteredCities = useMemo(() => {
    return cities
      .filter((c: any) => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCountry = selectedCountryFilter === 'all' || 
          c.countryId.toString() === selectedCountryFilter;
        return matchesSearch && matchesCountry;
      })
      .sort((a: any, b: any) => a.idCity - b.idCity);
  }, [cities, searchQuery, selectedCountryFilter]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: cityApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities-list'] });
      queryClient.invalidateQueries({ queryKey: ['destinations-list'] });
      toast.success('Ville créée avec succès.');
      closeModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la création.';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => cityApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities-list'] });
      queryClient.invalidateQueries({ queryKey: ['destinations-list'] });
      toast.success('Ville mise à jour avec succès.');
      closeModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la modification.';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: cityApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities-list'] });
      queryClient.invalidateQueries({ queryKey: ['destinations-list'] });
      toast.success('Ville supprimée.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la suppression.';
      toast.error(msg);
    },
  });

  const openCreateModal = () => {
    setEditingCity(null);
    setName('');
    setLatitude('');
    setLongitude('');
    setPopulation('');
    setTimezone('Europe/Paris');
    setIsCapital(false);
    setImageUrl('');
    setCountryId(countries.length > 0 ? countries[0].idCountry : '');
    setModalOpen(true);
  };

  const openEditModal = (city: any) => {
    setEditingCity(city);
    setName(city.name);
    setLatitude(city.latitude?.toString() || '');
    setLongitude(city.longitude?.toString() || '');
    setPopulation(city.population?.toString() || '');
    setTimezone(city.timezone || '');
    setIsCapital(city.isCapital || false);
    setImageUrl(city.imageUrl || '');
    setCountryId(city.countryId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCity(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Le nom de la ville est requis.');
      return;
    }
    if (!countryId) {
      toast.error('Veuillez sélectionner un pays.');
      return;
    }

    const payload = {
      name: name.trim(),
      latitude: latitude.trim() ? parseFloat(latitude) : undefined,
      longitude: longitude.trim() ? parseFloat(longitude) : undefined,
      population: population.trim() ? parseInt(population, 10) : undefined,
      timezone: timezone.trim() || undefined,
      isCapital: isCapital,
      imageUrl: imageUrl.trim() || undefined,
      countryId: Number(countryId),
    };

    if (editingCity) {
      updateMutation.mutate({ id: editingCity.idCity, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette ville ?')) {
      deleteMutation.mutate(id);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestion des Villes</h1>
          <p className="text-gray-500 mt-1">Gérer la liste des villes, leurs informations démographiques, géographiques et images.</p>
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
            Ajouter une ville
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
            placeholder="Rechercher par nom de ville..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 bg-gray-50/50 rounded-lg text-sm focus:outline-none focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0]"
          />
        </div>

        {/* Country Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-650">Pays :</span>
          <select
            value={selectedCountryFilter}
            onChange={(e) => setSelectedCountryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 px-3 py-1.5 outline-none focus:border-[#5EA3C0]"
          >
            <option value="all">Tous les pays</option>
            {countries.map((c) => (
              <option key={c.idCountry} value={c.idCountry}>
                {c.countryName}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400 ml-2 font-medium">
            {filteredCities.length} résultat(s)
          </span>
        </div>
      </div>

      {/* Cities Table */}
      {citiesLoading || countriesLoading ? (
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
                  <th className="py-4 px-6">Pays</th>
                  <th className="py-4 px-6">Population</th>
                  <th className="py-4 px-6">Coordonnées</th>
                  <th className="py-4 px-6">Capitale</th>
                  <th className="py-4 px-6 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-650">
                {filteredCities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 px-6 text-center text-gray-400 italic">
                      Aucune ville ne correspond aux critères.
                    </td>
                  </tr>
                ) : (
                  filteredCities.map((city) => (
                    <tr key={city.idCity} className="hover:bg-gray-50/45 transition-colors">
                      <td className="py-4 px-6 text-center font-semibold text-gray-400">
                        {city.idCity}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        <div className="flex items-center gap-3">
                          {city.imageUrl && (
                            <img
                              src={city.imageUrl}
                              alt={city.name}
                              className="w-8 h-8 rounded-md object-cover border border-gray-100"
                            />
                          )}
                          <span>{city.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-650 font-medium">
                        {city.country?.countryName || <span className="text-gray-400 italic">Inconnu</span>}
                      </td>
                      <td className="py-4 px-6 text-gray-800 font-medium">
                        {city.population ? city.population.toLocaleString('fr-FR') : <span className="text-gray-300 italic text-xs">Non renseignée</span>}
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500">
                        {city.latitude && city.longitude ? (
                          <span className="font-mono">{parseFloat(city.latitude).toFixed(4)}°, {parseFloat(city.longitude).toFixed(4)}°</span>
                        ) : (
                          <span className="text-gray-300 italic">Aucunes</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {city.isCapital ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-amber-100 text-amber-800">
                            Oui
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Non</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(city)}
                            disabled={isPending}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-[#5EA3C0] rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(city.idCity)}
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
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold tracking-wide">
                {editingCity ? 'Modifier la ville' : 'Ajouter une ville'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Nom de la Ville *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex. Montréal, Kyoto..."
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0] text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Pays rattaché *
                  </label>
                  <select
                    required
                    value={countryId}
                    onChange={(e) => setCountryId(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 bg-white"
                  >
                    <option value="" disabled>-- Sélectionner un pays --</option>
                    {countries.map((c) => (
                      <option key={c.idCountry} value={c.idCountry}>
                        {c.countryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Fuseau Horaire (Timezone)
                  </label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="ex. America/Toronto, Asia/Tokyo..."
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="ex. 45.5017"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="ex. -73.5673"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Population
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={population}
                    onChange={(e) => setPopulation(e.target.value)}
                    placeholder="ex. 1780000"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCapital}
                      onChange={(e) => setIsCapital(e.target.checked)}
                      className="rounded text-[#5EA3C0] focus:ring-[#5EA3C0] w-4 h-4 border-gray-300"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Est la capitale ?</span>
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Lien vers une image (URL)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="ex. https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                  />
                </div>
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
