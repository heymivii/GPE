import apiClient from '../lib/api';
import type { CountryDestination, CountryDetail } from '../features/destinations/types';

export const destinationsApi = {
    getAll: async (): Promise<CountryDestination[]> => {
        const response = await apiClient.get<CountryDestination[]>('/destinations');
        return response.data;
    },

    getBySlug: async (slug: string): Promise<CountryDetail> => {
        const response = await apiClient.get<CountryDetail>(`/destinations/${slug}`);
        return response.data;
    }
};
