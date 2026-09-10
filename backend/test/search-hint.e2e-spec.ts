import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import { uniqueEmail, promoteToRole, deleteUsersByEmail } from './utils/seed';

/**
 * CRUD admin des fiches "carnet de recherche" (mots-clés/domaines officiels
 * par pays+catégorie, alimentent gov-links) — clé composite (countryCode,
 * category), tout le contrôleur est admin-only.
 */
describe('Search Hint (e2e)', () => {
  let app: INestApplication;
  const createdEmails: string[] = [];
  let userToken: string;
  let adminToken: string;
  const countryCode = 'ZZ'; // code factice, pas de FK vers `country`
  const category = 'e2e-test-category';

  beforeAll(async () => {
    app = await createE2eApp();

    const userEmail = uniqueEmail('searchhint-user');
    const adminEmail = uniqueEmail('searchhint-admin');
    createdEmails.push(userEmail, adminEmail);

    const user = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'SearchHint',
        lastName: 'User',
        email: userEmail,
        password: 'Sup3rSecret!',
      });
    userToken = user.body.access_token;

    const admin = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'SearchHint',
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
    await request(app.getHttpServer())
      .delete(`/api/search-hint/${countryCode}/${category}`)
      .set('Authorization', `Bearer ${adminToken}`);
    await deleteUsersByEmail(app, createdEmails);
    await app.close();
  });

  it('refuse tout accès (même lecture) sans authentification admin', async () => {
    const anon = await request(app.getHttpServer()).get('/api/search-hint');
    expect(anon.status).toBe(401);

    const nonAdmin = await request(app.getHttpServer())
      .get('/api/search-hint')
      .set('Authorization', `Bearer ${userToken}`);
    expect(nonAdmin.status).toBe(403);
  });

  it('un admin crée une fiche de recherche', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/search-hint')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        countryCode,
        category,
        keywords: 'visa long séjour',
        officialDomains: ['gouv.test'],
      });

    expect(res.status).toBe(201);
    expect(res.body.countryCode).toBe(countryCode);
    expect(res.body.category).toBe(category);
  });

  it('la retrouve par clé composite et dans la liste filtrée par pays', async () => {
    const one = await request(app.getHttpServer())
      .get(`/api/search-hint/${countryCode}/${category}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(one.status).toBe(200);
    expect(one.body.keywords).toBe('visa long séjour');

    const list = await request(app.getHttpServer())
      .get(`/api/search-hint?country=${countryCode}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(list.status).toBe(200);
    expect(
      list.body.some(
        (h: { countryCode: string; category: string }) =>
          h.countryCode === countryCode && h.category === category,
      ),
    ).toBe(true);
  });

  it('un admin modifie puis supprime la fiche', async () => {
    const patch = await request(app.getHttpServer())
      .patch(`/api/search-hint/${countryCode}/${category}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ keywords: 'visa long séjour, titre de séjour' });
    expect(patch.status).toBe(200);
    expect(patch.body.keywords).toBe('visa long séjour, titre de séjour');

    const del = await request(app.getHttpServer())
      .delete(`/api/search-hint/${countryCode}/${category}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 204]).toContain(del.status);
  });
});
