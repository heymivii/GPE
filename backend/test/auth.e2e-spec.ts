import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import { uniqueEmail, deleteUsersByEmail } from './utils/seed';

/**
 * Parcours critique "authentification" de bout en bout : inscription →
 * connexion → accès protégé → refresh → déconnexion, contre une vraie base
 * Postgres (migrée) et le vrai pipeline HTTP (préfixe /api, ValidationPipe,
 * cookies). Contrairement aux tests unitaires de ce module (auth.service/
 * auth.controller .spec.ts), rien n'est mocké ici : AuthService, le
 * repository TypeORM et la base de données sont tous réels.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;
  const password = 'Sup3rSecret!';
  const createdEmails: string[] = [];

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await deleteUsersByEmail(app, createdEmails);
    await app.close();
  });

  // Le endpoint /auth/register est limité à 5 requêtes/minute par IP
  // (@Throttle sur AuthController.register) — cette limite s'applique AVANT
  // la validation du DTO, donc chaque appel HTTP compte, y compris ceux
  // volontairement invalides. On regroupe donc les vérifications et on
  // réutilise l'email déjà inscrit pour le test de doublon, afin de rester
  // largement sous la limite dans ce fichier (4 appels au total).
  it('rejette une inscription invalide (email + mot de passe non conformes)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'pas-un-email',
        password: 'allweak',
      });

    expect(res.status).toBe(400);
  });

  let firstEmail: string;

  it('inscrit un nouvel utilisateur et renvoie un profil sans mot de passe', async () => {
    const email = uniqueEmail('register');
    createdEmails.push(email);
    firstEmail = email;

    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email,
        password,
      });

    expect(res.status).toBe(201);
    expect(res.body.access_token).toEqual(expect.any(String));
    expect(res.body.refresh_token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.password).toBeUndefined();
    expect(res.headers['set-cookie']?.[0]).toMatch(/access_token=/);
  });

  it('refuse une seconde inscription avec le même email (409)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Alan',
        lastName: 'Turing',
        email: firstEmail,
        password,
      });

    expect(res.status).toBe(409);
  });

  describe('une fois un compte créé', () => {
    const email = uniqueEmail('login-flow');
    let accessToken: string;
    let refreshToken: string;

    beforeAll(async () => {
      createdEmails.push(email);
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ firstName: 'Grace', lastName: 'Hopper', email, password })
        .expect(201);
    });

    it('refuse la connexion avec un mauvais mot de passe', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'MauvaisMdp1' });

      expect(res.status).toBe(401);
    });

    it('connecte avec les bons identifiants', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(email);
      accessToken = res.body.access_token;
      refreshToken = res.body.refresh_token;
    });

    it('refuse GET /auth/profile sans jeton', async () => {
      const res = await request(app.getHttpServer()).get('/api/auth/profile');
      expect(res.status).toBe(401);
    });

    it('renvoie le profil avec un Bearer token valide', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(email);
    });

    it('renvoie de nouveaux jetons via /auth/refresh', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.access_token).toEqual(expect.any(String));
      expect(res.body.refresh_token).toEqual(expect.any(String));
    });

    it("refuse /auth/refresh avec un jeton d'accès (pas un refresh token)", async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: accessToken });

      expect(res.status).toBe(401);
    });

    it('déconnecte et efface le cookie de session', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['set-cookie']?.[0]).toMatch(/access_token=;/);
    });
  });
});
