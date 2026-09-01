import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => {
  const create = vi.fn(() => {
    const fn: any = vi.fn();
    fn.defaults = { baseURL: 'http://localhost:3001/api' };
    fn.interceptors = {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    };
    return fn;
  });
  return { default: { create, post: vi.fn() } };
});

import axios from 'axios';

async function loadApiClient() {
  vi.resetModules();
  const mod = await import('./api');
  const instance = vi.mocked(axios.create).mock.results.at(-1)!.value;
  const [requestFulfilled, requestRejected] = instance.interceptors.request.use.mock.calls[0];
  const [responseFulfilled, responseRejected] = instance.interceptors.response.use.mock.calls[0];
  return { apiClient: mod.default, instance, requestFulfilled, requestRejected, responseFulfilled, responseRejected };
}

describe('lib/api — request interceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('attaches the Bearer token from localStorage when present', async () => {
    localStorage.setItem('access_token', 'my-token');
    const { requestFulfilled } = await loadApiClient();
    const config = { headers: {} as Record<string, string> };
    const result = requestFulfilled(config);
    expect(result.headers.Authorization).toBe('Bearer my-token');
  });

  it('leaves the config untouched when there is no token', async () => {
    const { requestFulfilled } = await loadApiClient();
    const config = { headers: {} as Record<string, string> };
    const result = requestFulfilled(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it('rejects with the original error when the request itself fails to build', async () => {
    const { requestRejected } = await loadApiClient();
    const error = new Error('bad config');
    await expect(requestRejected(error)).rejects.toBe(error);
  });
});

describe('lib/api — response interceptor: 401 handling', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(axios.post).mockReset();
    Object.defineProperty(window, 'location', {
      value: { href: '', pathname: '/dashboard' },
      writable: true,
      configurable: true,
    });
  });

  it('passes successful responses through unchanged', async () => {
    const { responseFulfilled } = await loadApiClient();
    const response = { data: 'ok', status: 200 };
    expect(responseFulfilled(response)).toBe(response);
  });

  it('passes non-401 errors straight through', async () => {
    const { responseRejected } = await loadApiClient();
    const error = { response: { status: 500 }, config: { url: '/x', headers: {} } };
    await expect(responseRejected(error)).rejects.toBe(error);
  });

  it('skips refresh and rejects for auth endpoints (login/register/refresh)', async () => {
    const { responseRejected } = await loadApiClient();
    localStorage.setItem('refresh_token', 'rt');
    const error = {
      response: { status: 401 },
      config: { url: '/auth/login', headers: {} },
    };
    await expect(responseRejected(error)).rejects.toBe(error);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('skips refresh when the request has already been retried', async () => {
    const { responseRejected } = await loadApiClient();
    localStorage.setItem('refresh_token', 'rt');
    const error = {
      response: { status: 401 },
      config: { url: '/x', headers: {}, _retry: true },
    };
    await expect(responseRejected(error)).rejects.toBe(error);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('redirects to login and rejects when there is no refresh token', async () => {
    const { responseRejected } = await loadApiClient();
    const error = { response: { status: 401 }, config: { url: '/x', headers: {} } };
    await expect(responseRejected(error)).rejects.toBe(error);
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(window.location.href).toBe('/auth/login');
  });

  it('does not redirect when already on an /auth page (avoids a redirect loop)', async () => {
    Object.defineProperty(window, 'location', {
      value: { href: '', pathname: '/auth/login' },
      writable: true,
      configurable: true,
    });
    const { responseRejected } = await loadApiClient();
    const error = { response: { status: 401 }, config: { url: '/x', headers: {} } };
    await expect(responseRejected(error)).rejects.toBe(error);
    expect(window.location.href).toBe('');
  });

  it('refreshes the token and retries the original request on success', async () => {
    localStorage.setItem('refresh_token', 'old-refresh');
    vi.mocked(axios.post).mockResolvedValue({
      data: { access_token: 'new-access', refresh_token: 'new-refresh' },
    } as any);
    const { responseRejected, instance } = await loadApiClient();
    instance.mockResolvedValue({ data: 'retried-ok' });

    const originalRequest: any = { url: '/x', headers: {} };
    const error = { response: { status: 401 }, config: originalRequest };

    const result = await responseRejected(error);

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3001/api/auth/refresh',
      { refreshToken: 'old-refresh' },
      { headers: { 'Content-Type': 'application/json' } },
    );
    expect(localStorage.getItem('access_token')).toBe('new-access');
    expect(localStorage.getItem('refresh_token')).toBe('new-refresh');
    expect(originalRequest.headers.Authorization).toBe('Bearer new-access');
    expect(instance).toHaveBeenCalledWith(originalRequest);
    expect(result).toEqual({ data: 'retried-ok' });
  });

  it('keeps the existing refresh token when the backend does not rotate it', async () => {
    localStorage.setItem('refresh_token', 'old-refresh');
    vi.mocked(axios.post).mockResolvedValue({ data: { access_token: 'new-access' } } as any);
    const { responseRejected, instance } = await loadApiClient();
    instance.mockResolvedValue({ data: 'ok' });

    await responseRejected({
      response: { status: 401 },
      config: { url: '/x', headers: {} },
    });

    expect(localStorage.getItem('refresh_token')).toBe('old-refresh');
  });

  it('clears tokens, redirects, and rejects when the refresh call itself fails', async () => {
    localStorage.setItem('access_token', 'stale-access');
    localStorage.setItem('refresh_token', 'stale-refresh');
    vi.mocked(axios.post).mockRejectedValue(new Error('refresh failed'));
    const { responseRejected } = await loadApiClient();

    const error = { response: { status: 401 }, config: { url: '/x', headers: {} } };
    await expect(responseRejected(error)).rejects.toBe(error);

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(window.location.href).toBe('/auth/login');
  });

  it('queues a concurrent 401 instead of triggering a second refresh call', async () => {
    localStorage.setItem('refresh_token', 'old-refresh');
    let resolvePost!: (v: any) => void;
    vi.mocked(axios.post).mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      }) as any,
    );
    const { responseRejected, instance } = await loadApiClient();
    instance.mockResolvedValue({ data: 'retried' });

    const req1: any = { url: '/x', headers: {} };
    const req2: any = { url: '/y', headers: {} };
    const p1 = responseRejected({ response: { status: 401 }, config: req1 });
    const p2 = responseRejected({ response: { status: 401 }, config: req2 });

    // Only the first 401 should have triggered the refresh call so far.
    expect(axios.post).toHaveBeenCalledTimes(1);

    resolvePost({ data: { access_token: 'new-access' } });
    await Promise.all([p1, p2]);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(req1.headers.Authorization).toBe('Bearer new-access');
    expect(req2.headers.Authorization).toBe('Bearer new-access');
  });
});
