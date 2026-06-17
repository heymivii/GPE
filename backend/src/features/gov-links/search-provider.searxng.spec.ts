import axios from 'axios';
import { SearxngSearchProvider } from './search-provider';

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
