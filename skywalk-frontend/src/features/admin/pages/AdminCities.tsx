import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cityApi, type City } from '../../../api/city';
import { countryApi } from '../../../api/country';
import { costOfLivingApi } from '../../../api/costOfLiving';
import { cityIndicesApi } from '../../../api/cityIndices';
import { userApi } from '../../../api/user';
import { useAuth } from '../../../hooks/useAuth';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Edit2, Globe, RefreshCw, X, Search, Eye, ChevronRight, ArrowLeft, Save, Coins, Building2, Utensils, Car, Loader2, Globe2, ShoppingBag, Shirt, Baby, Activity, Archive, ArchiveRestore, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Combobox from '../components/Combobox';

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
  const [cityListTab, setCityListTab] = useState<'active' | 'trash'>('active');

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
  // Cost-of-living fetch modal: lets the admin correct the Numbeo slug before fetching.
  // Numbeo disambiguates secondary cities by country in the URL (e.g. "Ajaccio" is a
  // dead page, the real slug is "Ajaccio-France"), which the auto-derived slug can't guess.
  const [colCity, setColCity] = useState<City | null>(null);
  const [colSlug, setColSlug] = useState('');
  // AUTO-FILL géo : dès qu'un nom de ville est saisi/choisi, les champs vides
  // (lat/long/population/fuseau/capitale/image) se remplissent seuls (Open-Meteo + Wikipédia).
  const autofillTimer = useRef<number | null>(null);

  const { data: cities = [], isLoading: citiesLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-cities-list'],
    queryFn: cityApi.getAll,
  });

  const { user } = useAuth();
  const myId = user?.idUser;

  // Who may make the FINAL publish/reject decision on a city (mirrors the backend guard):
  //  - assigned flow: after 'review_done', by an admin ≠ assignee and ≠ the one who verified;
  //  - legacy 4-eyes flow (no assignee): any admin ≠ the creator, while 'pending_review'.
  const canFinalize = (city: City): boolean => {
    if (city.assignedToId != null) {
      return (
        city.status === 'review_done' &&
        myId !== city.assignedToId &&
        myId !== city.reviewedBy?.idUser
      );
    }
    return city.status === 'pending_review' && myId !== city.createdBy?.idUser;
  };

  // Admins for the "assign the verification to" select (creation only)
  const [assignedToId, setAssignedToId] = useState<number | ''>('');
  const { data: adminsPage } = useQuery({
    queryKey: ['admins-for-assignment'],
    queryFn: () => userApi.getUsersAdmin(1, 100),
  });
  const admins = (adminsPage?.data ?? []).filter((u: any) => u.roles === 'admin');

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

  const { data: viewingCityIndices, isLoading: viewingCityIndicesLoading } = useQuery({
    queryKey: ['admin-city-indices-summary', viewingCity?.idCity],
    queryFn: async () => {
      if (!viewingCity) return null;
      const [qol, prop] = await Promise.all([
        cityIndicesApi.getQualityOfLife(viewingCity.idCity),
        cityIndicesApi.getPropertyInvestment(viewingCity.idCity),
      ]);
      return { qol, prop };
    },
    enabled: !!viewingCity,
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

  // Cities of the currently-selected country (geo source), for the picker autocomplete.
  const selectedCountryName = useMemo(
    () => countries.find((c) => c.idCountry === countryId)?.countryName ?? '',
    [countries, countryId],
  );
  const { data: availableCities = [] } = useQuery({
    queryKey: ['geo-cities', selectedCountryName],
    queryFn: () => cityApi.getAvailable(selectedCountryName),
    enabled: !!selectedCountryName && modalOpen,
    staleTime: 1000 * 60 * 60,
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

  const visibleCities = useMemo(() => {
    return filteredCities.filter((city: City) =>
      cityListTab === 'trash' ? city.status === 'archived' : city.status !== 'archived',
    );
  }, [filteredCities, cityListTab]);

  const cityCounts = useMemo(
    () => ({
      active: filteredCities.filter((city: City) => city.status !== 'archived').length,
      trash: filteredCities.filter((city: City) => city.status === 'archived').length,
    }),
    [filteredCities],
  );

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
    mutationFn: ({ city, slug }: { city: City; slug?: string }) =>
      costOfLivingApi.adminFetch({
        city: city.name,
        country: countryNameOf(city),
        slug: slug?.trim() || undefined,
      }),
    onMutate: ({ city }: { city: City; slug?: string }) =>
      setFetchingColId(city.idCity),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['destinations-list'] });
      const miss = res.unavailable?.length ?? 0;
      toast.success(
        `${res.city} : ${res.pricedFields} prix récupérés — loyer ${res.rentAvg} ${res.currency}, budget ${res.summary.monthlyBudget.avg} ${res.currency}, salaire ${res.summary.averageSalary} ${res.currency}${
          miss ? ` (${miss} non dispo)` : ''
        }.`,
        { duration: 6000 },
      );
      closeColModal();
    },
    onError: (err: any) => {
      // Keep the modal open so the admin can correct the slug and retry.
      toast.error(
        err.response?.data?.message ||
          'Échec — ville introuvable sur Numbeo (vérifie le slug) ?',
      );
    },
    onSettled: () => setFetchingColId(null),
  });

  // Pre-fill with the same slug the backend derives by default (name, spaces → hyphens),
  // so the admin sees what's tried and only edits when Numbeo needs a country suffix.
  const openColModal = (city: City) => {
    setColCity(city);
    setColSlug(city.name.trim().replace(/\s+/g, '-'));
  };
  const closeColModal = () => setColCity(null);

  const openCreateModal = () => {
    setEditingCity(null);
    setAssignedToId('');
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
      ...(assignedToId ? { assignedToId: Number(assignedToId) } : {}),
    };

    if (editingCity) {
      updateMutation.mutate({ id: editingCity.idCity, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const archiveMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'archived' }) =>
      cityApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities-list'] });
      queryClient.invalidateQueries({ queryKey: ['destinations-list'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de l\'archivage.';
      toast.error(msg);
    },
  });

  const handleToggleArchive = (id: number, isArchived: boolean) => {
    if (isArchived) {
      if (window.confirm('Voulez-vous réactiver cette ville ?')) {
        archiveMutation.mutate({ id, status: 'active' });
      }
    } else {
      if (window.confirm('Voulez-vous vraiment archiver cette ville ? Les données associées seront conservées mais la ville sera désactivée.')) {
        archiveMutation.mutate({ id, status: 'archived' });
      }
    }
  };

  // Fill ONLY the empty fields (never clobber what the admin typed); silent on failure —
  // this runs automatically in the background, an error toast per keystroke would be noise.
  const autofillGeo = async (cityName: string) => {
    const countryName = countries.find((c) => c.idCountry === countryId)?.countryName;
    try {
      const d = await cityApi.autofill(cityName, countryName);
      setLatitude((v) => v || (d.latitude != null ? String(d.latitude) : ''));
      setLongitude((v) => v || (d.longitude != null ? String(d.longitude) : ''));
      setPopulation((v) => v || (d.population != null ? String(d.population) : ''));
      setTimezone((v) => v || (d.timezone ?? ''));
      setImageUrl((v) => v || (d.imageUrl ?? ''));
      setIsCapital((v) => v || d.isCapital);
      toast.success(`Données géographiques remplies pour ${d.matchedName ?? cityName}`, { id: 'geo-autofill' });
    } catch {
      /* automatic background behavior — stay silent */
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (autofillTimer.current) window.clearTimeout(autofillTimer.current);
    if (!value.trim() || value.trim().length < 3) return;
    autofillTimer.current = window.setTimeout(() => void autofillGeo(value.trim()), 900);
  };

  // ── Numbeo CITY indices modal: view + fetch from Numbeo + MANUAL EDIT ──────
  // Manual edits are stored with source='manuel'; a Numbeo re-fetch replaces them.
  const QOL_FIELDS: Array<[string, string]> = [
    ['qualityOfLife', 'Qualité de vie'],
    ['purchasingPower', "Pouvoir d'achat"],
    ['safety', 'Sécurité'],
    ['healthCare', 'Santé'],
    ['costOfLiving', 'Coût de la vie'],
    ['propertyPriceToIncome', 'Prix immo / revenu'],
    ['trafficCommuteTime', 'Temps de trajet'],
    ['pollution', 'Pollution'],
    ['climate', 'Climat'],
  ];
  const PROP_FIELDS: Array<[string, string]> = [
    ['priceToIncomeRatio', 'Prix / revenu'],
    ['mortgageAsPctIncome', 'Mensualité (% revenu)'],
    ['loanAffordabilityIndex', 'Accessibilité crédit'],
    ['priceToRentCityCentre', 'Prix/loyer (centre)'],
    ['priceToRentOutside', 'Prix/loyer (périph.)'],
    ['grossRentalYieldCityCentre', 'Rendement centre (%)'],
    ['grossRentalYieldOutside', 'Rendement périph. (%)'],
    ['gdpPerCapita', 'PIB/hab ($)'],
    ['gdpGrowthRate', 'Croissance PIB (%)'],
    ['populationGrowthRate', 'Croissance pop. (%)'],
  ];
  const [idxCity, setIdxCity] = useState<City | null>(null);
  const [idxQol, setIdxQol] = useState<Record<string, string>>({});
  const [idxProp, setIdxProp] = useState<Record<string, string>>({});
  const [idxSources, setIdxSources] = useState<{ qol?: string; prop?: string }>({});
  const [idxBusy, setIdxBusy] = useState<'load' | 'fetch' | 'save' | null>(null);

  const numToStr = (v: number | null | undefined) => (v == null ? '' : String(v));
  const fillQol = (d: Record<string, unknown> | null) =>
    setIdxQol(Object.fromEntries(QOL_FIELDS.map(([k]) => [k, numToStr(d?.[k] as number | null)])));
  const fillProp = (d: Record<string, unknown> | null) =>
    setIdxProp(Object.fromEntries(PROP_FIELDS.map(([k]) => [k, numToStr(d?.[k] as number | null)])));

  const openIdxModal = async (city: City) => {
    setIdxCity(city);
    setIdxBusy('load');
    const [qol, prop] = await Promise.allSettled([
      cityIndicesApi.getQualityOfLife(city.idCity),
      cityIndicesApi.getPropertyInvestment(city.idCity),
    ]);
    fillQol(qol.status === 'fulfilled' ? (qol.value as never) : null);
    fillProp(prop.status === 'fulfilled' ? (prop.value as never) : null);
    setIdxSources({
      qol: qol.status === 'fulfilled' ? qol.value?.source : undefined,
      prop: prop.status === 'fulfilled' ? prop.value?.source : undefined,
    });
    setIdxBusy(null);
  };

  const fetchIdxFromNumbeo = async () => {
    if (!idxCity || idxBusy) return;
    setIdxBusy('fetch');
    const [qol, prop] = await Promise.allSettled([
      cityIndicesApi.fetchQualityOfLife(idxCity.idCity),
      cityIndicesApi.fetchPropertyInvestment(idxCity.idCity),
    ]);
    if (qol.status === 'fulfilled') {
      fillQol(qol.value as never);
      setIdxSources((s) => ({ ...s, qol: qol.value.source }));
      toast.success('Indices qualité de vie récupérés (Numbeo)');
    } else {
      toast.error((qol.reason as any)?.response?.data?.message || 'Qualité de vie indisponible sur Numbeo');
    }
    if (prop.status === 'fulfilled') {
      fillProp(prop.value as never);
      setIdxSources((s) => ({ ...s, prop: prop.value.source }));
      toast.success('Indicateurs immobiliers récupérés (Numbeo)');
    } else {
      toast.error((prop.reason as any)?.response?.data?.message || 'Immobilier indisponible sur Numbeo');
    }
    setIdxBusy(null);
  };

  const saveIdx = async () => {
    if (!idxCity || idxBusy) return;
    setIdxBusy('save');
    const toPatch = (fields: Array<[string, string]>, form: Record<string, string>) =>
      Object.fromEntries(
        fields.map(([k]) => {
          const raw = (form[k] ?? '').trim();
          if (raw === '') return [k, null]; // empty input explicitly clears the value
          const n = Number(raw.replace(',', '.'));
          return [k, Number.isNaN(n) ? null : n];
        }),
      );
    try {
      const [q, p] = await Promise.all([
        cityIndicesApi.updateQualityOfLife(idxCity.idCity, toPatch(QOL_FIELDS, idxQol)),
        cityIndicesApi.updatePropertyInvestment(idxCity.idCity, toPatch(PROP_FIELDS, idxProp)),
      ]);
      setIdxSources({ qol: q.source, prop: p.source });
      toast.success(`Indices de ${idxCity.name} enregistrés (source : manuel)`);
      setIdxCity(null);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erreur lors de l'enregistrement des indices");
    }
    setIdxBusy(null);
  };

  // Step 1 of the assigned flow: the reviewer marks the verification done.
  const reviewDoneMutation = useMutation({
    mutationFn: (id: number) => cityApi.reviewDone(id),
    onSuccess: (city) => {
      toast.success(`Vérification de « ${city.name} » enregistrée — l'auteur doit valider`);
      queryClient.invalidateQueries({ queryKey: ['admin-cities-list'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  // Review workflow: approve publishes user-side; reject keeps it hidden. The backend enforces
  // the 4-eyes rule (the author cannot validate their own addition → clear 403 message).
  const reviewMutation = useMutation({
    mutationFn: ({ id, approve }: { id: number; approve: boolean }) =>
      approve ? cityApi.approve(id) : cityApi.reject(id),
    onSuccess: (city, { approve }) => {
      toast.success(
        approve
          ? `Ville « ${city.name} » vérifiée et publiée ✓`
          : `Ville « ${city.name} » rejetée — non publiée`,
      );
      queryClient.invalidateQueries({ queryKey: ['admin-cities-list'] });
      queryClient.invalidateQueries({ queryKey: ['destinations-list'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la vérification.');
    },
  });


  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    archiveMutation.isPending ||
    reviewMutation.isPending;

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
                onClick={() => setIdxCity(viewingCity)}
                className="px-4 py-2.5 border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                Éditer les indices
              </button>
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
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-violet-600" />
                  Indices de la ville
                </h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
                  Aperçu rapide
                </span>
              </div>
              {viewingCityIndicesLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  Chargement des indices...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Qualité de vie</div>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {viewingCityIndices?.qol?.qualityOfLife ?? '—'}
                      </span>
                      <span className="text-xs text-gray-500 pb-1">Numbeo</span>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                      <div>Sécurité: {viewingCityIndices?.qol?.safety ?? '—'}</div>
                      <div>Pouvoir d'achat: {viewingCityIndices?.qol?.purchasingPower ?? '—'}</div>
                      <div>Santé: {viewingCityIndices?.qol?.healthCare ?? '—'}</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Immobilier</div>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {viewingCityIndices?.prop?.priceToRentCityCentre ?? '—'}
                      </span>
                      <span className="text-xs text-gray-500 pb-1">Prix/loyer centre</span>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                      <div>Rendement centre: {viewingCityIndices?.prop?.grossRentalYieldCityCentre ?? '—'}</div>
                      <div>Prix/revenu: {viewingCityIndices?.prop?.priceToIncomeRatio ?? '—'}</div>
                      <div>Accessibilité crédit: {viewingCityIndices?.prop?.loanAffordabilityIndex ?? '—'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
            {visibleCities.length} résultat(s)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
        <button
          type="button"
          onClick={() => setCityListTab('active')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            cityListTab === 'active'
              ? 'bg-[#5EA3C0] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Villes actives <span className="ml-1 text-xs opacity-80">({cityCounts.active})</span>
        </button>
        <button
          type="button"
          onClick={() => setCityListTab('trash')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            cityListTab === 'trash'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Corbeille <span className="ml-1 text-xs opacity-80">({cityCounts.trash})</span>
        </button>
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
                {visibleCities.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 px-6 text-center text-gray-400 italic">
                      {cityListTab === 'trash'
                        ? 'La corbeille est vide.'
                        : 'Aucune ville ne correspond aux critères.'}
                    </td>
                  </tr>
                ) : (
                  visibleCities.map((city) => (
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
                        {city.status === 'review_done' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-violet-100 text-violet-700">
                            Vérifiée — à valider
                          </span>
                        ) : city.status === 'pending_review' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-blue-100 text-blue-800">
                            À vérifier
                          </span>
                        ) : city.status === 'rejected' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-red-100 text-red-700">
                            Rejeté
                          </span>
                        ) : city.status === 'archived' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-amber-100 text-amber-800">
                            Archivé
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-emerald-100 text-emerald-800">
                            Actif
                          </span>
                        )}
                        {(city.createdBy || city.assignedTo) && (
                          <p className="text-[10px] text-gray-400 mt-1">
                            {city.createdBy && `Ajouté par ${city.createdBy.firstName ?? '?'}`}
                            {city.assignedTo && ` · assignée à ${city.assignedTo.firstName ?? '?'}`}
                            {city.reviewedBy && ` · vérifiée par ${city.reviewedBy.firstName ?? '?'}`}
                          </p>
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
                            onClick={() => openColModal(city)}
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
                            onClick={() => openIdxModal(city)}
                            disabled={idxCity !== null}
                            className="p-1.5 hover:bg-violet-50 text-gray-600 hover:text-violet-600 rounded-lg transition-colors disabled:opacity-50"
                            title="Indices ville (qualité de vie + immobilier) : consulter, récupérer depuis Numbeo ou éditer"
                          >
                            {idxCity?.idCity === city.idCity && idxBusy === 'load' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Activity className="w-4 h-4" />
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
                          {/* The assigned reviewer marks the check done (step 1). */}
                          {city.status === 'pending_review' &&
                          city.assignedToId != null &&
                          city.assignedToId === myId ? (
                            <button
                              onClick={() => reviewDoneMutation.mutate(city.idCity)}
                              disabled={reviewDoneMutation.isPending}
                              className="p-1.5 hover:bg-violet-50 text-gray-650 hover:text-violet-600 rounded-lg transition-colors"
                              title="J'ai vérifié cette ville — l'auteur validera ensuite"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          ) : canFinalize(city) ? (
                            /* Final decision (step 2): publish or send back — only shown to an admin allowed to decide. */
                            <>
                              <button
                                onClick={() => reviewMutation.mutate({ id: city.idCity, approve: true })}
                                disabled={reviewMutation.isPending}
                                className="p-1.5 hover:bg-emerald-50 text-gray-650 hover:text-emerald-600 rounded-lg transition-colors"
                                title="Valider et publier"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Rejeter la ville « ${city.name} » ?${city.assignedToId ? ' Elle repartira en review chez l’assigné.' : ' Elle ne sera pas publiée.'}`)) {
                                    reviewMutation.mutate({ id: city.idCity, approve: false });
                                  }
                                }}
                                disabled={reviewMutation.isPending}
                                className="p-1.5 hover:bg-red-50 text-gray-650 hover:text-red-600 rounded-lg transition-colors"
                                title={city.assignedToId ? 'Renvoyer en review' : 'Rejeter (non publiée)'}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          ) : city.status === 'archived' ? (
                            cityListTab === 'trash' ? (
                              <>
                                <button
                                  onClick={() => handleToggleArchive(city.idCity, true)}
                                  disabled={archiveMutation.isPending}
                                  className="p-1.5 hover:bg-emerald-50 text-gray-650 hover:text-emerald-600 rounded-lg transition-colors"
                                  title="Réactiver"
                                >
                                  <ArchiveRestore className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Supprimer définitivement la ville « ${city.name} » ? Cette action est irréversible.`)) {
                                      deleteMutation.mutate(city.idCity);
                                    }
                                  }}
                                  disabled={deleteMutation.isPending}
                                  className="p-1.5 hover:bg-red-50 text-gray-650 hover:text-red-600 rounded-lg transition-colors"
                                  title="Supprimer définitivement"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleToggleArchive(city.idCity, true)}
                                disabled={archiveMutation.isPending}
                                className="p-1.5 hover:bg-emerald-50 text-gray-650 hover:text-emerald-600 rounded-lg transition-colors"
                                title="Réactiver"
                              >
                                <ArchiveRestore className="w-4 h-4" />
                              </button>
                            )
                          ) : (
                            cityListTab === 'trash' ? null : (
                              <button
                                onClick={() => handleToggleArchive(city.idCity, false)}
                                disabled={archiveMutation.isPending}
                                className="p-1.5 hover:bg-amber-50 text-gray-650 hover:text-amber-600 rounded-lg transition-colors"
                                title="Archiver"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            )
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
                  <Combobox
                    id="city-name"
                    required
                    options={availableCities}
                    value={name}
                    onChange={handleNameChange}
                    disabled={!countryId}
                    placeholder={
                      countryId
                        ? 'Tape ou choisis une ville…'
                        : "Choisis d'abord un pays"
                    }
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

                {!editingCity && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Assigner la vérification à
                    </label>
                    <select
                      value={assignedToId}
                      onChange={(e) => setAssignedToId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] text-sm text-gray-900 bg-white"
                    >
                      <option value="">— Aucun (tous les admins notifiés) —</option>
                      {admins.map((a: { idUser: number; firstName?: string; lastName?: string; email?: string }) => (
                        <option key={a.idUser} value={a.idUser}>
                          {[a.firstName, a.lastName].filter(Boolean).join(' ') || a.email}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-gray-400 mt-1">
                      L'assigné vérifie puis marque « vérification faite » — vous validez ensuite la publication.
                    </p>
                  </div>
                )}

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

      {/* Cost-of-Living Fetch Modal (editable Numbeo slug) */}
      {colCity && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold tracking-wide flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Coût de la vie — {colCity.name}
              </h3>
              <button onClick={closeColModal} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!colSlug.trim()) {
                  toast.error('Le slug Numbeo est requis.');
                  return;
                }
                fetchColMutation.mutate({ city: colCity, slug: colSlug });
              }}
              className="p-6 space-y-4"
            >
              <p className="text-sm text-gray-500">
                Pays : <span className="font-semibold text-gray-800">{countryNameOf(colCity) || 'Inconnu'}</span>
              </p>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Slug Numbeo
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={colSlug}
                  onChange={(e) => setColSlug(e.target.value)}
                  placeholder="ex. Paris, New-York, Ajaccio-France"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0] text-sm text-gray-900 font-mono"
                />
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                  Pour les villes secondaires, Numbeo ajoute le pays au slug (ex.{' '}
                  <span className="font-mono text-gray-600">Ajaccio-France</span>). Vérifie la page avant :
                </p>
                <a
                  href={`https://www.numbeo.com/cost-of-living/in/${encodeURIComponent(colSlug.trim())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-[#5EA3C0] hover:underline break-all"
                >
                  numbeo.com/cost-of-living/in/{colSlug.trim() || '…'}
                </a>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={closeColModal}
                  className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={fetchingColId === colCity.idCity || !colSlug.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  {fetchingColId === colCity.idCity ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Récupération…
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      Récupérer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* City indices modal: view + fetch from Numbeo + manual edit (source 'manuel') */}
      {idxCity && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 border border-gray-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold tracking-wide flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-300" />
                Indices ville — {idxCity.name}
              </h3>
              <button onClick={() => setIdxCity(null)} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                Modifie les valeurs à la main (source passera à <strong>manuel</strong>), ou récupère-les depuis
                Numbeo — <strong>attention</strong> : une récupération Numbeo écrase les éditions manuelles.
                Champ vide = valeur effacée.
              </p>

              {idxBusy === 'load' ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                  Chargement des indices…
                </div>
              ) : (
                <>
                  {/* Quality of life */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Qualité de vie</h4>
                      {idxSources.qol && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          idxSources.qol === 'manuel' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          source : {idxSources.qol}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {QOL_FIELDS.map(([key, label]) => (
                        <label key={key} className="flex flex-col gap-1">
                          <span className="text-[11px] font-semibold text-gray-500">{label}</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={idxQol[key] ?? ''}
                            onChange={(e) => setIdxQol((f) => ({ ...f, [key]: e.target.value }))}
                            placeholder="—"
                            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-violet-400"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Property investment */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Investissement immobilier</h4>
                      {idxSources.prop && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          idxSources.prop === 'manuel' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          source : {idxSources.prop}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {PROP_FIELDS.map(([key, label]) => (
                        <label key={key} className="flex flex-col gap-1">
                          <span className="text-[11px] font-semibold text-gray-500">{label}</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={idxProp[key] ?? ''}
                            onChange={(e) => setIdxProp((f) => ({ ...f, [key]: e.target.value }))}
                            placeholder="—"
                            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-violet-400"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 flex-wrap">
              <button
                type="button"
                onClick={fetchIdxFromNumbeo}
                disabled={idxBusy !== null}
                className="flex items-center gap-2 px-4 py-2 border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {idxBusy === 'fetch' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Récupérer depuis Numbeo
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIdxCity(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={saveIdx}
                  disabled={idxBusy !== null}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  {idxBusy === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer (manuel)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
