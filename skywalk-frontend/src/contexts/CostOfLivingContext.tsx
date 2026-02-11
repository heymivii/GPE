import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { costOfLivingApi } from '../api/costOfLiving';
import type { CleanedCostOfLivingData } from '../api/costOfLiving';

import { SUPPORTED_COUNTRIES } from '../data/supportedCountries';

interface CostOfLivingContextType {
    data: CleanedCostOfLivingData | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    city: string | null;
    country: string | null;
    setTarget: (city: string, country: string) => void;
    clearTarget: () => void;
    supportedCountries: typeof SUPPORTED_COUNTRIES;
}

const CostOfLivingContext = createContext<CostOfLivingContextType | undefined>(undefined);

export function CostOfLivingProvider({ children }: { children: ReactNode }) {
    const [city, setCity] = useState<string | null>(null);
    const [country, setCountry] = useState<string | null>(null);

    const { data, isLoading, isError, error } = useQuery<CleanedCostOfLivingData>({
        queryKey: ['costOfLiving', city, country],
        queryFn: () => {
            if (!city || !country) return Promise.reject('No target selected');
            return costOfLivingApi.getCostOfLiving(city, country);
        },
        enabled: !!city && !!country,
        retry: false,
        staleTime: 1000 * 60 * 60 * 24,
    });

    const setTarget = (newCity: string, newCountry: string) => {
        setCity(newCity);
        setCountry(newCountry);
    };

    const clearTarget = () => {
        setCity(null);
        setCountry(null);
    }

    const value = {
        data,
        isLoading,
        isError,
        error,
        city,
        country,
        setTarget,
        clearTarget,
        supportedCountries: SUPPORTED_COUNTRIES
    };

    return (
        <CostOfLivingContext.Provider value={value}>
            {children}
        </CostOfLivingContext.Provider>
    );
}

export function useCostOfLiving() {
    const context = useContext(CostOfLivingContext);
    if (context === undefined) {
        throw new Error('useCostOfLiving must be used within a CostOfLivingProvider');
    }
    return context;
}
