import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';

/**
 * Données migratoires OCDE : endpoints publics, source externe avec repli
 * gracieux intégré (`OecdMigrationService.getMigrationData` renvoie une liste
 * statique code/nom si l'API de l'OCDE est injoignable) — toujours un 200,
 * jamais d'appel réseau à mocker pour que ce test reste déterministe.
 */
describe('OECD Migration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('liste les données migratoires par pays supporté', async () => {
    const res = await request(app.getHttpServer()).get('/api/migration');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('countryCode');
    expect(res.body[0]).toHaveProperty('countryName');
  });

  it('résout un pays par son code ISO2', async () => {
    const res = await request(app.getHttpServer()).get('/api/migration/FR');

    expect(res.status).toBe(200);
    expect(res.body?.countryCode).toBe('FRA');
  });

  it('renvoie null pour un code inconnu', async () => {
    const res = await request(app.getHttpServer()).get('/api/migration/XX');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });
});
