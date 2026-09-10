import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import { uniqueEmail, promoteToRole, deleteUsersByEmail } from './utils/seed';

/**
 * CRUD "contenu géographique" admin-only : continent puis pays (le pays
 * référence le continent créé juste avant). Lecture publique dans les deux
 * cas — seule l'écriture est réservée aux admins.
 */
describe('Continent & Country (e2e)', () => {
  let app: INestApplication;
  const createdEmails: string[] = [];
  let userToken: string;
  let adminToken: string;
  let continentId: number;
  let countryId: number;

  beforeAll(async () => {
    app = await createE2eApp();

    const userEmail = uniqueEmail('geo-user');
    const adminEmail = uniqueEmail('geo-admin');
    createdEmails.push(userEmail, adminEmail);

    const user = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Geo',
        lastName: 'User',
        email: userEmail,
        password: 'Sup3rSecret!',
      });
    userToken = user.body.access_token;

    const admin = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Geo',
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
    // Le pays référence le continent (FK sans cascade) : le supprimer d'abord.
    if (countryId) {
      await request(app.getHttpServer())
        .delete(`/api/country/${countryId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
    if (continentId) {
      await request(app.getHttpServer())
        .delete(`/api/continent/${continentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
    await deleteUsersByEmail(app, createdEmails);
    await app.close();
  });

  it('refuse la création de continent à un non-admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/continent')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'E2E Continent Geo' });
    expect(res.status).toBe(403);
  });

  it('un admin crée un continent', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/continent')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `E2E Continent Geo ${Date.now()}` });

    expect(res.status).toBe(201);
    continentId = res.body.idContinent;
    expect(continentId).toEqual(expect.any(Number));
  });

  it('lit le continent publiquement', async () => {
    const list = await request(app.getHttpServer()).get('/api/continent');
    expect(list.status).toBe(200);

    const one = await request(app.getHttpServer()).get(
      `/api/continent/${continentId}`,
    );
    expect(one.status).toBe(200);
  });

  it('un admin crée un pays rattaché au continent', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/country')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ countryName: `E2E Country Geo ${Date.now()}`, continentId });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('active');
    countryId = res.body.idCountry;
    expect(countryId).toEqual(expect.any(Number));
  });

  it('refuse la modification du pays à un non-admin', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/country/${countryId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ countryName: 'Usurpation' });
    expect(res.status).toBe(403);
  });

  it('un admin modifie le pays (archivage)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/country/${countryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'archived' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('archived');
  });

  // Bug découvert ici — pas corrigé (hors périmètre : tests uniquement, code
  // inchangé). `ContinentService.remove()` ne catch pas la violation de
  // contrainte FK Postgres quand un pays référence encore le continent : elle
  // remonte telle quelle et Nest la traduit en 500, alors qu'un 409 (conflit)
  // serait le comportement attendu pour une erreur de ce type, prévisible côté
  // métier. Ce test fige le comportement actuel pour qu'il saute au jour où
  // quelqu'un ajoutera la gestion d'erreur manquante.
  it('la suppression du continent référencé par un pays plante en 500 (gestion FK manquante — bug connu)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/continent/${continentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(500);
  });
});
