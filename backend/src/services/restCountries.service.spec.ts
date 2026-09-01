jest.mock('axios');
import axios from 'axios';
import restCountries from './restCountries.service';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RestCountriesService', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => jest.clearAllMocks());

  describe('getCitiesByCountry', () => {
    it('returns [] without hitting the API when country is empty', async () => {
      const res = await restCountries.getCitiesByCountry('');
      expect(res).toEqual([]);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('returns [] without hitting the API when country is whitespace', async () => {
      const res = await restCountries.getCitiesByCountry('   ');
      expect(res).toEqual([]);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('parses, sorts cities and passes a timeout', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { data: ['Lyon', 'Ajaccio', 'Paris'] },
      } as never);
      const res = await restCountries.getCitiesByCountry('Testlandia');
      expect(res).toEqual(['Ajaccio', 'Lyon', 'Paris']);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://countriesnow.space/api/v0.1/countries/cities',
        { country: 'Testlandia' },
        { timeout: 10000 },
      );
    });

    it('returns [] when the API throws', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('network'));
      const res = await restCountries.getCitiesByCountry('Errorland');
      expect(res).toEqual([]);
    });

    it('serves the cached value without hitting the API again', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { data: ['Nice'] },
      } as never);

      const first = await restCountries.getCitiesByCountry('Cacheland');
      const second = await restCountries.getCitiesByCountry('Cacheland');

      expect(second).toEqual(first);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  // getAllCountries has a single, unparametrized cache key ('countries:all'), so the
  // error case must run before any successful call primes that key for the process.
  describe('getAllCountries', () => {
    it('returns [] when the API throws', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('network'));

      const res = await restCountries.getAllCountries();

      expect(res).toEqual([]);
    });

    it('maps Iso2/name, drops empty names, sorts and caches the result', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: [
            { name: 'Zedland', Iso2: 'ZD' },
            { name: '', Iso2: 'XX' },
            { name: 'Alphaland', Iso2: 'AL' },
          ],
        },
      } as never);
      const res = await restCountries.getAllCountries();
      expect(res).toEqual([
        { code: 'AL', name: 'Alphaland' },
        { code: 'ZD', name: 'Zedland' },
      ]);
    });

    it('serves the cached value without hitting the API again', async () => {
      const res = await restCountries.getAllCountries();

      expect(res).toEqual([
        { code: 'AL', name: 'Alphaland' },
        { code: 'ZD', name: 'Zedland' },
      ]);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('getCountryByCode', () => {
    it('fetches, caches and returns the country on success', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ cca2: 'FR', name: { common: 'France' } }],
      } as never);

      const res = await restCountries.getCountryByCode('FR');

      expect(res).toEqual({ cca2: 'FR', name: { common: 'France' } });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://restcountries.com/v3.1/alpha/FR',
        { timeout: 10000 },
      );
    });

    it('serves the cached value without hitting the API again', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ cca2: 'BE', name: { common: 'Belgium' } }],
      } as never);

      const first = await restCountries.getCountryByCode('BE');
      const second = await restCountries.getCountryByCode('BE');

      expect(second).toEqual(first);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('returns null when the API throws', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('network'));

      const res = await restCountries.getCountryByCode('ZZ');

      expect(res).toBeNull();
    });
  });

  describe('extractEssentialInfo', () => {
    it('extracts all fields from a full payload', () => {
      const info = restCountries.extractEssentialInfo({
        cca2: 'FR',
        name: { common: 'France', official: 'French Republic' },
        capital: ['Paris'],
        currencies: { EUR: { name: 'Euro', symbol: '€' } },
        languages: { fra: 'French' },
        continents: ['Europe'],
        timezones: ['UTC+01:00'],
        flags: { png: 'fr.png', svg: 'fr.svg' },
      } as never);
      expect(info).toEqual({
        code: 'FR',
        name: 'France',
        capital: 'Paris',
        currency: { name: 'Euro', symbol: '€' },
        primaryLanguage: 'French',
        continent: 'Europe',
        timezone: 'UTC+01:00',
        flag: 'fr.svg',
      });
    });

    it('does not throw on a partial payload (missing continents/timezones/flags)', () => {
      const info = restCountries.extractEssentialInfo({
        cca2: 'FR',
        name: { common: 'France', official: 'French Republic' },
        capital: ['Paris'],
        currencies: {},
        languages: {},
      } as never);
      expect(info.name).toBe('France');
      expect(info.continent).toBe('');
      expect(info.timezone).toBe('');
      expect(info.flag).toBe('');
    });
  });
});
