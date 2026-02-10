import axios from 'axios';
import * as NodeCache from 'node-cache';

interface CountryInfo {
    name: {
        common: string;
        official: string;
    };
    capital: string[];
    currencies: {
        [code: string]: {
            name: string;
            symbol: string;
        };
    };
    languages: {
        [code: string]: string;
    };
    timezones: string[];
    continents: string[];
    flags: {
        png: string;
        svg: string;
    };
    cca2: string; // 2-letter country code (FR, CH, US)
}

class RestCountriesService {
    private baseURL = 'https://restcountries.com/v3.1';
    private cache = new NodeCache({ stdTTL: 86400 }); // 24h cache

    /**
     * Get country info by code (FR, CH, US, etc.)
     */
    async getCountryByCode(countryCode: string): Promise<CountryInfo | null> {
        // Check cache
        const cacheKey = `country:${countryCode}`;
        const cached = this.cache.get<CountryInfo>(cacheKey);

        if (cached) {
            return cached;
        }

        try {
            const response = await axios.get(`${this.baseURL}/alpha/${countryCode}`);
            const country = response.data[0];

            // Update cache
            this.cache.set(cacheKey, country);

            return country;
        } catch (error) {
            console.error(`Error fetching country ${countryCode}:`, error);
            return null;
        }
    }

    /**
     * Extract essential info from country data
     */
    extractEssentialInfo(country: CountryInfo) {
        return {
            code: country.cca2,
            name: country.name.common,
            capital: country.capital?.[0] || '',
            currency: Object.values(country.currencies || {})[0],
            primaryLanguage: Object.values(country.languages || {})[0],
            continent: country.continents[0],
            timezone: country.timezones[0],
            flag: country.flags.svg
        };
    }
}

export default new RestCountriesService();
