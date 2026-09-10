import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import {
  uniqueEmail,
  promoteToRole,
  seedCountry,
  seedCity,
  cleanupCity,
  cleanupCountry,
  deleteUsersByEmail,
} from './utils/seed';

/**
 * Modules "données Numbeo par ville" (coût de la vie, qualité de vie,
 * immobilier) : ne couvre QUE les chemins qui ne déclenchent aucun appel
 * externe — lecture cache-only et édition manuelle admin — jamais les routes
 * `admin/fetch*` qui scrapent réellement Numbeo (lentes, dépendantes du
 * réseau, hors périmètre d'un test d'intégration reproductible). Ces routes
 * ne sont vérifiées que pour leur garde d'accès (403 sans droits), sans être
 * déclenchées.
 */
describe('Numbeo city data — cost-of-living / quality-of-life / property-investment (e2e)', () => {
  let app: INestApplication;
  let seeded: Awaited<ReturnType<typeof seedCountry>>;
  let city: Awaited<ReturnType<typeof seedCity>>;
  const createdEmails: string[] = [];

  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = await createE2eApp();
    seeded = await seedCountry(app);
    city = await seedCity(app, seeded.country.idCountry);

    const userEmail = uniqueEmail('numbeo-user');
    const adminEmail = uniqueEmail('numbeo-admin');
    createdEmails.push(userEmail, adminEmail);

    const user = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Numbeo',
        lastName: 'User',
        email: userEmail,
        password: 'Sup3rSecret!',
      });
    userToken = user.body.access_token;

    const admin = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Numbeo',
        lastName: 'Admin',
        email: adminEmail,
        password: 'Sup3rSecret!',
      });
    await promoteToRole(app, admin.body.user.idUser, 'admin');
    const relogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password: 'Sup3rSecret!' });
    adminToken = relogin.body.access_token;
  });

  afterAll(async () => {
    await deleteUsersByEmail(app, createdEmails);
    await cleanupCity(app, city);
    await cleanupCountry(app, seeded);
    await app.close();
  });

  describe('Cost of Living', () => {
    it('rejette un pays hors liste blanche (403)', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/cost-of-living/search?city=Berlin&country=Germany',
      );
      expect(res.status).toBe(403);
    });

    it("refuse l'édition manuelle à un non-admin", async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/cost-of-living/${city.idCity}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ summary: { averageSalary: 3000 } });
      expect(res.status).toBe(403);
    });

    it('refuse la réindexation complète (seed) à un non-admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/cost-of-living/seed')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Quality of Life', () => {
    it("renvoie un corps vide pour une ville sans données en cache (pas d'appel externe)", async () => {
      const res = await request(app.getHttpServer()).get(
        `/api/quality-of-life/city/${city.idCity}`,
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual({});
    });

    it("refuse l'édition manuelle à un non-admin", async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/quality-of-life/city/${city.idCity}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ safety: 70 });
      expect(res.status).toBe(403);
    });

    it('un admin édite manuellement les indices, visibles ensuite en lecture', async () => {
      const patch = await request(app.getHttpServer())
        .put(`/api/quality-of-life/city/${city.idCity}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ safety: 70, qualityOfLife: 180 });
      expect(patch.status).toBe(200);

      const read = await request(app.getHttpServer()).get(
        `/api/quality-of-life/city/${city.idCity}`,
      );
      expect(read.status).toBe(200);
      expect(read.body.safety).toBe(70);
      expect(read.body.source).toBe('manuel');
    });

    it('refuse le fetch Numbeo à un non-admin (jamais déclenché ici)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/quality-of-life/admin/fetch-city')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ cityId: city.idCity });
      expect(res.status).toBe(403);
    });
  });

  describe('Property Investment', () => {
    it("renvoie un corps vide pour une ville sans données en cache (pas d'appel externe)", async () => {
      const res = await request(app.getHttpServer()).get(
        `/api/property-investment/city/${city.idCity}`,
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual({});
    });

    it("refuse l'édition manuelle à un non-admin", async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/property-investment/city/${city.idCity}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ gdpPerCapita: 40000 });
      expect(res.status).toBe(403);
    });

    it('un admin édite manuellement les indicateurs, visibles ensuite en lecture', async () => {
      const patch = await request(app.getHttpServer())
        .put(`/api/property-investment/city/${city.idCity}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ gdpPerCapita: 40000 });
      expect(patch.status).toBe(200);

      const read = await request(app.getHttpServer()).get(
        `/api/property-investment/city/${city.idCity}`,
      );
      expect(read.status).toBe(200);
      expect(read.body.gdpPerCapita).toBe(40000);
      expect(read.body.source).toBe('manuel');
    });

    it('refuse le fetch Numbeo à un non-admin (jamais déclenché ici)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/property-investment/admin/fetch-city')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ cityId: city.idCity });
      expect(res.status).toBe(403);
    });
  });
});
