import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cityApi, type City } from '../../../api/city';
import { countryApi } from '../../../api/country';
import { costOfLivingApi } from '../../../api/costOfLiving';
import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit2, Trash2, Globe, RefreshCw, X, Search, Eye, ChevronRight, ArrowLeft, Save, Coins, Building2, Utensils, Car, Loader2, Globe2, ShoppingBag, Shirt, Baby, Activity, Archive, ArchiveRestore } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const getCountryTranslationKey = (name: string): string => {
  if (!name) return '';
  return `countries.${name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()).trim()}`;
};

export default function AdminCities() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<any | null>(null);
  const [viewingCity, setViewingCity] = useState<any | null>(null);

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
  const [fetchingColId, setFetchingColId] = useState<number | null>(null);

  // Fetch Cities & Countries
  const [archivedCityIds, setArchivedCityIds] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('archived_city_ids') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('archived_city_ids', JSON.stringify(archivedCityIds));
  }, [archivedCityIds]);

  const { data: cities = [], isLoading: citiesLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-cities-list'],
    queryFn: cityApi.getAll,
  });

  const { data: countries = [], isLoading: countriesLoading } = useQuery({
    queryKey: ['admin-countries-dropdown'],
    queryFn: countryApi.getAll,
  });

  const { data: costOfLiving, isLoading: costOfLivingLoading } = useQuery({
    queryKey: ['admin-city-cost-of-living', viewingCity?.idCity],
    queryFn: () => costOfLivingApi.getCostOfLiving(viewingCity.name, viewingCity.country?.countryName),
    enabled: !!viewingCity && !!viewingCity.country?.countryName,
    retry: false,
  });

  // Edit view states
  const [editName, setEditName] = useState('');
  const [editLatitude, setEditLatitude] = useState('');
  const [editLongitude, setEditLongitude] = useState('');
  const [editPopulation, setEditPopulation] = useState('');
  const [editTimezone, setEditTimezone] = useState('');
  const [editIsCapital, setEditIsCapital] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editCountryId, setEditCountryId] = useState<number | ''>('');
  const [editCostData, setEditCostData] = useState<any | null>(null);

  // Sync city edit states when viewingCity changes
  useEffect(() => {
    if (viewingCity) {
      setEditName(viewingCity.name || '');
      setEditLatitude(viewingCity.latitude?.toString() || '');
      setEditLongitude(viewingCity.longitude?.toString() || '');
      setEditPopulation(viewingCity.population?.toString() || '');
      setEditTimezone(viewingCity.timezone || '');
      setEditIsCapital(viewingCity.isCapital || false);
      setEditImageUrl(viewingCity.imageUrl || '');
      setEditCountryId(viewingCity.countryId || '');
    } else {
      setEditName('');
      setEditLatitude('');
      setEditLongitude('');
      setEditPopulation('');
      setEditTimezone('');
      setEditIsCapital(false);
      setEditImageUrl('');
      setEditCountryId('');
    }
  }, [viewingCity]);

  // Sync costOfLiving query data when loaded
  useEffect(() => {
    if (costOfLiving) {
      setEditCostData(JSON.parse(JSON.stringify(costOfLiving)));
    } else {
      setEditCostData(null);
    }
  }, [costOfLiving]);

  const saveCostMutation = useMutation({
    mutationFn: ({ cityId, data }: { cityId: number; data: any }) =>
      costOfLivingApi.updateCostOfLiving(cityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-city-cost-of-living'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la modification du coût de la vie.';
      toast.error(msg);
    },
  });

  const createBlankCostOfLiving = (cityName: string, countryName: string) => ({
    city: {
      id: 0,
      name: cityName,
      country: countryName,
    },
    currency: {
      code: 'EUR',
      exchangeRates: { EUR: 1 },
      lastUpdated: new Date().toISOString(),
    },
    categories: {
      housing: {
        rent: {
          oneBedroom: { cityCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' }, outsideCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
          threeBedroom: { cityCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' }, outsideCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
        },
        buy: {
          pricePerSqm: { cityCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' }, outsideCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
        },
      },
      food: { markets: {} },
      transportation: {
        publicTransport: { oneWayTicket: { min: 0, avg: 0, max: 0, currency: 'EUR' }, monthlyPass: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
        taxi: { start: { min: 0, avg: 0, max: 0, currency: 'EUR' }, per1km: { min: 0, avg: 0, max: 0, currency: 'EUR' }, waitingHour: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
        personal: { gasoline1L: { min: 0, avg: 0, max: 0, currency: 'EUR' }, newCar: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
      },
      utilities: {
        basic85m2: { min: 0, avg: 0, max: 0, currency: 'EUR' },
        internet: { min: 0, avg: 0, max: 0, currency: 'EUR' },
        mobileMinute: { min: 0, avg: 0, max: 0, currency: 'EUR' },
      },
      restaurants: {
        inexpensiveMeal: { min: 0, avg: 0, max: 0, currency: 'EUR' },
        midRangeMeal2People: { min: 0, avg: 0, max: 0, currency: 'EUR' },
        mcMeal: { min: 0, avg: 0, max: 0, currency: 'EUR' },
        cappuccino: { min: 0, avg: 0, max: 0, currency: 'EUR' },
        cocaCola: { min: 0, avg: 0, max: 0, currency: 'EUR' },
        domesticBeer: { min: 0, avg: 0, max: 0, currency: 'EUR' },
        importedBeer: { min: 0, avg: 0, max: 0, currency: 'EUR' },
      },
      clothing: { jeans: { min: 0, avg: 0, max: 0, currency: 'EUR' }, summerDress: { min: 0, avg: 0, max: 0, currency: 'EUR' }, runningShoes: { min: 0, avg: 0, max: 0, currency: 'EUR' }, leatherShoes: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
      childcare: { preschool: { min: 0, avg: 0, max: 0, currency: 'EUR' }, primarySchool: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
      sports: { cinema: { min: 0, avg: 0, max: 0, currency: 'EUR' }, gym: { min: 0, avg: 0, max: 0, currency: 'EUR' }, tennis: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
      salary: { averageMonthly: { min: 0, avg: 0, max: 0, currency: 'EUR' }, mortgageRate: { min: 0, avg: 0, max: 0 } },
    },
    summary: {
      monthlyBudget: { min: 0, avg: 0, max: 0 },
      averageSalary: 0,
    },
  });

  const handleCostFieldChange = (path: string[], value: any) => {
    setEditCostData((prev: any) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return next;
    });
  };

  const handleSaveDetails = async () => {
    if (!viewingCity) return;
    if (!editName.trim()) {
      toast.error('Le nom de la ville est requis.');
      return;
    }
    if (!editCountryId) {
      toast.error('Veuillez sélectionner un pays.');
      return;
    }

    const cityPayload = {
      name: editName.trim(),
      latitude: editLatitude.trim() ? parseFloat(editLatitude) : undefined,
      longitude: editLongitude.trim() ? parseFloat(editLongitude) : undefined,
      population: editPopulation.trim() ? parseInt(editPopulation, 10) : undefined,
      timezone: editTimezone.trim() || undefined,
      isCapital: editIsCapital,
      imageUrl: editImageUrl.trim() || undefined,
      countryId: Number(editCountryId),
    };

    try {
      await updateMutation.mutateAsync({ id: viewingCity.idCity, data: cityPayload });
      if (editCostData) {
        await saveCostMutation.mutateAsync({
          cityId: viewingCity.idCity,
          data: editCostData,
        });
      }
      toast.success('Fiche de la ville mise à jour avec succès.');
      setViewingCity(null);
    } catch (err: any) {
      // handled inside mutations
    }
  };


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

  // Resolve the English country name the cost-of-living service expects.
  const countryNameOf = (city: City): string =>
    city.country?.countryName ||
    countries.find((c) => c.idCountry === city.countryId)?.countryName ||
    '';

  // Admin: pull a city's cost of living from Numbeo (deterministic parser, no AI).
  const fetchColMutation = useMutation({
    mutationFn: (city: City) =>
      costOfLivingApi.adminFetch({
        city: city.name,
        country: countryNameOf(city),
      }),
    onMutate: (city: City) => setFetchingColId(city.idCity),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['destinations-list'] });
      const miss = res.unavailable?.length ?? 0;
      toast.success(
        `${res.city} : ${res.pricedFields} prix récupérés — loyer ${res.rentAvg} ${res.currency}, budget ${res.summary.monthlyBudget.avg} ${res.currency}, salaire ${res.summary.averageSalary} ${res.currency}${
          miss ? ` (${miss} non dispo)` : ''
        }.`,
        { duration: 6000 },
      );
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          'Échec — ville introuvable sur Numbeo (vérifie le nom) ?',
      );
    },
    onSettled: () => setFetchingColId(null),
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

  const handleToggleArchive = (id: number, isArchived: boolean) => {
    if (isArchived) {
      if (window.confirm('Voulez-vous réactiver cette ville ?')) {
        setArchivedCityIds(prev => prev.filter(x => x !== id));
        toast.success('Ville réactivée avec succès.');
      }
    } else {
      if (window.confirm('Voulez-vous vraiment archiver cette ville ? Les données associées seront conservées mais la ville sera désactivée.')) {
        setArchivedCityIds(prev => [...prev, id]);
        toast.success('Ville archivée avec succès.');
      }
    }
  };


  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  if (viewingCity) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col gap-2 border-b border-gray-100 pb-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold tracking-wide uppercase">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => setViewingCity(null)} className="hover:text-[#5EA3C0] transition-colors">
              Gestion des Villes
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-bold">Fiche Ville : {viewingCity.name}</span>
          </div>
          <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewingCity(null)}
                className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-colors shadow-sm"
                title="Retour à la liste"
              >
                <ArrowLeft className="w-5 h-5 text-gray-650" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {viewingCity.name}
                </h1>
                <p className="text-gray-500 mt-0.5">
                  Modifier les informations géographiques, démographiques et les données détaillées du coût de la vie.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewingCity(null)}
                className="px-4 py-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveDetails}
                disabled={updateMutation.isPending || saveCostMutation.isPending}
                className="flex items-center gap-2 bg-[#5EA3C0] hover:bg-[#4891b0] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {(updateMutation.isPending || saveCostMutation.isPending) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: City Basic Info */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Globe2 className="w-5 h-5 text-[#5EA3C0]" />
              Informations de la ville
            </h3>

            {/* Image Preview & URL */}
            <div className="space-y-4">
              {editImageUrl ? (
                <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-150 shadow-inner">
                  <img src={editImageUrl} alt={editName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-48 w-full rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                  Pas d'image configurée
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Lien vers l'image (URL)
                </label>
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Nom de la Ville *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Pays rattaché *
                </label>
                <select
                  required
                  value={editCountryId}
                  onChange={(e) => setEditCountryId(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                >
                  <option value="" disabled>-- Sélectionner un pays --</option>
                  {countries.map((c) => (
                    <option key={c.idCountry} value={c.idCountry}>
                      {t(getCountryTranslationKey(c.countryName), { defaultValue: c.countryName })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={editLatitude}
                    onChange={(e) => setEditLatitude(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={editLongitude}
                    onChange={(e) => setEditLongitude(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Population
                </label>
                <input
                  type="number"
                  min={0}
                  value={editPopulation}
                  onChange={(e) => setEditPopulation(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Fuseau Horaire (Timezone)
                </label>
                <input
                  type="text"
                  value={editTimezone}
                  onChange={(e) => setEditTimezone(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                />
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsCapital}
                    onChange={(e) => setEditIsCapital(e.target.checked)}
                    className="rounded text-[#5EA3C0] focus:ring-[#5EA3C0] w-4.5 h-4.5 border-gray-300"
                  />
                  <span className="text-sm font-bold uppercase tracking-wider text-gray-550">Est la capitale ?</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Cost of Living details */}
          <div className="lg:col-span-2 space-y-6">
            {costOfLivingLoading ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-150 shadow-sm flex flex-col items-center justify-center min-h-[400px] space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-[#5EA3C0]" />
                <span className="text-sm text-gray-500 font-medium">Chargement des données du coût de la vie...</span>
              </div>
            ) : (!costOfLiving && !editCostData) ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-150 shadow-sm text-center min-h-[400px] flex flex-col items-center justify-center">
                <Coins className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-800">Aucune donnée de coût de la vie trouvée</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                  Les données pour cette ville ne sont pas encore disponibles dans le cache. Vous pouvez en initialiser de nouvelles manuellement pour les renseigner.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const countryName = countries.find(c => c.idCountry === Number(editCountryId))?.countryName || '';
                    setEditCostData(createBlankCostOfLiving(editName, countryName));
                  }}
                  className="mt-6 px-5 py-2.5 bg-[#5EA3C0] hover:bg-[#4891b0] text-white rounded-xl font-semibold text-sm transition-colors shadow-md"
                >
                  Créer et renseigner les données
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-[#5EA3C0]" />
                    Coût de la vie
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
                    Données éditables
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 mb-1">
                      Monnaie (ex. EUR, USD, JPY)
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={editCostData?.currency?.code ?? 'EUR'}
                      onChange={(e) => handleCostFieldChange(['currency', 'code'], e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 mb-1">
                      Salaire Net Moyen Mensuel
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        value={editCostData?.summary?.averageSalary || ''}
                        placeholder="0"
                        onChange={(e) => handleCostFieldChange(['summary', 'averageSalary'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        className="w-full px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 font-semibold pr-12"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 mb-1">
                        Budget Mensuel (Moyen)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          value={editCostData?.summary?.monthlyBudget?.avg || ''}
                          placeholder="0"
                          onChange={(e) => handleCostFieldChange(['summary', 'monthlyBudget', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                          className="w-full px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 font-semibold pr-12"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 mb-1">
                        Budget Mensuel (Min)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          value={editCostData?.summary?.monthlyBudget?.min || ''}
                          placeholder="0"
                          onChange={(e) => handleCostFieldChange(['summary', 'monthlyBudget', 'min'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                          className="w-full px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 font-semibold pr-12"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 mb-1">
                        Budget Mensuel (Max)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          value={editCostData?.summary?.monthlyBudget?.max || ''}
                          placeholder="0"
                          onChange={(e) => handleCostFieldChange(['summary', 'monthlyBudget', 'max'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                          className="w-full px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 font-semibold pr-12"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Category: Housing */}
                  <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-150 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#5EA3C0]" />
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-700">Logement & Loyers</span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Appartement 1 chambre (Centre-ville)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={editCostData?.categories?.housing?.rent?.oneBedroom?.cityCenter?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'housing', 'rent', 'oneBedroom', 'cityCenter', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Appartement 1 chambre (Hors centre)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={editCostData?.categories?.housing?.rent?.oneBedroom?.outsideCenter?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'housing', 'rent', 'oneBedroom', 'outsideCenter', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Appartement 3 chambres (Centre-ville)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={editCostData?.categories?.housing?.rent?.threeBedroom?.cityCenter?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'housing', 'rent', 'threeBedroom', 'cityCenter', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category: Food / Restaurants */}
                  <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-150 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-[#5EA3C0]" />
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-700">Restauration & Alimentation</span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Repas (Restau bon marché)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={editCostData?.categories?.restaurants?.inexpensiveMeal?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'restaurants', 'inexpensiveMeal', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Menu McMeal ou équiv.
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={editCostData?.categories?.restaurants?.mcMeal?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'restaurants', 'mcMeal', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Cappuccino régulier
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={editCostData?.categories?.restaurants?.cappuccino?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'restaurants', 'cappuccino', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category: Transportation / Utilities */}
                  <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-150 flex items-center gap-2">
                      <Car className="w-5 h-5 text-[#5EA3C0]" />
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-700">Transports & Services</span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Ticket transport aller simple
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={editCostData?.categories?.transportation?.publicTransport?.oneWayTicket?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'transportation', 'publicTransport', 'oneWayTicket', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Abonnement mensuel transports
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={editCostData?.categories?.transportation?.publicTransport?.monthlyPass?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'transportation', 'publicTransport', 'monthlyPass', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Charges de base (Élec, eau, chauffage 85m²)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={editCostData?.categories?.utilities?.basic85m2?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'utilities', 'basic85m2', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Internet (Fibre/ADSL 60 Mbps+)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={editCostData?.categories?.utilities?.internet?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'utilities', 'internet', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category: Supermarket / Markets */}
                  <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-150 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#5EA3C0]" />
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-700">Supermarché (Aliments de base)</span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Lait (régulier, 1 litre)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={editCostData?.categories?.food?.markets?.milk1L?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'food', 'markets', 'milk1L', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Pain blanc frais (500g)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={editCostData?.categories?.food?.markets?.bread500g?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'food', 'markets', 'bread500g', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Œufs (boîte de 12)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={editCostData?.categories?.food?.markets?.eggs12?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'food', 'markets', 'eggs12', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Filet de poulet (1 kg)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={editCostData?.categories?.food?.markets?.chicken1kg?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'food', 'markets', 'chicken1kg', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Viande rouge (bœuf 1 kg)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={editCostData?.categories?.food?.markets?.beef1kg?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'food', 'markets', 'beef1kg', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category: Clothing */}
                  <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-150 flex items-center gap-2">
                      <Shirt className="w-5 h-5 text-[#5EA3C0]" />
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-700">Habillement & Vêtements</span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Paire de jeans (H&M, Zara...)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={editCostData?.categories?.clothing?.jeans?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'clothing', 'jeans', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Robe d'été (H&M, Zara...)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={editCostData?.categories?.clothing?.summerDress?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'clothing', 'summerDress', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Chaussures de sport (Nike...)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={editCostData?.categories?.clothing?.runningShoes?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'clothing', 'runningShoes', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category: Childcare */}
                  <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-150 flex items-center gap-2">
                      <Baby className="w-5 h-5 text-[#5EA3C0]" />
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-700">Garde d'enfants & Éducation</span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Crèche / Maternelle privée (Mensuel)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={editCostData?.categories?.childcare?.preschool?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'childcare', 'preschool', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            École primaire internationale (Annuel)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={editCostData?.categories?.childcare?.primarySchool?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'childcare', 'primarySchool', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category: Sports & Leisure */}
                  <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-150 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#5EA3C0]" />
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-700">Sport, Loisirs & Culture</span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Abonnement mensuel club de fitness
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={editCostData?.categories?.sports?.gym?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'sports', 'gym', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-555 mb-1">
                            Place de cinéma (1 siège)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={editCostData?.categories?.sports?.cinema?.avg || ''}
                              placeholder="0"
                              onChange={(e) => handleCostFieldChange(['categories', 'sports', 'cinema', 'avg'], e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 pr-12"
                            />
                            <span className="absolute right-3.5 top-2 text-xs text-gray-400 font-bold">{editCostData?.currency?.code ?? 'EUR'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
                {t(getCountryTranslationKey(c.countryName), { defaultValue: c.countryName })}
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
                  <th className="py-4 px-6 w-32">Statut</th>
                  <th className="py-4 px-6 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-650">
                {filteredCities.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 px-6 text-center text-gray-400 italic">
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
                        {city.country?.countryName ? t(getCountryTranslationKey(city.country.countryName), { defaultValue: city.country.countryName }) : <span className="text-gray-400 italic">Inconnu</span>}
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
                      <td className="py-4 px-6">
                        {archivedCityIds.includes(city.idCity) ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-amber-100 text-amber-800">
                            Archivé
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-emerald-100 text-emerald-800">
                            Actif
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingCity(city)}
                            disabled={isPending}
                            className="p-1.5 hover:bg-gray-100 text-gray-650 hover:text-[#5EA3C0] rounded-lg transition-colors"
                            title="Voir la fiche"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => fetchColMutation.mutate(city)}
                            disabled={fetchingColId === city.idCity}
                            className="p-1.5 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 rounded-lg transition-colors disabled:opacity-50"
                            title="Récupérer le coût de la vie (Numbeo)"
                          >
                            {fetchingColId === city.idCity ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Coins className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openEditModal(city)}
                            disabled={isPending}
                            className="p-1.5 hover:bg-gray-100 text-gray-650 hover:text-[#5EA3C0] rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {archivedCityIds.includes(city.idCity) ? (
                            <button
                              onClick={() => handleToggleArchive(city.idCity, true)}
                              disabled={isPending}
                              className="p-1.5 hover:bg-emerald-50 text-gray-650 hover:text-emerald-600 rounded-lg transition-colors"
                              title="Réactiver"
                            >
                              <ArchiveRestore className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleArchive(city.idCity, false)}
                              disabled={isPending}
                              className="p-1.5 hover:bg-amber-50 text-gray-650 hover:text-amber-600 rounded-lg transition-colors"
                              title="Archiver"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
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
                        {t(getCountryTranslationKey(c.countryName), { defaultValue: c.countryName })}
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
