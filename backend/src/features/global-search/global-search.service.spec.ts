import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { GlobalSearchService } from './global-search.service';

const mockDataSource = {
  query: jest.fn().mockResolvedValue([]),
  createQueryRunner: jest.fn(),
};

describe('GlobalSearchService', () => {
  let service: GlobalSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalSearchService,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();
    service = module.get<GlobalSearchService>(GlobalSearchService);
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('returns empty result when query is empty', async () => {
      const result = await service.search({ q: '   ' });
      expect(result.total).toBe(0);
      expect(result.results).toHaveLength(0);
    });

    it('returns results for a valid query', async () => {
      mockDataSource.query.mockResolvedValue([
        { id: '1', type: 'country', title: 'France', score: 0.9 },
      ]);
      const result = await service.search({ q: 'France' });
      expect(result).toBeDefined();
    });

    it('falls back to ILIKE when FTS fails', async () => {
      mockDataSource.query
        .mockRejectedValueOnce(new Error('FTS error'))
        .mockResolvedValue([]);
      const result = await service.search({ q: 'France' });
      expect(result).toBeDefined();
    });

    it('returns query in response', async () => {
      mockDataSource.query.mockResolvedValue([]);
      const result = await service.search({ q: 'Canada' });
      expect(result.query).toBe('Canada');
    });

    it('adds a category filter to the FTS query when provided', async () => {
      mockDataSource.query.mockResolvedValue([]);
      await service.search({ q: 'France', category: 'country' });
      const [sql, params] = mockDataSource.query.mock.calls[0];
      expect(sql).toContain('AND category = $2');
      expect(params).toEqual(['France:*', 'country', 10]);
    });

    it('maps country and city rows from the ILIKE fallback', async () => {
      mockDataSource.query
        .mockRejectedValueOnce(new Error('FTS error'))
        .mockResolvedValueOnce([{ entityId: '1', title: 'France' }]) // countries
        .mockResolvedValueOnce([
          {
            entityId: '2',
            title: 'Paris',
            imageUrl: 'paris.png',
            countryName: 'France',
          },
        ]); // cities

      const result = await service.search({ q: 'Fra' });

      expect(result.results).toEqual([
        expect.objectContaining({ category: 'country', title: 'France' }),
        expect.objectContaining({
          category: 'city',
          title: 'Paris',
          countryName: 'France',
          imageUrl: 'paris.png',
        }),
      ]);
    });

    it('only queries cities when the fallback category is "city"', async () => {
      mockDataSource.query
        .mockRejectedValueOnce(new Error('FTS error'))
        .mockResolvedValueOnce([
          { entityId: '2', title: 'Paris', imageUrl: null, countryName: 'France' },
        ]);

      const result = await service.search({ q: 'Par', category: 'city' });

      // Only one further query (cities) after the failed FTS attempt.
      expect(mockDataSource.query).toHaveBeenCalledTimes(2);
      expect(result.results[0].category).toBe('city');
    });
  });

  describe('refreshIndex', () => {
    it('calls query to refresh search vectors', async () => {
      await service.refreshIndex();
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
      );
    });
  });
});
