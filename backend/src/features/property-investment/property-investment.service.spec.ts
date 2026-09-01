jest.mock('./numbeo-property-parser');
import { NotFoundException } from '@nestjs/common';
import { PropertyInvestmentService } from './property-investment.service';
import * as parser from './numbeo-property-parser';
import type { PropertyInvestmentData } from './numbeo-property-parser';
import { numbeoCitySlug } from '../../services/numbeo-slug.util';

const mockedParser = parser as jest.Mocked<typeof parser>;

const makeRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  // Snapshot the input so later mutations of the returned entity don't retroactively
  // change what `toHaveBeenCalledWith` sees (the service mutates the entity in place).
  create: jest.fn((x) => ({ ...x })),
  save: jest.fn(async (x) => x),
});

const emptyData = (
  over: Partial<PropertyInvestmentData> = {},
): PropertyInvestmentData => ({
  priceToIncomeRatio: null,
  mortgageAsPctIncome: null,
  loanAffordabilityIndex: null,
  priceToRentCityCentre: null,
  priceToRentOutside: null,
  grossRentalYieldCityCentre: null,
  grossRentalYieldOutside: null,
  gdpPerCapita: null,
  gdpGrowthRate: null,
  populationGrowthRate: null,
  ...over,
});

describe('PropertyInvestmentService', () => {
  let service: PropertyInvestmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    service = new PropertyInvestmentService({} as never, {} as never); // country path only — city repos unused here
  });

  it('rejects an unsupported country (no outbound fetch)', async () => {
    await expect(service.getByCountry('Narnia')).rejects.toThrow();
    expect(mockedParser.fetchPropertyInvestmentHtml).not.toHaveBeenCalled();
  });

  it('maps an ISO code to the Numbeo name, parses, and tags provenance', async () => {
    mockedParser.fetchPropertyInvestmentHtml.mockResolvedValue('<html/>');
    mockedParser.parsePropertyInvestment.mockReturnValue(
      emptyData({ priceToIncomeRatio: 8.26 }),
    );

    const res = await service.getByCountry('FR');

    expect(mockedParser.fetchPropertyInvestmentHtml).toHaveBeenCalledWith(
      'France',
    );
    expect(res.country).toBe('France');
    expect(res.source).toBe('Numbeo');
    expect(res.sourceUrl).toContain('France');
    expect(res.priceToIncomeRatio).toBe(8.26);
  });

  it('serves the in-memory cache on the second call', async () => {
    mockedParser.fetchPropertyInvestmentHtml.mockResolvedValue('<html/>');
    mockedParser.parsePropertyInvestment.mockReturnValue(emptyData());

    await service.getByCountry('JP');
    await service.getByCountry('JP');

    expect(mockedParser.fetchPropertyInvestmentHtml).toHaveBeenCalledTimes(1);
  });

  it('wraps a Numbeo fetch failure as BAD_GATEWAY', async () => {
    mockedParser.fetchPropertyInvestmentHtml.mockRejectedValue(
      new Error('timeout'),
    );
    await expect(service.getByCountry('Switzerland')).rejects.toThrow(
      'Could not fetch Numbeo property data for "Switzerland".',
    );
  });

  describe('city-level methods', () => {
    let cityRepo: ReturnType<typeof makeRepo>;
    let cities: ReturnType<typeof makeRepo>;

    beforeEach(() => {
      cityRepo = makeRepo();
      cities = makeRepo();
      service = new PropertyInvestmentService(
        cityRepo as never,
        cities as never,
      );
    });

    describe('getByCity()', () => {
      it('throws NotFoundException when the city does not exist', async () => {
        cities.findOne.mockResolvedValue(null);
        await expect(service.getByCity(1)).rejects.toThrow(NotFoundException);
      });

      it('returns the DB cache when fresh and no refresh requested', async () => {
        cities.findOne.mockResolvedValue({ idCity: 1, name: 'Paris' });
        const cached = {
          cityId: 1,
          data: emptyData({ priceToIncomeRatio: 5 }),
          source: 'Numbeo',
          cachedAt: new Date(),
          expiresAt: new Date(Date.now() + 100000),
        };
        cityRepo.findOne.mockResolvedValue(cached);

        const result = await service.getByCity(1);

        expect(result.priceToIncomeRatio).toBe(5);
        expect(result.city).toBe('Paris');
        expect(mockedParser.fetchCityPropertyInvestmentHtml).not.toHaveBeenCalled();
      });

      it('refetches when refresh=true even with a fresh cache', async () => {
        cities.findOne.mockResolvedValue({ idCity: 1, name: 'Paris' });
        cityRepo.findOne.mockResolvedValue({
          cityId: 1,
          data: emptyData(),
          source: 'Numbeo',
          cachedAt: new Date(),
          expiresAt: new Date(Date.now() + 100000),
        });
        mockedParser.fetchCityPropertyInvestmentHtml.mockResolvedValue(
          '<html/>',
        );
        mockedParser.parsePropertyInvestment.mockReturnValue(
          emptyData({ priceToIncomeRatio: 9 }),
        );

        const result = await service.getByCity(1, { refresh: true });

        expect(mockedParser.fetchCityPropertyInvestmentHtml).toHaveBeenCalled();
        expect(result.priceToIncomeRatio).toBe(9);
        expect(cityRepo.save).toHaveBeenCalled();
      });

      it('uses slugOverride when provided, and creates a new cache row when none exists', async () => {
        cities.findOne.mockResolvedValue({ idCity: 2, name: 'Zürich' });
        cityRepo.findOne.mockResolvedValue(null);
        mockedParser.fetchCityPropertyInvestmentHtml.mockResolvedValue(
          '<html/>',
        );
        mockedParser.parsePropertyInvestment.mockReturnValue(
          emptyData({ priceToIncomeRatio: 12 }),
        );

        const result = await service.getByCity(2, {
          slugOverride: 'Geneva Area',
        });

        expect(mockedParser.fetchCityPropertyInvestmentHtml).toHaveBeenCalledWith(
          'Geneva-Area',
        );
        expect(cityRepo.create).toHaveBeenCalledWith({ cityId: 2 });
        expect(result.priceToIncomeRatio).toBe(12);
        expect(result.source).toBe('Numbeo');
      });

      it('falls back to numbeoCitySlug when no slugOverride is given', async () => {
        cities.findOne.mockResolvedValue({ idCity: 3, name: 'Lyon' });
        cityRepo.findOne.mockResolvedValue(null);
        mockedParser.fetchCityPropertyInvestmentHtml.mockResolvedValue(
          '<html/>',
        );
        mockedParser.parsePropertyInvestment.mockReturnValue(
          emptyData({ priceToIncomeRatio: 5 }),
        );

        await service.getByCity(3);

        expect(mockedParser.fetchCityPropertyInvestmentHtml).toHaveBeenCalledWith(
          numbeoCitySlug('Lyon'),
        );
      });

      it('wraps a Numbeo city fetch failure as BAD_GATEWAY', async () => {
        cities.findOne.mockResolvedValue({ idCity: 1, name: 'Paris' });
        cityRepo.findOne.mockResolvedValue(null);
        mockedParser.fetchCityPropertyInvestmentHtml.mockRejectedValue(
          new Error('down'),
        );

        await expect(service.getByCity(1)).rejects.toThrow(
          /Could not fetch Numbeo property data for city slug/,
        );
      });

      it('rejects an all-null parsed payload as UNPROCESSABLE_ENTITY', async () => {
        cities.findOne.mockResolvedValue({ idCity: 1, name: 'Paris' });
        cityRepo.findOne.mockResolvedValue(null);
        mockedParser.fetchCityPropertyInvestmentHtml.mockResolvedValue(
          '<html/>',
        );
        mockedParser.parsePropertyInvestment.mockReturnValue(emptyData());

        await expect(service.getByCity(1)).rejects.toThrow(
          /No usable property indicators parsed/,
        );
      });
    });

    describe('updateCity()', () => {
      it('throws NotFoundException when the city does not exist', async () => {
        cities.findOne.mockResolvedValue(null);
        await expect(
          service.updateCity(1, { priceToIncomeRatio: 5 }),
        ).rejects.toThrow(NotFoundException);
      });

      it('merges the patch into an existing cache entry and marks it manuel', async () => {
        cities.findOne.mockResolvedValue({ idCity: 1, name: 'Paris' });
        cityRepo.findOne.mockResolvedValue({
          cityId: 1,
          data: emptyData({ priceToIncomeRatio: 5, gdpPerCapita: 40000 }),
          source: 'Numbeo',
          cachedAt: new Date(),
          expiresAt: new Date(),
        });

        const result = await service.updateCity(1, {
          priceToIncomeRatio: 6,
          gdpPerCapita: null,
        });

        expect(result.priceToIncomeRatio).toBe(6);
        expect(result.gdpPerCapita).toBeNull();
        expect(result.source).toBe('manuel');
      });

      it('creates a fresh cache entry when none exists yet, ignoring undefined patch fields', async () => {
        cities.findOne.mockResolvedValue({ idCity: 4, name: 'Nice' });
        cityRepo.findOne.mockResolvedValue(null);

        const result = await service.updateCity(4, {
          priceToIncomeRatio: 7,
          gdpPerCapita: undefined,
        });

        expect(cityRepo.create).toHaveBeenCalledWith({ cityId: 4, data: {} });
        expect(result.priceToIncomeRatio).toBe(7);
        expect(result.source).toBe('manuel');
      });
    });

    describe('getCachedCity()', () => {
      it('returns null when nothing is cached', async () => {
        cityRepo.findOne.mockResolvedValue(null);
        const result = await service.getCachedCity(5);
        expect(result).toBeNull();
      });

      it('returns the mapped result, using the joined city name', async () => {
        cityRepo.findOne.mockResolvedValue({
          cityId: 5,
          data: emptyData({ priceToIncomeRatio: 3 }),
          source: 'Numbeo',
          cachedAt: new Date(),
          city: { name: 'Marseille' },
        });

        const result = await service.getCachedCity(5);

        expect(result?.city).toBe('Marseille');
        expect(result?.priceToIncomeRatio).toBe(3);
      });

      it('defaults to an empty city name when the relation is missing', async () => {
        cityRepo.findOne.mockResolvedValue({
          cityId: 5,
          data: emptyData(),
          source: null,
          cachedAt: new Date(),
          city: null,
        });

        const result = await service.getCachedCity(5);

        expect(result?.city).toBe('');
        expect(result?.source).toBe('Numbeo');
      });
    });
  });
});
