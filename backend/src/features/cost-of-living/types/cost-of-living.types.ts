export interface RawAPIResponse {
    city_id: number;
    city_name: string;
    state_code: string | null;
    country_name: string;
    exchange_rate: {
        [key: string]: number;
    };
    exchange_rates_updated: {
        date: string;
        timestamp: number;
    };
    prices: Array<{
        good_id: number;
        item_name: string;
        category_id: number;
        category_name: string;
        min: number;
        avg: number;
        max: number;
        usd: {
            min: string;
            avg: string;
            max: string;
        };
        measure: 'money' | 'percent';
        currency_code: string;
    }>;
    error: null | string;
}

export interface CleanedCostOfLivingData {
    city: {
        id: number;
        name: string;
        country: string;
        state?: string;
    };

    currency: {
        code: string;
        exchangeRates: {
            [key: string]: number;
        };
        lastUpdated: string;
    };

    categories: {
        housing: HousingData;
        food: FoodData;
        transportation: TransportationData;
        utilities: UtilitiesData;
        restaurants: RestaurantsData;
        clothing: ClothingData;
        childcare: ChildcareData;
        sports: SportsData;
        salary: SalaryData;
    };

    summary: {
        monthlyBudget: {
            min: number;
            avg: number;
            max: number;
        };
        averageSalary: number;
    };
}

export interface HousingData {
    rent: {
        oneBedroom: {
            cityCenter: PriceRange;
            outsideCenter: PriceRange;
        };
        threeBedroom: {
            cityCenter: PriceRange;
            outsideCenter: PriceRange;
        };
    };
    buy: {
        pricePerSqm: {
            cityCenter: PriceRange;
            outsideCenter: PriceRange;
        };
    };
}

export interface FoodData {
    markets: {
        milk1L: PriceRange;
        bread500g: PriceRange;
        eggs12: PriceRange;
        chicken1kg: PriceRange;
        beef1kg: PriceRange;
        cheese1kg: PriceRange;
        rice1kg: PriceRange;
        potato1kg: PriceRange;
        tomato1kg: PriceRange;
        onion1kg: PriceRange;
        apple1kg: PriceRange;
        banana1kg: PriceRange;
        orange1kg: PriceRange;
        lettuce: PriceRange;
        water15L: PriceRange;
        wine: PriceRange;
        domesticBeer: PriceRange;
        importedBeer: PriceRange;
        cigarettes: PriceRange;
    };
}

export interface TransportationData {
    publicTransport: {
        oneWayTicket: PriceRange;
        monthlyPass: PriceRange;
    };
    taxi: {
        start: PriceRange;
        per1km: PriceRange;
        waitingHour: PriceRange;
    };
    personal: {
        gasoline1L: PriceRange;
        newCar: PriceRange;
    };
}

export interface UtilitiesData {
    basic85m2: PriceRange;
    internet: PriceRange;
    mobileMinute: PriceRange;
}

export interface RestaurantsData {
    inexpensiveMeal: PriceRange;
    midRangeMeal2People: PriceRange;
    mcMeal: PriceRange;
    cappuccino: PriceRange;
    cocaCola: PriceRange;
    domesticBeer: PriceRange;
    importedBeer: PriceRange;
}

export interface ClothingData {
    jeans: PriceRange;
    summerDress: PriceRange;
    runningShoes: PriceRange;
    leatherShoes: PriceRange;
}

export interface ChildcareData {
    preschool: PriceRange;
    primarySchool: PriceRange;
}

export interface SportsData {
    cinema: PriceRange;
    gym: PriceRange;
    tennis: PriceRange;
}

export interface SalaryData {
    averageMonthly: PriceRange;
    mortgageRate: {
        min: number;
        avg: number;
        max: number;
    };
}

export interface PriceRange {
    min: number;
    avg: number;
    max: number;
    currency: string;
}
