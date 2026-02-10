import axios from 'axios';

interface CityData {
    id: number;
    name: string;
    country: string;
    countryCode: string;
    latitude: number;
    longitude: number;
    population: number;
    timezone: string;
}

class GeoDBService {
    private readonly apiKey = process.env.RAPIDAPI_KEY || ''; // Ensure key exists
    private readonly baseURL = 'https://wft-geo-db.p.rapidapi.com/v1/geo';

    /**
     * Search for a city by name and country code
     */
    async searchCity(cityName: string, countryCode: string): Promise<CityData | null> {
        try {
            const response = await axios.get(`${this.baseURL}/cities`, {
                params: {
                    namePrefix: cityName,
                    countryIds: countryCode,
                    types: 'CITY',
                    limit: 1,
                    sort: '-population'
                },
                headers: {
                    'x-rapidapi-key': this.apiKey, // Use lowercase header key as per axios example
                    'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com'
                }
            });

            const data = response.data;

            if (data.data && data.data.length > 0) {
                return data.data[0];
            }

            return null;
        } catch (error: any) {
            console.error(`Error fetching city ${cityName}:`, error.message);
            return null;
        }
    }

    /**
     * Helper to respect rate limits
     */
    async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default new GeoDBService();
