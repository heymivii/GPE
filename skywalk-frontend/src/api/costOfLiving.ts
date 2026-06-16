import apiClient from '../lib/api';

export interface PriceRange {
    min: number;
    avg: number;
    max: number;
    currency: string;
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
        [key: string]: PriceRange;
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

export const costOfLivingApi = {
    getCostOfLiving: async (city: string, country: string): Promise<CleanedCostOfLivingData> => {
        const response = await apiClient.get<CleanedCostOfLivingData>('/cost-of-living/search', {
            params: { city, country },
        });
        return response.data;
    },
    updateCostOfLiving: async (cityId: number, data: CleanedCostOfLivingData): Promise<CleanedCostOfLivingData> => {
        const response = await apiClient.put<CleanedCostOfLivingData>(`/cost-of-living/${cityId}`, data);
        return response.data;
    },
};
