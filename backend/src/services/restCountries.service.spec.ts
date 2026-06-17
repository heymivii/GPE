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
  });

  describe('getAllCountries', () => {
    it('maps Iso2/name, drops empty names and sorts', async () => {
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
  });

  describe('extractEssentialInfo', () => {
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
