import * as request from 'supertest';
import slugify from 'slugify';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import { seedCountry, cleanupCountry, setCountryStatus } from './utils/seed';

/**
 * Parcours "explorer les destinations" : agrégation publique (pays actifs
 * uniquement, villes validées uniquement) consommée par la page Destinations
 * du frontend — aucune authentification requise.
 */
describe('Destinations (e2e)', () => {
  let app: INestApplication;
  let seeded: Awaited<ReturnType<typeof seedCountry>>;

  beforeAll(async () => {
    app = await createE2eApp();
    seeded = await seedCountry(app);
  });

  afterAll(async () => {
    await cleanupCountry(app, seeded);
    await app.close();
  });

  it('liste uniquement les pays actifs', async () => {
    const res = await request(app.getHttpServer()).get('/api/destinations');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(
      res.body.some(
        (c: { countryName: string }) =>
          c.countryName === seeded.country.countryName,
      ),
    ).toBe(true);
  });

  it('résout un pays par le slug de son nom, sans ville (aucune validée)', async () => {
    const slug = slugify(seeded.country.countryName, {
      lower: true,
      strict: true,
    });
    const res = await request(app.getHttpServer()).get(
      `/api/destinations/${slug}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.countryName).toBe(seeded.country.countryName);
    expect(res.body.cities).toEqual([]);
  });

  it('renvoie 404 pour un slug inconnu', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/destinations/pays-inexistant-xyz',
    );
    expect(res.status).toBe(404);
  });

  it("n'inclut pas un pays archivé dans la liste publique", async () => {
    const archived = await seedCountry(app);
    // Passer le pays en archivé via l'API admin nécessiterait un compte admin —
    // on modifie directement le statut pour rester focalisé sur le contrat de
    // lecture publique de `/destinations`, déjà couvert côté écriture par
    // geo-content.e2e-spec.ts.
    await setCountryStatus(app, archived.country.idCountry, 'archived');

    const res = await request(app.getHttpServer()).get('/api/destinations');
    expect(
      res.body.some(
        (c: { countryName: string }) =>
          c.countryName === archived.country.countryName,
      ),
    ).toBe(false);

    await cleanupCountry(app, archived);
  });
});
