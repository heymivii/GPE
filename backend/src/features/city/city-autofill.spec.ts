import axios from 'axios';
import { fetchCityAutofill } from './city-autofill';

jest.mock('axios');
const mockedGet = axios.get as jest.Mock;

const geoResponse = {
  data: {
    results: [
      {
        name: 'Phoenix',
        latitude: 33.4,
        longitude: -112,
        population: 1600000,
        timezone: 'America/Phoenix',
        country: 'United States',
        feature_code: 'PPLA',
      },
    ],
  },
};

const withImage = (url: string) => ({
  data: { query: { pages: { '1': { thumbnail: { source: url } } } } },
});
const withoutImage = { data: { query: { pages: { '1': {} } } } };

describe('fetchCityAutofill', () => {
  beforeEach(() => mockedGet.mockReset());

  it('récupère géo et image quand la Wikipédia française répond', async () => {
    mockedGet
      .mockResolvedValueOnce(geoResponse)
      .mockResolvedValueOnce(withImage('https://img/fr.jpg'));

    const data = await fetchCityAutofill('Phoenix', 'United States');

    expect(data.population).toBe(1600000);
    expect(data.timezone).toBe('America/Phoenix');
    expect(data.imageUrl).toBe('https://img/fr.jpg');
  });

  it("bascule sur la Wikipédia anglaise quand la française n'a pas d'image", async () => {
    // Les villes stockées sous leur nom anglais n'ont pas de page fr utile.
    mockedGet
      .mockResolvedValueOnce(geoResponse)
      .mockResolvedValueOnce(withoutImage)
      .mockResolvedValueOnce(withImage('https://img/en.jpg'));

    const data = await fetchCityAutofill('Geneva', 'Switzerland');

    expect(data.imageUrl).toBe('https://img/en.jpg');
  });

  it('termine par une recherche « ville + pays » pour lever les homonymies', async () => {
    // « Phoenix » seul renvoie l'oiseau mythologique, pas la ville d'Arizona.
    mockedGet
      .mockResolvedValueOnce(geoResponse)
      .mockResolvedValueOnce(withoutImage)
      .mockResolvedValueOnce(withoutImage)
      .mockResolvedValueOnce(withImage('https://img/search.jpg'));

    const data = await fetchCityAutofill('Phoenix', 'United States');

    expect(data.imageUrl).toBe('https://img/search.jpg');
    const searchCall = mockedGet.mock.calls[3];
    expect(searchCall[1].params.gsrsearch).toBe('Phoenix United States');
  });

  it("rend la ville sans image plutôt que d'échouer quand aucune source ne répond", async () => {
    mockedGet
      .mockResolvedValueOnce(geoResponse)
      .mockRejectedValueOnce(new Error('429'))
      .mockRejectedValueOnce(new Error('429'))
      .mockRejectedValueOnce(new Error('429'));

    const data = await fetchCityAutofill('Phoenix', 'United States');

    expect(data.imageUrl).toBeNull();
    expect(data.population).toBe(1600000); // la géo reste exploitable
  });

  it('lève une erreur quand aucune ville ne correspond', async () => {
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });

    await expect(fetchCityAutofill('Zzzz')).rejects.toThrow(/Aucune donnée/);
  });
});
