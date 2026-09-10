import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import {
  uniqueEmail,
  seedCountry,
  seedCity,
  cleanupCity,
  cleanupCountry,
  deleteUsersByEmail,
} from './utils/seed';

/**
 * Parcours "comparaisons de villes sauvegardées" : un utilisateur enregistre
 * une ville dans ses comparaisons, la retrouve, et un tiers ne peut ni la
 * voir ni la supprimer (IDOR explicitement gardé ici, contrairement à
 * experience.e2e-spec.ts).
 */
describe('City Comparison (e2e)', () => {
  let app: INestApplication;
  let seeded: Awaited<ReturnType<typeof seedCountry>>;
  let city: Awaited<ReturnType<typeof seedCity>>;
  const createdEmails: string[] = [];

  let ownerToken: string;
  let otherToken: string;
  let comparisonId: number;

  beforeAll(async () => {
    app = await createE2eApp();
    seeded = await seedCountry(app);
    city = await seedCity(app, seeded.country.idCountry);

    const ownerEmail = uniqueEmail('citycmp-owner');
    const otherEmail = uniqueEmail('citycmp-other');
    createdEmails.push(ownerEmail, otherEmail);

    const owner = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'CityCmp',
        lastName: 'Owner',
        email: ownerEmail,
        password: 'Sup3rSecret!',
      });
    ownerToken = owner.body.access_token;

    const other = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'CityCmp',
        lastName: 'Other',
        email: otherEmail,
        password: 'Sup3rSecret!',
      });
    otherToken = other.body.access_token;
  });

  afterAll(async () => {
    await deleteUsersByEmail(app, createdEmails);
    await cleanupCity(app, city);
    await cleanupCountry(app, seeded);
    await app.close();
  });

  it('refuse la création sans authentification', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/city-comparison')
      .send({ cityId: city.idCity });
    expect(res.status).toBe(401);
  });

  it('ajoute une ville à mes comparaisons', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/city-comparison')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ cityId: city.idCity });

    expect(res.status).toBe(201);
    comparisonId = res.body.idCityComparison;
    expect(comparisonId).toEqual(expect.any(Number));
  });

  it('liste mes comparaisons', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/city-comparison')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(
      res.body.some(
        (c: { idCityComparison: number }) =>
          c.idCityComparison === comparisonId,
      ),
    ).toBe(true);
  });

  it("refuse à un tiers l'accès à ma comparaison", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/city-comparison/${comparisonId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  it('refuse à un tiers de supprimer ma comparaison', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/city-comparison/${comparisonId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  it('je peux supprimer ma propre comparaison', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/city-comparison/${comparisonId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect([200, 204]).toContain(res.status);
  });
});
