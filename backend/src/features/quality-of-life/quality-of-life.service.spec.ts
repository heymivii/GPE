jest.mock('./numbeo-quality-parser');
import { QualityOfLifeService } from './quality-of-life.service';
import * as parser from './numbeo-quality-parser';

const mockedParser = parser as jest.Mocked<typeof parser>;

function makeRepo() {
  return {
    findOne: jest.fn(),
    create: jest.fn((x) => ({ ...x })),
    save: jest.fn(async (e) => e),
  };
}

describe('QualityOfLifeService', () => {
  let repo: ReturnType<typeof makeRepo>;
  let service: QualityOfLifeService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    repo = makeRepo();
    service = new QualityOfLifeService(repo as never, {} as never, {} as never); // country path only
  });

  it('rejects an unsupported country (no DB hit, no fetch)', async () => {
    await expect(service.getByCountry('Narnia')).rejects.toThrow();
    expect(repo.findOne).not.toHaveBeenCalled();
    expect(mockedParser.fetchQualityOfLifeHtml).not.toHaveBeenCalled();
  });

  it('fetches/parses on a cache miss and persists with provenance', async () => {
    repo.findOne.mockResolvedValue(null);
    mockedParser.fetchQualityOfLifeHtml.mockResolvedValue('<html/>');
    mockedParser.parseQualityOfLife.mockReturnValue({ safety: 44.23 } as never);
    mockedParser.parseLastUpdate.mockReturnValue('16 June 2026');

    const res = await service.getByCountry('FR');

    expect(mockedParser.fetchQualityOfLifeHtml).toHaveBeenCalledWith('France');
    expect(repo.save).toHaveBeenCalled();
    expect(res.country).toBe('France');
    expect(res.source).toBe('Numbeo');
    expect(res.safety).toBe(44.23);
    expect(res.sourceLastUpdate).toBe('16 June 2026');
  });

  it('serves a fresh DB cache entry without fetching', async () => {
    repo.findOne.mockResolvedValue({
      country: 'Japan',
      data: { safety: 50 },
      sourceLastUpdate: '1 May 2026',
      cachedAt: new Date('2026-05-01'),
      expiresAt: new Date(Date.now() + 60_000),
    });

    const res = await service.getByCountry('JP');

    expect(mockedParser.fetchQualityOfLifeHtml).not.toHaveBeenCalled();
    expect(res.country).toBe('Japan');
    expect(res.safety).toBe(50);
  });

  it('wraps a Numbeo fetch failure as BAD_GATEWAY', async () => {
    repo.findOne.mockResolvedValue(null);
    mockedParser.fetchQualityOfLifeHtml.mockRejectedValue(new Error('down'));

    await expect(service.getByCountry('France')).rejects.toMatchObject({
      status: 502,
    });
  });

  describe('getByCity()', () => {
    let cityRepo: ReturnType<typeof makeRepo>;
    let cities: { findOne: jest.Mock };

    beforeEach(() => {
      cityRepo = makeRepo();
      cities = { findOne: jest.fn() };
      service = new QualityOfLifeService(
        repo as never,
        cityRepo as never,
        cities as never,
      );
    });

    it('throws NotFoundException when the city does not exist', async () => {
      cities.findOne.mockResolvedValue(null);
      await expect(service.getByCity(999)).rejects.toThrow(
        'Ville 999 introuvable',
      );
      expect(cityRepo.findOne).not.toHaveBeenCalled();
    });

    it('returns the fresh cached entry without fetching when refresh is not requested', async () => {
      cities.findOne.mockResolvedValue({ idCity: 1, name: 'Paris' });
      cityRepo.findOne.mockResolvedValue({
        cityId: 1,
        data: { safety: 60 },
        source: 'Numbeo',
        sourceLastUpdate: '1 June 2026',
        cachedAt: new Date('2026-06-01'),
        expiresAt: new Date(Date.now() + 60_000),
      });

      const res = await service.getByCity(1);

      expect(mockedParser.fetchCityQualityOfLifeHtml).not.toHaveBeenCalled();
      expect(res.city).toBe('Paris');
      expect(res.safety).toBe(60);
    });

    it('refetches when the cache is fresh but refresh=true is passed', async () => {
      cities.findOne.mockResolvedValue({ idCity: 1, name: 'Paris' });
      const cached = {
        cityId: 1,
        data: { safety: 60 },
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      };
      cityRepo.findOne.mockResolvedValue(cached);
      mockedParser.fetchCityQualityOfLifeHtml.mockResolvedValue('<html/>');
      mockedParser.parseQualityOfLife.mockReturnValue({ safety: 70 } as never);
      mockedParser.parseLastUpdate.mockReturnValue('20 June 2026');

      const res = await service.getByCity(1, { refresh: true });

      expect(mockedParser.fetchCityQualityOfLifeHtml).toHaveBeenCalledWith(
        'Paris',
      );
      expect(res.safety).toBe(70);
      expect(cityRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'Numbeo' }),
      );
    });

    it('uses slugOverride instead of the city name when provided', async () => {
      cities.findOne.mockResolvedValue({ idCity: 2, name: 'Genève' });
      cityRepo.findOne.mockResolvedValue(null);
      mockedParser.fetchCityQualityOfLifeHtml.mockResolvedValue('<html/>');
      mockedParser.parseQualityOfLife.mockReturnValue({ safety: 80 } as never);
      mockedParser.parseLastUpdate.mockReturnValue('1 July 2026');

      await service.getByCity(2, { slugOverride: 'Geneva' });

      expect(mockedParser.fetchCityQualityOfLifeHtml).toHaveBeenCalledWith(
        'Geneva',
      );
    });

    it('fetches on a cache miss and creates a new cache row', async () => {
      cities.findOne.mockResolvedValue({ idCity: 3, name: 'New York' });
      cityRepo.findOne.mockResolvedValue(null);
      mockedParser.fetchCityQualityOfLifeHtml.mockResolvedValue('<html/>');
      mockedParser.parseQualityOfLife.mockReturnValue({ safety: 55 } as never);
      mockedParser.parseLastUpdate.mockReturnValue('2 July 2026');

      const res = await service.getByCity(3);

      expect(mockedParser.fetchCityQualityOfLifeHtml).toHaveBeenCalledWith(
        'New-York',
      );
      expect(cityRepo.create).toHaveBeenCalledWith({ cityId: 3 });
      expect(res.cityId).toBe(3);
      expect(res.safety).toBe(55);
    });

    it('fetches when the cache is expired', async () => {
      cities.findOne.mockResolvedValue({ idCity: 4, name: 'Lyon' });
      cityRepo.findOne.mockResolvedValue({
        cityId: 4,
        data: { safety: 10 },
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() - 1000),
      });
      mockedParser.fetchCityQualityOfLifeHtml.mockResolvedValue('<html/>');
      mockedParser.parseQualityOfLife.mockReturnValue({ safety: 65 } as never);
      mockedParser.parseLastUpdate.mockReturnValue('3 July 2026');

      const res = await service.getByCity(4);
      expect(res.safety).toBe(65);
    });

    it('wraps a Numbeo fetch failure as BAD_GATEWAY', async () => {
      cities.findOne.mockResolvedValue({ idCity: 5, name: 'Lille' });
      cityRepo.findOne.mockResolvedValue(null);
      mockedParser.fetchCityQualityOfLifeHtml.mockRejectedValue(
        new Error('timeout'),
      );

      await expect(service.getByCity(5)).rejects.toMatchObject({
        status: 502,
      });
    });

    it('rejects an all-null parsed payload as UNPROCESSABLE_ENTITY', async () => {
      cities.findOne.mockResolvedValue({ idCity: 6, name: 'Nowhere' });
      cityRepo.findOne.mockResolvedValue(null);
      mockedParser.fetchCityQualityOfLifeHtml.mockResolvedValue('<html/>');
      mockedParser.parseQualityOfLife.mockReturnValue({
        safety: null,
        purchasingPower: null,
      } as never);

      await expect(service.getByCity(6)).rejects.toMatchObject({
        status: 422,
      });
      expect(cityRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('getCachedCity()', () => {
    let cityRepo: ReturnType<typeof makeRepo>;

    beforeEach(() => {
      cityRepo = makeRepo();
      service = new QualityOfLifeService(
        repo as never,
        cityRepo as never,
        {} as never,
      );
    });

    it('returns null when nothing is cached', async () => {
      cityRepo.findOne.mockResolvedValue(null);
      const res = await service.getCachedCity(1);
      expect(res).toBeNull();
    });

    it('maps the cached entity using the joined city name', async () => {
      cityRepo.findOne.mockResolvedValue({
        cityId: 1,
        data: { safety: 42 },
        source: 'manuel',
        cachedAt: new Date('2026-01-01'),
        city: { name: 'Marseille' },
      });

      const res = await service.getCachedCity(1);

      expect(res?.city).toBe('Marseille');
      expect(res?.source).toBe('manuel');
      expect(res?.safety).toBe(42);
    });

    it('falls back to an empty city name when the relation is missing', async () => {
      cityRepo.findOne.mockResolvedValue({
        cityId: 1,
        data: {},
        cachedAt: new Date('2026-01-01'),
      });

      const res = await service.getCachedCity(1);
      expect(res?.city).toBe('');
    });
  });

  describe('updateCity()', () => {
    let cityRepo: ReturnType<typeof makeRepo>;
    let cities: { findOne: jest.Mock };

    beforeEach(() => {
      cityRepo = makeRepo();
      cities = { findOne: jest.fn() };
      service = new QualityOfLifeService(
        repo as never,
        cityRepo as never,
        cities as never,
      );
    });

    it('throws NotFoundException when the city does not exist', async () => {
      cities.findOne.mockResolvedValue(null);
      await expect(
        service.updateCity(1, { safety: 10 }),
      ).rejects.toThrow('Ville 1 introuvable');
    });

    it('creates a new cache row and merges the patch when nothing cached yet', async () => {
      cities.findOne.mockResolvedValue({ idCity: 1, name: 'Paris' });
      cityRepo.findOne.mockResolvedValue(null);

      const res = await service.updateCity(1, { safety: 10 });

      expect(cityRepo.create).toHaveBeenCalledWith({ cityId: 1, data: {} });
      expect(res.source).toBe('manuel');
      expect(res.safety).toBe(10);
    });

    it('merges the patch into the existing cached data and drops undefined keys', async () => {
      cities.findOne.mockResolvedValue({ idCity: 1, name: 'Paris' });
      cityRepo.findOne.mockResolvedValue({
        cityId: 1,
        data: { safety: 10, purchasingPower: 20 },
        cachedAt: new Date(),
      });

      const res = await service.updateCity(1, {
        safety: 99,
        purchasingPower: undefined,
      });

      expect(res.safety).toBe(99);
      expect(res.purchasingPower).toBe(20);
    });

    it('allows clearing a value by setting it to null explicitly', async () => {
      cities.findOne.mockResolvedValue({ idCity: 1, name: 'Paris' });
      cityRepo.findOne.mockResolvedValue({
        cityId: 1,
        data: { safety: 10 },
        cachedAt: new Date(),
      });

      const res = await service.updateCity(1, { safety: null });
      expect(res.safety).toBeNull();
    });
  });
});
