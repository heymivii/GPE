import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import { uniqueEmail, promoteToRole, deleteUsersByEmail } from './utils/seed';

/**
 * Parcours "recherche globale" : la route publique elle-même (validation,
 * réponse vide gracieuse) et la protection de l'endpoint de réindexation
 * (admin uniquement). Ne teste pas la pertinence du full-text search
 * lui-même — dépendant d'un trigger PostgreSQL (`global_search_index`) hors
 * périmètre d'un test d'API — seulement le contrat HTTP.
 */
describe('Global Search (e2e)', () => {
  let app: INestApplication;
  const createdEmails: string[] = [];
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = await createE2eApp();

    const userEmail = uniqueEmail('gsearch-user');
    const adminEmail = uniqueEmail('gsearch-admin');
    createdEmails.push(userEmail, adminEmail);

    const user = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Search',
        lastName: 'User',
        email: userEmail,
        password: 'Sup3rSecret!',
      });
    userToken = user.body.access_token;

    const admin = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Search',
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
    await app.close();
  });

  it('rejette une recherche sans terme (q manquant)', async () => {
    const res = await request(app.getHttpServer()).get('/api/global-search');
    expect(res.status).toBe(400);
  });

  it('renvoie une réponse vide et gracieuse sur un terme vide', async () => {
    const res = await request(app.getHttpServer()).get('/api/global-search?q=');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ results: [], total: 0, query: '' });
  });

  it('rejette une catégorie inconnue', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/global-search?q=paris&category=not-a-real-category',
    );
    expect(res.status).toBe(400);
  });

  it('accepte une recherche publique valide sans authentification', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/global-search?q=paris&category=city&limit=5',
    );
    expect(res.status).toBe(200);
    expect(res.body.query).toBe('paris');
    expect(Array.isArray(res.body.results)).toBe(true);
  });

  it('refuse la réindexation à un utilisateur non-admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/global-search/refresh')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('refuse la réindexation sans authentification', async () => {
    const res = await request(app.getHttpServer()).post(
      '/api/global-search/refresh',
    );
    expect(res.status).toBe(401);
  });

  it('un admin déclenche la réindexation', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/global-search/refresh')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
