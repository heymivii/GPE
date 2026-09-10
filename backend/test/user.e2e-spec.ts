import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import { uniqueEmail, deleteUsersByEmail } from './utils/seed';

/**
 * Parcours "profil utilisateur" : lecture/mise à jour du profil et des
 * préférences de confidentialité, plus les routes publiques (annuaire
 * d'experts, note de support) qui n'exigent aucune authentification.
 */
describe('User (e2e)', () => {
  let app: INestApplication;
  const createdEmails: string[] = [];
  let token: string;
  let userId: number;

  beforeAll(async () => {
    app = await createE2eApp();

    const email = uniqueEmail('user-profile');
    createdEmails.push(email);

    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Profile',
        lastName: 'User',
        email,
        password: 'Sup3rSecret!',
        age: 28,
      });
    token = res.body.access_token;
    userId = res.body.user.idUser;
  });

  afterAll(async () => {
    await deleteUsersByEmail(app, createdEmails);
    await app.close();
  });

  it('refuse GET /users/me sans authentification', async () => {
    const res = await request(app.getHttpServer()).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('renvoie mon profil sans le mot de passe', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.idUser).toBe(userId);
    expect(res.body.age).toBe(28);
    expect(res.body.password).toBeUndefined();
  });

  it('met à jour mon profil', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ age: 31, status: 'employee', languageLevel: 'B1' });

    expect(res.status).toBe(200);
    expect(res.body.age).toBe(31);
    expect(res.body.status).toBe('employee');
    expect(res.body.languageLevel).toBe('B1');
  });

  it('rejette une mise à jour avec un champ non déclaré (whitelist stricte)', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ roles: 'admin' });

    expect(res.status).toBe(400);
  });

  it('met à jour mes préférences de confidentialité buddy', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/users/me/privacy')
      .set('Authorization', `Bearer ${token}`)
      .send({ buddyOptIn: true, buddyContactOptIn: true });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ buddyOptIn: true, buddyContactOptIn: true });
  });

  it('désactiver buddyOptIn force aussi buddyContactOptIn à false', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/users/me/privacy')
      .set('Authorization', `Bearer ${token}`)
      .send({ buddyOptIn: false, buddyContactOptIn: true });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ buddyOptIn: false, buddyContactOptIn: false });
  });

  it('expose une note de support publique (0 avis) sans authentification', async () => {
    const res = await request(app.getHttpServer()).get(
      `/api/users/${userId}/rating`,
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ average: 0, count: 0 });
  });

  it("liste l'annuaire d'experts publiquement (vide, aucun expert vérifié ici)", async () => {
    const res = await request(app.getHttpServer()).get('/api/users/experts');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((u: { idUser: number }) => u.idUser === userId)).toBe(
      false,
    );
  });

  // Bug découvert en écrivant le test e2e frontend `auth-flow.spec.ts` — pas
  // corrigé (hors périmètre : tests uniquement, code inchangé). `DELETE /users/me`
  // n'a pas de `@UseGuards(JwtAuthGuard)`, contrairement à toutes ses voisines :
  // un appel sans jeton atteint quand même le handler, où `req.user` est
  // `undefined`. Ce test fige ce comportement actuel (500, pas 401) pour qu'il
  // saute au jour où quelqu'un ajoutera le guard manquant.
  it('DELETE /users/me sans authentification plante en 500 (guard manquant — bug connu)', async () => {
    const res = await request(app.getHttpServer()).delete('/api/users/me');
    expect(res.status).toBe(500);
  });
});
