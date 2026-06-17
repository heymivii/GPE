import axios from 'axios';
import { SearxngSearchProvider, TavilySearchProvider } from './search-provider';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SearxngSearchProvider', () => {
  it('happy path: maps results correctly and calls correct URL + params', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({
      data: {
        results: [
          { url: 'https://france-visas.gouv.fr/x', title: 'Visa', content: 'snippet text' },
        ],
      },
    });

    const provider = new SearxngSearchProvider('http://localhost:8888');
    const results = await provider.search('q', []);

    expect(results).toEqual([
      { url: 'https://france-visas.gouv.fr/x', title: 'Visa', snippet: 'snippet text' },
    ]);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:8888/search',
      expect.objectContaining({
        params: { q: 'q', format: 'json' },
      }),
    );
  });

  it('empty path: returns [] when data has no results', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({ data: {} });

    const provider = new SearxngSearchProvider('http://localhost:8888');
    const results = await provider.search('q', []);

    expect(results).toEqual([]);
  });
});

describe('SearxngSearchProvider.health()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns true when GET baseUrl resolves', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({ data: {} });
    const provider = new SearxngSearchProvider('http://localhost:8888');
    expect(await provider.health()).toBe(true);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:8888',
      expect.objectContaining({ timeout: 3000 }),
    );
  });

  it('returns false when GET baseUrl rejects', async () => {
    mockedAxios.get = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    const provider = new SearxngSearchProvider('http://localhost:8888');
    expect(await provider.health()).toBe(false);
  });
});

describe('TavilySearchProvider.health()', () => {
  it('returns true when apiKey is set', async () => {
    const provider = new TavilySearchProvider('my-secret-key');
    expect(await provider.health()).toBe(true);
  });

  it('returns false when apiKey is empty', async () => {
    const provider = new TavilySearchProvider('');
    expect(await provider.health()).toBe(false);
  });
});
