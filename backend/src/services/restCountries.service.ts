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
  cca2: string;
}

class RestCountriesService {
  private baseURL = 'https://restcountries.com/v3.1';
  private cache = new NodeCache({ stdTTL: 86400 });

  async getCountryByCode(countryCode: string): Promise<CountryInfo | null> {
    const cacheKey = `country:${countryCode}`;
    const cached = this.cache.get<CountryInfo>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseURL}/alpha/${countryCode}`);
      const country = response.data[0];

      this.cache.set(cacheKey, country);

      return country;
    } catch (error) {
      console.error(`Error fetching country ${countryCode}:`, error);
      return null;
    }
  }

  extractEssentialInfo(country: CountryInfo) {
    return {
      code: country.cca2,
      name: country.name.common,
      capital: country.capital?.[0] || '',
      currency: Object.values(country.currencies || {})[0],
      primaryLanguage: Object.values(country.languages || {})[0],
      continent: country.continents[0],
      timezone: country.timezones[0],
      flag: country.flags.svg,
    };
  }

  // All countries (name + ISO2) via countriesnow (free, no key — restcountries /all is
  // deprecated). For the admin country picker. Cached 24h.
  async getAllCountries(): Promise<{ code: string; name: string }[]> {
    const cacheKey = 'countries:all';
    const cached = this.cache.get<{ code: string; name: string }[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        'https://countriesnow.space/api/v0.1/countries/iso',
      );
      const raw =
        (response.data as { data?: Array<{ name?: string; Iso2?: string }> })
          ?.data ?? [];
      const list = raw
        .map((c) => ({ code: c.Iso2 ?? '', name: c.name ?? '' }))
        .filter((c) => c.name)
        .sort((a, b) => a.name.localeCompare(b.name));
      this.cache.set(cacheKey, list);
      return list;
    } catch (error) {
      console.error('Error fetching all countries:', error);
      return [];
    }
  }

  // Cities of a country (free, no API key — countriesnow.space). Expects the English
  // country name. Cached 24h.
  async getCitiesByCountry(country: string): Promise<string[]> {
    const cacheKey = `cities:${country.toLowerCase()}`;
    const cached = this.cache.get<string[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.post(
        'https://countriesnow.space/api/v0.1/countries/cities',
        { country },
      );
      const raw = (response.data as { data?: unknown[] })?.data ?? [];
      const cities = raw
        .filter((c): c is string => typeof c === 'string')
        .sort((a, b) => a.localeCompare(b));
      this.cache.set(cacheKey, cities);
      return cities;
    } catch (error) {
      console.error(`Error fetching cities for ${country}:`, error);
      return [];
    }
  }
}

export default new RestCountriesService();
