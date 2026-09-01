export interface Country {
  idCountry: number;
  countryName: string;
  isoCode: string;
  currency?: string;
  language?: string;
  flagUrl?: string;
  visaInfo?: string;
  description?: string;
  imageUrl?: string;
  capital?: string;
  continent?: {
    idContinent: number;
    name: string;
  };
}

export interface DestinationStats {
  memberCount: number;
  jobOffersCount: number;
  forumTopicsCount: number;
  resourcesCount: number;
}


export interface PriceRange {
  avg: number;
  min: number;
  max: number;
  currency: string;
}

export interface CostOfLivingCurrency {
  code: string;
  lastUpdated: string;
  exchangeRates: Record<string, number>;
}

export interface CostOfLivingSummary {
  averageSalary: number;
  monthlyBudget: { avg: number; min: number; max: number };
}

export interface CostOfLivingHousing {
  rent: {
    oneBedroom: { cityCenter: PriceRange; outsideCenter: PriceRange };
    threeBedroom: { cityCenter: PriceRange; outsideCenter: PriceRange };
  };
  buy: {
    pricePerSqm: { cityCenter: PriceRange; outsideCenter: PriceRange };
  };
}

export interface CostOfLivingRestaurants {
  inexpensiveMeal: PriceRange;
  midRangeMeal2People: PriceRange;
  mcMeal: PriceRange;
  cappuccino: PriceRange;
  cocaCola: PriceRange;
  domesticBeer: PriceRange;
  importedBeer: PriceRange;
}

export interface CostOfLivingTransportation {
  publicTransport: { monthlyPass: PriceRange; oneWayTicket: PriceRange };
  taxi: { start: PriceRange; per1km: PriceRange; waitingHour: PriceRange };
  personal: { gasoline1L: PriceRange; newCar: PriceRange };
}

export interface CostOfLivingData {
  city: { id: number; name: string; country: string };
  summary: CostOfLivingSummary;
  currency: CostOfLivingCurrency;
  categories: {
    housing: CostOfLivingHousing;
    restaurants: CostOfLivingRestaurants;
    transportation: CostOfLivingTransportation;
    food: { markets: Record<string, PriceRange> };
    utilities: { basic85m2: PriceRange; internet: PriceRange; mobileMinute: PriceRange };
    clothing: Record<string, PriceRange>;
    childcare: Record<string, PriceRange>;
    sports: Record<string, PriceRange>;
    salary: { averageMonthly: PriceRange; mortgageRate: { avg: number; min: number; max: number } };
  };
}

export interface CityDestination {
  idCity?: number; // actual field returned by the backend (City entity primary key)
  city_id?: number;
  id?: number;
  name: string;
  slug: string;
  latitude?: string;
  longitude?: string;
  population?: number;
  timezone?: string;
  isCapital: boolean;
  priority: number;
  imageUrl?: string;
  description?: string;
  country: Country;
  costOfLiving?: CostOfLivingData | null;

  stats?: DestinationStats;
  highlights?: string[];
}

export interface CountryDestination extends Country {
  stats?: DestinationStats;
}

export interface CountryDetail extends CountryDestination {
  cities: CityDestination[];
  costOfLiving?: {
    averageHousing: string | null;
    currency: string;
  };
  administrativeProcedures?: { id: number; title: string; description?: string }[];
}
