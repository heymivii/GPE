import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { countryApi, type UpdateCountryDto } from '../../../api/country';
import type { Country } from '../../../types/country';
import { continentApi } from '../../../api/continent';
import { adminApi } from '../../../api/admin';
import { cityApi } from '../../../api/city';
import { costOfLivingApi } from '../../../api/costOfLiving';
import { searchJobs } from '../../../api/jobOffers';
import { forumTopicsApi } from '../../../api/forum-topics';
import { resourceApi } from '../../../api/resource';
import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Globe,
  RefreshCw,
  X,
  Search,
  Eye,
  ChevronRight,
  ArrowLeft,
  Save,
  Loader2,
  Settings,
  Briefcase,
  MessageSquare,
  FileText,
  Coins,
  TrendingUp,
  ExternalLink,
  Pin,
  Lock,
  Unlock,
  PinOff,
  Building2,
  Utensils,
  ShoppingBag,
  Shirt,
  Baby,
  Activity,
  Archive,
  ArchiveRestore,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function AdminCountries() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinentFilter, setSelectedContinentFilter] = useState<string>('all');

  // Form Fields
  const [countryName, setCountryName] = useState('');
  const [isoCode, setIsoCode] = useState('');
  const [continentId, setContinentId] = useState<number | ''>('');

  // Fetch Countries & Continents
  const { data: countries = [], isLoading: countriesLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-countries-list'],
    queryFn: countryApi.getAll,
  });

  const { data: continents = [], isLoading: continentsLoading } = useQuery({
    queryKey: ['admin-continents-dropdown'],
    queryFn: continentApi.getAll,
  });

  const [viewingCountry, setViewingCountry] = useState<any | null>(null);

  // Fiche Pays fields
  const [editCountryName, setEditCountryName] = useState('');
  const [editIsoCode, setEditIsoCode] = useState('');
  const [editContinentId, setEditContinentId] = useState<number | ''>('');

  // Procedure sub-modal fields
  const [procModalOpen, setProcModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<any | null>(null);
  const [procType, setProcType] = useState('');
  const [procCategory, setProcCategory] = useState('');
  const [procStepOrder, setProcStepOrder] = useState('');
  const [procAverageDelay, setProcAverageDelay] = useState('');
  const [procDescription, setProcDescription] = useState('');

  // Sync country details when viewingCountry changes
  useEffect(() => {
    if (viewingCountry) {
      setEditCountryName(viewingCountry.countryName || '');
      setEditIsoCode(viewingCountry.isoCode || '');
      setEditContinentId(viewingCountry.continentId || '');
      setActiveTab('procedures');
      setSelectedCostCity(null);
    } else {
      setEditCountryName('');
      setEditIsoCode('');
      setEditContinentId('');
    }
  }, [viewingCountry]);

  // Tab State
  const [activeTab, setActiveTab] = useState<'procedures' | 'costOfLiving' | 'jobs' | 'forum' | 'resources'>('procedures');

  // Cities & Cost of living
  const [selectedCostCity, setSelectedCostCity] = useState<any | null>(null);

  const { data: countryCities = [], isLoading: countryCitiesLoading } = useQuery({
    queryKey: ['admin-country-cities', viewingCountry?.idCountry],
    queryFn: () => cityApi.getAll().then(all => all.filter((c: any) => c.countryId === viewingCountry?.idCountry)),
    enabled: !!viewingCountry,
  });

  const { data: cityCostOfLiving, isLoading: cityCostOfLivingLoading } = useQuery({
    queryKey: ['admin-city-cost-of-living-view', selectedCostCity?.idCity],
    queryFn: () => costOfLivingApi.getCostOfLiving(selectedCostCity.name, viewingCountry?.countryName),
    enabled: !!selectedCostCity && !!viewingCountry,
    retry: false,
  });

  // Adzuna Job Opportunities
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['admin-country-jobs', viewingCountry?.isoCode],
    queryFn: () => searchJobs({ country: viewingCountry?.isoCode?.toLowerCase(), resultsPerPage: 5 }),
    enabled: !!viewingCountry && !!viewingCountry.isoCode,
  });

  // Forum Topics & Moderation
  const { data: forumTopics = [], isLoading: forumTopicsLoading } = useQuery({
    queryKey: ['admin-country-forum-topics', viewingCountry?.idCountry],
    queryFn: () => forumTopicsApi.findAll().then(all => all.filter((t: any) => t.country?.idCountry === viewingCountry?.idCountry)),
    enabled: !!viewingCountry,
  });

  const lockTopicMutation = useMutation({
    mutationFn: forumTopicsApi.lockTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-country-forum-topics', viewingCountry?.idCountry] });
      toast.success('Statut de verrouillage mis à jour.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la modération.');
    },
  });

  const pinTopicMutation = useMutation({
    mutationFn: forumTopicsApi.pinTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-country-forum-topics', viewingCountry?.idCountry] });
      toast.success("Statut d'épinglage mis à jour.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la modération.');
    },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: forumTopicsApi.moderatorRemove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-country-forum-topics', viewingCountry?.idCountry] });
      toast.success('Sujet supprimé avec succès.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression.');
    },
  });

  // Resources CRUD & Form States
  const { data: countryResources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ['admin-country-resources', viewingCountry?.idCountry],
    queryFn: () => resourceApi.getByCountry(viewingCountry?.idCountry),
    enabled: !!viewingCountry,
  });

  const [resModalOpen, setResModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState<string>('article');

  const createResourceMutation = useMutation({
    mutationFn: resourceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-country-resources', viewingCountry?.idCountry] });
      toast.success('Ressource ajoutée.');
      closeResModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la création.');
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => resourceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-country-resources', viewingCountry?.idCountry] });
      toast.success('Ressource mise à jour.');
      closeResModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification.');
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: resourceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-country-resources', viewingCountry?.idCountry] });
      toast.success('Ressource supprimée.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression.');
    },
  });

  const openAddResModal = () => {
    setEditingResource(null);
    setResTitle('');
    setResUrl('');
    setResType('article');
    setResModalOpen(true);
  };

  const openEditResModal = (res: any) => {
    setEditingResource(res);
    setResTitle(res.title || '');
    setResUrl(res.url || '');
    setResType(res.resourceType || 'article');
    setResModalOpen(true);
  };

  const closeResModal = () => {
    setResModalOpen(false);
    setEditingResource(null);
  };

  const handleSubmitResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingCountry) return;
    if (!resTitle.trim()) {
      toast.error('Le titre est requis.');
      return;
    }
    const payload = {
      title: resTitle.trim(),
      url: resUrl.trim() || undefined,
      resourceType: resType as any,
      countryId: viewingCountry.idCountry,
    };
    if (editingResource) {
      updateResourceMutation.mutate({ id: editingResource.idResource, data: payload });
    } else {
      createResourceMutation.mutate(payload);
    }
  };

  const handleDeleteResource = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette ressource ?')) {
      deleteResourceMutation.mutate(id);
    }
  };

  // Fetch administrative procedures (services) for the country
  const { data: procedures = [], isLoading: proceduresLoading } = useQuery({
    queryKey: ['admin-country-procedures', viewingCountry?.idCountry],
    queryFn: () => adminApi.getAllProcedures(viewingCountry?.idCountry),
    enabled: !!viewingCountry,
  });

  const createProcMutation = useMutation({
    mutationFn: adminApi.createProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-country-procedures', viewingCountry?.idCountry] });
      toast.success('Démarche administrative créée avec succès.');
      closeProcModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la création.';
      toast.error(msg);
    },
  });

  const updateProcMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updateProcedure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-country-procedures', viewingCountry?.idCountry] });
      toast.success('Démarche administrative mise à jour.');
      closeProcModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la modification.';
      toast.error(msg);
    },
  });

  const deleteProcMutation = useMutation({
    mutationFn: adminApi.deleteProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-country-procedures', viewingCountry?.idCountry] });
      toast.success('Démarche administrative supprimée.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la suppression.';
      toast.error(msg);
    },
  });

  const handleSaveCountry = async () => {
    if (!viewingCountry) return;
    if (!editCountryName.trim()) {
      toast.error('Le nom du pays est requis.');
      return;
    }
    if (!editContinentId) {
      toast.error('Veuillez sélectionner un continent.');
      return;
    }

    const payload = {
      countryName: editCountryName.trim(),
      isoCode: editIsoCode.trim().toUpperCase() || undefined,
      continentId: Number(editContinentId),
    };

    try {
      await updateMutation.mutateAsync({ id: viewingCountry.idCountry, data: payload });
      toast.success('Fiche pays mise à jour avec succès.');
      setViewingCountry(null);
    } catch (err: any) {
      // handled inside mutation
    }
  };

  const openAddProcModal = () => {
    setEditingProcedure(null);
    setProcType('');
    setProcCategory('');
    setProcStepOrder('');
    setProcAverageDelay('');
    setProcDescription('');
    setProcModalOpen(true);
  };

  const openEditProcModal = (proc: any) => {
    setEditingProcedure(proc);
    setProcType(proc.procedureType || '');
    setProcCategory(proc.category || '');
    setProcStepOrder(proc.stepOrder?.toString() || '');
    setProcAverageDelay(proc.averageDelayDays?.toString() || '');
    setProcDescription(proc.description || '');
    setProcModalOpen(true);
  };

  const closeProcModal = () => {
    setProcModalOpen(false);
    setEditingProcedure(null);
  };

  const handleSubmitProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingCountry) return;
    if (!procType.trim()) {
      toast.error('Le type de démarche est requis.');
      return;
    }

    const payload = {
      procedureType: procType.trim(),
      description: procDescription.trim() || undefined,
      category: procCategory.trim() || undefined,
      stepOrder: procStepOrder ? parseInt(procStepOrder, 10) : undefined,
      averageDelayDays: procAverageDelay ? parseInt(procAverageDelay, 10) : undefined,
      countryId: viewingCountry.idCountry,
    };

    if (editingProcedure) {
      updateProcMutation.mutate({ id: editingProcedure.idAdminProcedure, data: payload });
    } else {
      createProcMutation.mutate(payload);
    }
  };

  const handleDeleteProc = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette démarche ?')) {
      deleteProcMutation.mutate(id);
    }
  };

  // Reference list of all countries (name + ISO) for the picker autocomplete.
  const { data: availableCountries = [] } = useQuery({
    queryKey: ['geo-available-countries'],
    queryFn: countryApi.getAvailable,
    staleTime: 1000 * 60 * 60,
  });

  // Filter & Search Logic
  const filteredCountries = useMemo(() => {
    return countries.filter((c) => {
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
    mutationFn: ({ id, data }: { id: number; data: UpdateCountryDto }) => countryApi.update(id, data),
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

  const archiveMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'archived' }) =>
      countryApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-countries-list'] });
      queryClient.invalidateQueries({ queryKey: ['destinations-list'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de l\'archivage.';
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

  const openEditModal = (country: Country) => {
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

  const handleToggleArchive = (id: number, isArchived: boolean) => {
    if (isArchived) {
      if (window.confirm('Voulez-vous réactiver ce pays ?')) {
        archiveMutation.mutate({ id, status: 'active' });
      }
    } else {
      if (window.confirm('Voulez-vous vraiment archiver ce pays ? Les données associées seront conservées mais le pays sera désactivé.')) {
        archiveMutation.mutate({ id, status: 'archived' });
      }
    }
  };


  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  if (viewingCountry) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col gap-2 border-b border-gray-100 pb-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold tracking-wide uppercase">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => setViewingCountry(null)} className="hover:text-[#5EA3C0] transition-colors">
              Gestion des Pays
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-bold">Fiche Pays : {viewingCountry.countryName}</span>
          </div>
          <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewingCountry(null)}
                className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-colors shadow-sm"
                title="Retour à la liste"
              >
                <ArrowLeft className="w-5 h-5 text-gray-650" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {viewingCountry.countryName}
                </h1>
                <p className="text-gray-500 mt-0.5">
                  Gérer les détails de la destination et configurer ses démarches administratives (services) associées.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewingCountry(null)}
                className="px-4 py-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveCountry}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 bg-[#5EA3C0] hover:bg-[#4891b0] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {updateMutation.isPending ? (
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
          {/* Left Column: Country Info */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Globe className="w-5 h-5 text-[#5EA3C0]" />
              Détails du pays
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-555 mb-1">
                  Nom du Pays *
                </label>
                <input
                  type="text"
                  required
                  value={editCountryName}
                  onChange={(e) => setEditCountryName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-555 mb-1">
                  Code ISO (2 lettres)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={editIsoCode}
                  onChange={(e) => setEditIsoCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 uppercase font-semibold"
                  placeholder="ex. FR, CA..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-555 mb-1">
                  Continent parent *
                </label>
                <select
                  required
                  value={editContinentId}
                  onChange={(e) => setEditContinentId(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                >
                  <option value="" disabled>-- Sélectionner un continent --</option>
                  {continents.map((cont) => (
                    <option key={cont.idContinent} value={cont.idContinent}>
                      {t(`comparison.data.continents.${cont.name}`, { defaultValue: cont.name })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Tabs (Procedures, Cost of Living, Jobs, Forum, Resources) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs Selector */}
            <div className="flex border-b border-gray-200 gap-1 overflow-x-auto pb-px">
              {[
                { id: 'procedures', label: 'Démarches', icon: Settings },
                { id: 'costOfLiving', label: 'Coût de la vie', icon: Coins },
                { id: 'jobs', label: 'Opportunités', icon: TrendingUp },
                { id: 'forum', label: 'Forum', icon: MessageSquare },
                { id: 'resources', label: 'Ressources', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                      isActive
                        ? 'border-[#5EA3C0] text-[#5EA3C0]'
                        : 'border-transparent text-gray-400 hover:text-gray-650 hover:border-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Démarches */}
            {activeTab === 'procedures' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#5EA3C0]" />
                    Démarches Administratives (Services)
                  </h3>
                  <button
                    type="button"
                    onClick={openAddProcModal}
                    className="flex items-center gap-2 bg-[#5EA3C0]/10 hover:bg-[#5EA3C0]/20 text-[#5EA3C0] px-4 py-2 rounded-xl font-bold text-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une démarche
                  </button>
                </div>

                {proceduresLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="w-10 h-10 animate-spin text-[#5EA3C0]" />
                    <span className="text-sm text-gray-500 font-medium">Chargement des démarches...</span>
                  </div>
                ) : procedures.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-305" />
                    <p className="font-semibold text-gray-655">Aucune démarche enregistrée</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Ajoutez la première démarche administrative requise pour s'installer dans ce pays.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {procedures
                      .sort((a: any, b: any) => (a.stepOrder || 0) - (b.stepOrder || 0))
                      .map((proc: any) => (
                        <div key={proc.idAdminProcedure} className="py-4 flex items-start justify-between gap-4 group">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded uppercase tracking-wider">
                                Étape {proc.stepOrder || '?'}
                              </span>
                              {proc.category && (
                                <span className="px-2 py-0.5 bg-[#5EA3C0]/10 text-[#5EA3C0] text-[10px] font-bold rounded uppercase tracking-wider border border-[#5EA3C0]/20">
                                  {proc.category}
                                </span>
                              )}
                              <h4 className="font-bold text-gray-900 text-sm">
                                {proc.procedureType}
                              </h4>
                            </div>
                            {proc.description && (
                              <p className="text-gray-500 text-xs leading-relaxed max-w-2xl">{proc.description}</p>
                            )}
                            {proc.averageDelayDays && (
                              <div className="text-[11px] text-gray-405 font-semibold">
                                Délai moyen : <span className="text-gray-655">{proc.averageDelayDays} jours</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => openEditProcModal(proc)}
                              className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-[#5EA3C0] rounded-lg transition-colors"
                              title="Modifier la démarche"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProc(proc.idAdminProcedure)}
                              className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                              title="Supprimer la démarche"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Coût de la vie */}
            {activeTab === 'costOfLiving' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-[#5EA3C0]" />
                    Coût de la vie par ville
                  </h3>
                  <span className="text-xs text-gray-450 font-semibold uppercase tracking-wider">
                    {countryCities.length} ville(s) enregistrée(s)
                  </span>
                </div>

                {countryCitiesLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="w-10 h-10 animate-spin text-[#5EA3C0]" />
                    <span className="text-sm text-gray-500 font-medium">Chargement des villes...</span>
                  </div>
                ) : countryCities.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-305" />
                    <p className="font-semibold text-gray-655">Aucune ville enregistrée pour ce pays</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Rendez-vous dans la section "Gestion des Villes" pour ajouter des villes à ce pays.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {countryCities.map((city: any) => (
                      <div
                        key={city.idCity}
                        onClick={() => setSelectedCostCity(city)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all hover:border-[#5EA3C0] hover:shadow-md ${
                          selectedCostCity?.idCity === city.idCity
                            ? 'border-[#5EA3C0] bg-[#5EA3C0]/5 shadow-sm'
                            : 'border-gray-150 bg-gray-50/25'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                              {city.name}
                              {city.isCapital && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-extrabold rounded uppercase tracking-wider">
                                  Capitale
                                </span>
                              )}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Population : {city.population ? city.population.toLocaleString() : 'Inconnue'}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-455 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Detailed cost of living panel when city is clicked */}
                {selectedCostCity && (
                  <div className="border-t border-gray-100 pt-6 space-y-6 animate-in slide-in-from-top duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#5EA3C0]" />
                        Détails du coût de la vie : {selectedCostCity.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setSelectedCostCity(null)}
                        className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
                      >
                        Fermer l'aperçu
                      </button>
                    </div>

                    {cityCostOfLivingLoading ? (
                      <div className="flex justify-center items-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-[#5EA3C0]" />
                      </div>
                    ) : !cityCostOfLiving || !cityCostOfLiving.summary ? (
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-150 text-center text-gray-500 text-sm">
                        <Coins className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="font-semibold">Aucune donnée détaillée pour cette ville.</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Les données n'ont pas encore été initialisées.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Budget & Salary Summary */}
                        <div className="bg-[#5EA3C0]/5 p-5 rounded-xl border border-[#5EA3C0]/10 flex flex-col justify-between">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#5EA3C0]">Budget & Salaire</span>
                            <div className="mt-3 space-y-2">
                              <div>
                                <span className="text-xs text-gray-500 block">Budget mensuel moyen</span>
                                <span className="text-lg font-bold text-gray-900">
                                  {cityCostOfLiving.summary.monthlyBudget?.avg ? `${cityCostOfLiving.summary.monthlyBudget.avg.toLocaleString()} €` : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 block">Salaire moyen net</span>
                                <span className="text-lg font-bold text-gray-900">
                                  {cityCostOfLiving.summary.averageSalary ? `${cityCostOfLiving.summary.averageSalary.toLocaleString()} €` : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Housing Rent */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-gray-150">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" /> Logement (Loyer/mois)
                          </span>
                          <div className="mt-3 space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-slate-100">
                              <span className="text-gray-500">1 ch. Centre-ville</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.housing?.rent?.oneBedroom?.cityCenter?.avg
                                  ? `${cityCostOfLiving.categories.housing.rent.oneBedroom.cityCenter.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-100">
                              <span className="text-gray-500">1 ch. Hors centre</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.housing?.rent?.oneBedroom?.outsideCenter?.avg
                                  ? `${cityCostOfLiving.categories.housing.rent.oneBedroom.outsideCenter.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-500">3 ch. Centre-ville</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.housing?.rent?.threeBedroom?.cityCenter?.avg
                                  ? `${cityCostOfLiving.categories.housing.rent.threeBedroom.cityCenter.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Restaurants & Utilities */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-gray-150">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Utensils className="w-3.5 h-3.5" /> Alimentation & Transport
                          </span>
                          <div className="mt-3 space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-slate-100">
                              <span className="text-gray-500">Repas bon marché</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.restaurants?.inexpensiveMeal?.avg
                                  ? `${cityCostOfLiving.categories.restaurants.inexpensiveMeal.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-100">
                              <span className="text-gray-500">Abonnement transport</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.transportation?.publicTransport?.monthlyPass?.avg
                                  ? `${cityCostOfLiving.categories.transportation.publicTransport.monthlyPass.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-500">Internet haut débit</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.utilities?.internet?.avg
                                  ? `${cityCostOfLiving.categories.utilities.internet.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Supermarket */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-gray-150">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <ShoppingBag className="w-3.5 h-3.5" /> Supermarché (Aliments)
                          </span>
                          <div className="mt-3 space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-slate-100">
                              <span className="text-gray-500">Lait (1L)</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.food?.markets?.milk1L?.avg
                                  ? `${cityCostOfLiving.categories.food.markets.milk1L.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-100">
                              <span className="text-gray-500">Pain blanc (500g)</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.food?.markets?.bread500g?.avg
                                  ? `${cityCostOfLiving.categories.food.markets.bread500g.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-100">
                              <span className="text-gray-500">Œufs (12)</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.food?.markets?.eggs12?.avg
                                  ? `${cityCostOfLiving.categories.food.markets.eggs12.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-100">
                              <span className="text-gray-500">Poulet (filet 1kg)</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.food?.markets?.chicken1kg?.avg
                                  ? `${cityCostOfLiving.categories.food.markets.chicken1kg.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-500">Bœuf (viande 1kg)</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.food?.markets?.beef1kg?.avg
                                  ? `${cityCostOfLiving.categories.food.markets.beef1kg.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Clothing */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-gray-150">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Shirt className="w-3.5 h-3.5" /> Habillement & Vêtements
                          </span>
                          <div className="mt-3 space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-slate-100">
                              <span className="text-gray-500">Paire de jeans</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.clothing?.jeans?.avg
                                  ? `${cityCostOfLiving.categories.clothing.jeans.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-100">
                              <span className="text-gray-500">Robe d'été</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.clothing?.summerDress?.avg
                                  ? `${cityCostOfLiving.categories.clothing.summerDress.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-500">Chaussures sport</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.clothing?.runningShoes?.avg
                                  ? `${cityCostOfLiving.categories.clothing.runningShoes.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Childcare */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-gray-150">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Baby className="w-3.5 h-3.5" /> Garde d'enfants & Éduc.
                          </span>
                          <div className="mt-3 space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-slate-100">
                              <span className="text-gray-500">Crèche (Mensuel)</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.childcare?.preschool?.avg
                                  ? `${cityCostOfLiving.categories.childcare.preschool.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-500">Primaire Internat. (Annuel)</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.childcare?.primarySchool?.avg
                                  ? `${cityCostOfLiving.categories.childcare.primarySchool.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Sports & Leisure */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-gray-150">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5" /> Sport, Loisirs & Cult.
                          </span>
                          <div className="mt-3 space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-slate-100">
                              <span className="text-gray-500">Fitness (Mensuel)</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.sports?.gym?.avg
                                  ? `${cityCostOfLiving.categories.sports.gym.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-500">Place de cinéma</span>
                              <span className="font-bold text-gray-900">
                                {cityCostOfLiving.categories.sports?.cinema?.avg
                                  ? `${cityCostOfLiving.categories.sports.cinema.avg} €`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Opportunités */}
            {activeTab === 'jobs' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#5EA3C0]" />
                    Opportunités d'emploi (Adzuna)
                  </h3>
                  {viewingCountry.isoCode && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 uppercase">
                      Code Pays : {viewingCountry.isoCode}
                    </span>
                  )}
                </div>

                {!viewingCountry.isoCode ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm font-semibold">
                    Code ISO manquant ! Veuillez configurer le Code ISO (ex. FR, CA) dans les détails du pays (colonne de gauche) pour pouvoir charger les offres d'emploi d'Adzuna.
                  </div>
                ) : jobsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="w-10 h-10 animate-spin text-[#5EA3C0]" />
                    <span className="text-sm text-gray-500 font-medium">Récupération des offres d'emploi en direct...</span>
                  </div>
                ) : !jobsData || !jobsData.results || jobsData.results.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-[#5EA3C0]/60" />
                    <p className="font-semibold text-gray-655">Aucune offre d'emploi active trouvée</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Aucun résultat renvoyé par l'API pour le code "{viewingCountry.isoCode}".
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold text-gray-600 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <span>Total des offres détectées :</span>
                      <span className="text-[#5EA3C0] font-extrabold">{jobsData.total?.toLocaleString() || 0}</span>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {jobsData.results.map((job: any) => (
                        <div key={job.id} className="py-4 flex items-start justify-between gap-4 group">
                          <div className="space-y-1">
                            <h4 className="font-bold text-gray-900 text-sm hover:text-[#5EA3C0] transition-colors">
                              {job.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold">
                              <span className="text-gray-700 font-bold">{job.company}</span>
                              <span>•</span>
                              <span>{job.location?.displayName || job.location?.city || 'N/A'}</span>
                              {job.salary && (job.salary.min || job.salary.max) && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-extrabold">
                                    {job.salary.min ? `${job.salary.min.toLocaleString()} ${job.salary.currency}` : ''}
                                    {job.salary.max && job.salary.min ? ' - ' : ''}
                                    {job.salary.max ? `${job.salary.max.toLocaleString()} ${job.salary.currency}` : ''}
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs line-clamp-2 mt-1 max-w-2xl" dangerouslySetInnerHTML={{ __html: job.description }} />
                          </div>
                          <a
                            href={job.redirect_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-gray-200 bg-white hover:bg-gray-50 hover:text-[#5EA3C0] text-gray-500 rounded-xl transition-all shadow-sm"
                            title="Voir l'offre sur Adzuna"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Forum */}
            {activeTab === 'forum' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#5EA3C0]" />
                    Modération du Forum
                  </h3>
                  <span className="text-xs text-gray-450 font-semibold uppercase tracking-wider">
                    {forumTopics.length} sujet(s)
                  </span>
                </div>

                {forumTopicsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="w-10 h-10 animate-spin text-[#5EA3C0]" />
                    <span className="text-sm text-gray-500 font-medium">Chargement des sujets du forum...</span>
                  </div>
                ) : forumTopics.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-semibold text-gray-655">Aucun sujet de forum pour ce pays</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Les sujets créés par les utilisateurs liés à ce pays apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {forumTopics.map((topic: any) => (
                      <div key={topic.topic_id} className="py-4 flex items-center justify-between gap-4 group">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-gray-900 text-sm">
                              {topic.title}
                            </h4>
                            {topic.is_pinned && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-extrabold rounded uppercase tracking-wider flex items-center gap-0.5">
                                <Pin className="w-2.5 h-2.5" /> Épinglé
                              </span>
                            )}
                            {topic.is_locked && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[9px] font-extrabold rounded uppercase tracking-wider flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Verrouillé
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs font-semibold">
                            Par <span className="text-gray-655">{topic.user?.fullName || 'Anonymous'}</span> • {new Date(topic.created_at).toLocaleDateString()} • {topic.views_count} vue(s)
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => pinTopicMutation.mutate(topic.topic_id)}
                            disabled={pinTopicMutation.isPending}
                            className={`p-1.5 rounded-lg transition-colors border ${
                              topic.is_pinned
                                ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                            title={topic.is_pinned ? 'Détacher' : 'Épingler'}
                          >
                            {topic.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => lockTopicMutation.mutate(topic.topic_id)}
                            disabled={lockTopicMutation.isPending}
                            className={`p-1.5 rounded-lg transition-colors border ${
                              topic.is_locked
                                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                            title={topic.is_locked ? 'Déverrouiller' : 'Verrouiller'}
                          >
                            {topic.is_locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Voulez-vous vraiment supprimer définitivement ce sujet du forum ?')) {
                                deleteTopicMutation.mutate(topic.topic_id);
                              }
                            }}
                            disabled={deleteTopicMutation.isPending}
                            className="p-1.5 bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Ressources */}
            {activeTab === 'resources' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#5EA3C0]" />
                    Ressources utiles (liens, doc...)
                  </h3>
                  <button
                    type="button"
                    onClick={openAddResModal}
                    className="flex items-center gap-2 bg-[#5EA3C0]/10 hover:bg-[#5EA3C0]/20 text-[#5EA3C0] px-4 py-2 rounded-xl font-bold text-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une ressource
                  </button>
                </div>

                {resourcesLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="w-10 h-10 animate-spin text-[#5EA3C0]" />
                    <span className="text-sm text-gray-500 font-medium">Chargement des ressources...</span>
                  </div>
                ) : countryResources.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-semibold text-gray-655">Aucune ressource enregistrée</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Ajoutez des liens vers des sites web, guides PDF, ou vidéos utiles pour s'installer.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {countryResources.map((res: any) => (
                      <div key={res.idResource} className="py-4 flex items-center justify-between gap-4 group">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="px-2 py-0.5 bg-[#5EA3C0]/10 text-[#5EA3C0] text-[9px] font-extrabold rounded uppercase tracking-wider">
                              {res.resourceType || 'other'}
                            </span>
                            <h4 className="font-bold text-gray-900 text-sm">
                              {res.title}
                            </h4>
                          </div>
                          {res.url && (
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#5EA3C0] hover:underline flex items-center gap-1 font-semibold"
                            >
                              <ExternalLink className="w-3 h-3" /> Ouvrir le lien
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => openEditResModal(res)}
                            className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-[#5EA3C0] rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteResource(res.idResource)}
                            className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Secondary modal for Adding/Editing a Procedure */}
        {procModalOpen && (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="font-bold tracking-wide">
                  {editingProcedure ? 'Modifier la démarche' : 'Ajouter une démarche'}
                </h3>
                <button onClick={closeProcModal} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmitProcedure} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Type de Démarche / Titre *
                  </label>
                  <input
                    type="text"
                    required
                    value={procType}
                    onChange={(e) => setProcType(e.target.value)}
                    placeholder="ex. Demande de Visa VLS-TS"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Catégorie (ex. Visa, Santé...)
                    </label>
                    <input
                      type="text"
                      value={procCategory}
                      onChange={(e) => setProcCategory(e.target.value)}
                      placeholder="ex. Visa"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 mb-1">
                      Ordre de l'étape (Chiffre)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={procStepOrder}
                      onChange={(e) => setProcStepOrder(e.target.value)}
                      placeholder="ex. 1"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 mb-1">
                    Délai Moyen (en jours)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={procAverageDelay}
                    onChange={(e) => setProcAverageDelay(e.target.value)}
                    placeholder="ex. 30"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 mb-1">
                    Description / Instructions
                  </label>
                  <textarea
                    value={procDescription}
                    onChange={(e) => setProcDescription(e.target.value)}
                    placeholder="Expliquer la procédure en détail..."
                    rows={4}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
                  <button
                    type="button"
                    onClick={closeProcModal}
                    className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createProcMutation.isPending || updateProcMutation.isPending}
                    className="px-4 py-2 bg-[#5EA3C0] hover:bg-[#4891b0] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                  >
                    {(createProcMutation.isPending || updateProcMutation.isPending) ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

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
                {t(`comparison.data.continents.${cont.name}`, { defaultValue: cont.name })}
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
                  <th className="py-4 px-6 w-32">Statut</th>
                  <th className="py-4 px-6 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-650">
                {filteredCountries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-6 text-center text-gray-400 italic">
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
                        {country.continent?.name ? t(`comparison.data.continents.${country.continent.name}`, { defaultValue: country.continent.name }) : <span className="text-gray-400 italic">Inconnu</span>}
                      </td>
                      <td className="py-4 px-6">
                        {country.status === 'archived' ? (
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
                            onClick={() => setViewingCountry(country)}
                            disabled={isPending}
                            className="p-1.5 hover:bg-gray-100 text-gray-650 hover:text-[#5EA3C0] rounded-lg transition-colors"
                            title="Voir la fiche"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(country)}
                            disabled={isPending}
                            className="p-1.5 hover:bg-gray-100 text-gray-650 hover:text-[#5EA3C0] rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {country.status === 'archived' ? (
                            <button
                              onClick={() => handleToggleArchive(country.idCountry, true)}
                              disabled={archiveMutation.isPending}
                              className="p-1.5 hover:bg-emerald-50 text-gray-650 hover:text-emerald-600 rounded-lg transition-colors"
                              title="Réactiver"
                            >
                              <ArchiveRestore className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleArchive(country.idCountry, false)}
                              disabled={archiveMutation.isPending}
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
                      {t(`comparison.data.continents.${cont.name}`, { defaultValue: cont.name })}
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

      {/* Modal for Adding/Editing a Resource */}
      {resModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold tracking-wide">
                {editingResource ? 'Modifier la ressource' : 'Ajouter une ressource'}
              </h3>
              <button onClick={closeResModal} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitResource} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 mb-1">
                  Titre de la ressource *
                </label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="ex. Guide d'expatriation au Canada"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-905"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 mb-1">
                  URL / Lien
                </label>
                <input
                  type="url"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  placeholder="ex. https://example.com/guide.pdf"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-905"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 mb-1">
                  Type de ressource
                </label>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-905"
                >
                  <option value="article">Article</option>
                  <option value="video">Vidéo</option>
                  <option value="pdf">Document PDF</option>
                  <option value="website">Site Web</option>
                  <option value="podcast">Podcast</option>
                  <option value="tool">Outil / Simulateur</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={closeResModal}
                  className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createResourceMutation.isPending || updateResourceMutation.isPending}
                  className="px-4 py-2 bg-[#5EA3C0] hover:bg-[#4891b0] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  {(createResourceMutation.isPending || updateResourceMutation.isPending) ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
