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
    service = new QualityOfLifeService(repo as never);
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
});
