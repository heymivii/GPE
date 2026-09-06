import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { retryQuery, MAX_TENTATIVES } from './queryRetry';

const erreurHttp = (status: number) =>
  new AxiosError('échec', 'ERR', undefined, undefined, {
    status,
    statusText: '',
    data: null,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });

describe('retryQuery', () => {
  it('ne rejoue pas une erreur définitive du client', () => {
    // Un 404 rejoué trois fois faisait tourner l'indicateur ~7 s pour rien.
    for (const statut of [400, 401, 403, 404, 422]) {
      expect(retryQuery(0, erreurHttp(statut))).toBe(false);
    }
  });

  it('rejoue les erreurs serveur et les pannes réseau', () => {
    expect(retryQuery(0, erreurHttp(500))).toBe(true);
    expect(retryQuery(0, erreurHttp(503))).toBe(true);
    expect(retryQuery(0, new AxiosError('Network Error'))).toBe(true);
  });

  it('rejoue les statuts transitoires', () => {
    expect(retryQuery(0, erreurHttp(408))).toBe(true);
    expect(retryQuery(0, erreurHttp(429))).toBe(true);
  });

  it('s’arrête au plafond de tentatives', () => {
    expect(retryQuery(MAX_TENTATIVES - 1, erreurHttp(500))).toBe(true);
    expect(retryQuery(MAX_TENTATIVES, erreurHttp(500))).toBe(false);
  });

  it('rejoue une erreur non-HTTP, faute de pouvoir la qualifier', () => {
    expect(retryQuery(0, new Error('boom'))).toBe(true);
  });
});
