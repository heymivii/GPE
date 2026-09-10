import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import {
  uniqueEmail,
  promoteToRole,
  seedCountry,
  cleanupCountry,
  deleteUsersByEmail,
} from './utils/seed';

/**
 * CRUD admin des démarches administratives (`admin_procedure`) — le contenu
 * que `procedure-tracking.e2e-spec.ts` rattache ensuite aux projets. Couvre
 * aussi la génération automatique depuis gov-links, désactivée par défaut
 * (`GENERATION_ENABLED` non positionné) : un admin ne peut pas la contourner.
 */
describe('Admin Procedure (e2e)', () => {
  let app: INestApplication;
  let seeded: Awaited<ReturnType<typeof seedCountry>>;
  const createdEmails: string[] = [];
  let userToken: string;
  let adminToken: string;
  let procedureId: number;

  beforeAll(async () => {
    app = await createE2eApp();
    seeded = await seedCountry(app);

    const userEmail = uniqueEmail('adminproc-user');
    const adminEmail = uniqueEmail('adminproc-admin');
    createdEmails.push(userEmail, adminEmail);

    const user = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'AdminProc',
        lastName: 'User',
        email: userEmail,
        password: 'Sup3rSecret!',
      });
    userToken = user.body.access_token;

    const admin = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'AdminProc',
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
    await cleanupCountry(app, seeded);
    await app.close();
  });

  it('refuse la création à un non-admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin-procedure')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        procedureType: 'Visa long séjour',
        countryId: seeded.country.idCountry,
      });
    expect(res.status).toBe(403);
  });

  it('un admin crée une démarche', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin-procedure')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        procedureType: 'Visa long séjour',
        category: 'visa',
        stepOrder: 1,
        countryId: seeded.country.idCountry,
      });

    expect(res.status).toBe(201);
    procedureId = res.body.idAdminProcedure;
    expect(procedureId).toEqual(expect.any(Number));
  });

  it('lit la démarche publiquement et la filtre par pays', async () => {
    const one = await request(app.getHttpServer()).get(
      `/api/admin-procedure/${procedureId}`,
    );
    expect(one.status).toBe(200);

    const byCountry = await request(app.getHttpServer()).get(
      `/api/admin-procedure?countryId=${seeded.country.idCountry}`,
    );
    expect(byCountry.status).toBe(200);
    expect(
      byCountry.body.some(
        (p: { idAdminProcedure: number }) => p.idAdminProcedure === procedureId,
      ),
    ).toBe(true);
  });

  it('un admin modifie puis supprime la démarche', async () => {
    const patch = await request(app.getHttpServer())
      .patch(`/api/admin-procedure/${procedureId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stepOrder: 2 });
    expect(patch.status).toBe(200);
    expect(patch.body.stepOrder).toBe(2);

    const del = await request(app.getHttpServer())
      .delete(`/api/admin-procedure/${procedureId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 204]).toContain(del.status);
  });

  it('refuse la génération automatique même à un admin (feature désactivée)', async () => {
    const res = await request(app.getHttpServer())
      .post(
        `/api/admin-procedure/generate?country=${seeded.country.countryName}`,
      )
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
  });
});
