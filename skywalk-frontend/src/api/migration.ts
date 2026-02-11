import apiClient from '../lib/api';

export interface MigrationEntry {
  value: number;
  year: number;
}

export interface CountryMigrationData {
  countryCode: string;
  countryName: string;
  inflowsForeignPop?: MigrationEntry;
  outflowsForeignPop?: MigrationEntry;
  asylumSeekers?: MigrationEntry;
  stocksForeignPop?: MigrationEntry;
  nationalityAcquisitions?: MigrationEntry;
}

export const migrationApi = {
  getAll: async (): Promise<CountryMigrationData[]> => {
    const response = await apiClient.get<CountryMigrationData[]>('/migration');
    return response.data;
  },

  getByCountry: async (code: string): Promise<CountryMigrationData | null> => {
    const response = await apiClient.get<CountryMigrationData | null>(`/migration/${code}`);
    return response.data;
  },
};
