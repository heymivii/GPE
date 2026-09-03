import axios from 'axios';
import {
  fetchNumbeoPage,
  NumbeoBlockedError,
  NumbeoUnknownSlugError,
} from './numbeo-fetch.util';

jest.mock('axios');
const mockedGet = axios.get as jest.Mock;
(axios.isAxiosError as unknown as jest.Mock) = jest.fn(
  (e) => !!e?.isAxiosError,
);

const axiosError = (status: number) => ({
  isAxiosError: true,
  response: { status },
});

describe('fetchNumbeoPage', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('returns the HTML on success', async () => {
    mockedGet.mockResolvedValue({ data: '<title>Cost of Living in Nagoya</title>' });
    await expect(fetchNumbeoPage('https://x')).resolves.toContain('Nagoya');
  });

  it('detects the « Cannot find city id » page (HTTP 200 !) as an unknown slug', async () => {
    // Un slug inconnu ne fait PAS un 404 chez Numbeo — c'est une page 200.
    mockedGet.mockResolvedValue({
      data: '<title>Cannot find city id for Nagoya-Japan</title>',
    });
    await expect(fetchNumbeoPage('https://x')).rejects.toBeInstanceOf(
      NumbeoUnknownSlugError,
    );
  });

  it('maps a persistent 503 (anti-bot) to NumbeoBlockedError after retries', async () => {
    mockedGet.mockRejectedValue(axiosError(503));

    const pending = fetchNumbeoPage('https://x');
    // catch attaché AVANT d'avancer les timers pour éviter l'unhandled rejection
    const assertion = expect(pending).rejects.toBeInstanceOf(NumbeoBlockedError);
    await jest.advanceTimersByTimeAsync(10000);
    await assertion;
    expect(mockedGet).toHaveBeenCalledTimes(3); // 1 essai + 2 retries
  });

  it('recovers when a retry succeeds after a transient 503', async () => {
    mockedGet
      .mockRejectedValueOnce(axiosError(503))
      .mockResolvedValueOnce({ data: '<title>Cost of Living in Tokyo</title>' });

    const pending = fetchNumbeoPage('https://x');
    await jest.advanceTimersByTimeAsync(3000);
    await expect(pending).resolves.toContain('Tokyo');
  });

  it('does not retry non-blocking errors (ex. timeout réseau)', async () => {
    mockedGet.mockRejectedValue(new Error('timeout'));
    await expect(fetchNumbeoPage('https://x')).rejects.toThrow('timeout');
    expect(mockedGet).toHaveBeenCalledTimes(1);
  });
});
