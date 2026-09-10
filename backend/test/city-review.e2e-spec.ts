import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import {
  uniqueEmail,
  promoteToRole,
  seedCountry,
  cleanupCountry,
  deleteNotificationsForUsers,
  deleteUsersByEmail,
} from './utils/seed';

/**
 * Parcours "revue à 4 yeux" d'une ville (src/features/city/city.service.ts) :
 * toute création démarre `pending_review` (invisible côté utilisateur) et
 * doit être validée par un admin AUTRE que son auteur avant de devenir
 * `active` — la garantie centrale de ce circuit éditorial.
 */
describe('City review workflow (e2e)', () => {
  let app: INestApplication;
  let seeded: Awaited<ReturnType<typeof seedCountry>>;
  const createdEmails: string[] = [];

  let author: { token: string; id: number };
  let otherAdmin: { token: string; id: number };
  let cityId: number;

  beforeAll(async () => {
    app = await createE2eApp();
    seeded = await seedCountry(app);

    const authorEmail = uniqueEmail('city-author');
    const otherAdminEmail = uniqueEmail('city-other-admin');
    createdEmails.push(authorEmail, otherAdminEmail);

    const authorReg = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'City',
        lastName: 'Author',
        email: authorEmail,
        password: 'Sup3rSecret!',
      });
    await promoteToRole(app, authorReg.body.user.idUser, 'admin');
    const authorLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: authorEmail, password: 'Sup3rSecret!' });
    author = {
      token: authorLogin.body.access_token,
      id: authorReg.body.user.idUser,
    };

    const otherReg = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'City',
        lastName: 'OtherAdmin',
        email: otherAdminEmail,
        password: 'Sup3rSecret!',
      });
    await promoteToRole(app, otherReg.body.user.idUser, 'admin');
    const otherLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: otherAdminEmail, password: 'Sup3rSecret!' });
    otherAdmin = {
      token: otherLogin.body.access_token,
      id: otherReg.body.user.idUser,
    };
  });

  afterAll(async () => {
    if (cityId) {
      await request(app.getHttpServer())
        .delete(`/api/city/${cityId}`)
        .set('Authorization', `Bearer ${otherAdmin.token}`);
    }
    await deleteNotificationsForUsers(app, [author.id, otherAdmin.id]);
    await deleteUsersByEmail(app, createdEmails);
    await cleanupCountry(app, seeded);
    await app.close();
  });

  it('un admin crée une ville — elle démarre en attente de vérification', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/city')
      .set('Authorization', `Bearer ${author.token}`)
      .send({
        name: `E2E Ville ${Date.now()}`,
        countryId: seeded.country.idCountry,
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending_review');
    cityId = res.body.idCity;
  });

  it("refuse que l'auteur valide lui-même sa propre ville (auto-review)", async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/city/${cityId}/approve`)
      .set('Authorization', `Bearer ${author.token}`);

    expect(res.status).toBe(403);
  });

  it('refuse la validation à un utilisateur non-admin', async () => {
    const nonAdminEmail = uniqueEmail('city-nonadmin');
    createdEmails.push(nonAdminEmail);
    const nonAdmin = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'City',
        lastName: 'NonAdmin',
        email: nonAdminEmail,
        password: 'Sup3rSecret!',
      });

    const res = await request(app.getHttpServer())
      .patch(`/api/city/${cityId}/approve`)
      .set('Authorization', `Bearer ${nonAdmin.body.access_token}`);

    expect(res.status).toBe(403);
  });

  it('un autre admin valide la ville — elle devient active', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/city/${cityId}/approve`)
      .set('Authorization', `Bearer ${otherAdmin.token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('active');
  });
});
