import axios from 'axios';
import { OecdMigrationService } from './oecd-migration.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const sdmxFixture = {
  data: {
    structures: [
      {
        dimensions: {
          series: [
            {
              id: 'REF_AREA',
              values: [
                { id: 'FRA' },
                { id: 'CHE' },
                { id: 'JPN' },
                { id: 'USA' },
              ],
            },
            {
              id: 'MEASURE',
              values: [
                { id: 'B11' },
                { id: 'B12' },
                { id: 'B13' },
                { id: 'B15' },
                { id: 'B16' },
              ],
            },
          ],
          observation: [
            {
              id: 'TIME_PERIOD',
              values: [{ id: '2018' }, { id: '2019' }, { id: '2020' }],
            },
          ],
        },
      },
    ],
    dataSets: [
      {
        series: {
          // FRA / B11 (inflows): 2018=1000, 2020=1200 -> keeps the latest year
          '0:0': { observations: { '0': [1000], '2': [1200] } },
          // FRA / B12 (outflows): 2019=500
          '0:1': { observations: { '1': [500] } },
          // USA / B16 (nationality acquisitions): 2018=50 valid, 2019=-5 must be skipped (<=0)
          '3:4': { observations: { '0': [50], '1': [-5] } },
        },
      },
    ],
  },
};

describe('OecdMigrationService', () => {
  let service: OecdMigrationService;

  beforeEach(() => {
    service = new OecdMigrationService();
    jest.clearAllMocks();
  });

  describe('getMigrationData', () => {
    it('parses the SDMX response into per-country indicators, keeping the latest year and dropping non-positive values', async () => {
      mockedAxios.get.mockResolvedValue({ data: sdmxFixture });

      const result = await service.getMigrationData();

      const fra = result.find((c) => c.countryCode === 'FRA');
      expect(fra.inflowsForeignPop).toEqual({ value: 1200, year: 2020 });
      expect(fra.outflowsForeignPop).toEqual({ value: 500, year: 2019 });
      expect(fra.asylumSeekers).toBeUndefined();

      const usa = result.find((c) => c.countryCode === 'USA');
      expect(usa.nationalityAcquisitions).toEqual({ value: 50, year: 2018 });

      const che = result.find((c) => c.countryCode === 'CHE');
      expect(che).toEqual({
        countryCode: 'CHE',
        countryName: 'Switzerland',
        inflowsForeignPop: undefined,
        outflowsForeignPop: undefined,
        asylumSeekers: undefined,
        stocksForeignPop: undefined,
        nationalityAcquisitions: undefined,
      });
    });

    it('caches the result and does not re-fetch on the next call', async () => {
      mockedAxios.get.mockResolvedValue({ data: sdmxFixture });

      await service.getMigrationData();
      await service.getMigrationData();

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('falls back to bare country skeletons when the API fails and no cache exists', async () => {
      mockedAxios.get.mockRejectedValue(new Error('network down'));

      const result = await service.getMigrationData();

      expect(result).toEqual([
        { countryCode: 'FRA', countryName: 'France' },
        { countryCode: 'CHE', countryName: 'Switzerland' },
        { countryCode: 'JPN', countryName: 'Japan' },
        { countryCode: 'USA', countryName: 'United States' },
      ]);
    });

    it('serves the stale cache when a later refetch fails', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: sdmxFixture });
      const first = await service.getMigrationData();

      (service as any).cacheTimestamp = 0; // force the TTL to be considered expired
      mockedAxios.get.mockRejectedValueOnce(new Error('network down'));
      const second = await service.getMigrationData();

      expect(second).toEqual(first);
    });
  });

  describe('getByCountry', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: sdmxFixture });
    });

    it('resolves a 2-letter ISO code to the matching country data', async () => {
      const result = await service.getByCountry('fr');
      expect(result.countryCode).toBe('FRA');
    });

    it('accepts a 3-letter ISO code directly', async () => {
      const result = await service.getByCountry('usa');
      expect(result.countryCode).toBe('USA');
    });

    it('returns null for an unmapped 2-letter code without calling the API', async () => {
      const result = await service.getByCountry('zz');
      expect(result).toBeNull();
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('returns null when the 3-letter code is not in the supported list', async () => {
      const result = await service.getByCountry('xyz');
      expect(result).toBeNull();
    });
  });
});
