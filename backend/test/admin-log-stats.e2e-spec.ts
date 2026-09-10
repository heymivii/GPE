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
 * Deux vues admin en lecture seule : le journal d'activité (`admin-logs`,
 * alimenté par les autres contrôleurs admin — ici via une ressource créée
 * pour l'occasion ; `business-sector` n'appelle PAS `AdminLogService`, donc
 * ne convient pas pour générer une entrée vérifiable) et les statistiques
 * globales de la plateforme.
 */
describe('Admin Logs & Stats (e2e)', () => {
  let app: INestApplication;
  let seeded: Awaited<ReturnType<typeof seedCountry>>;
  const createdEmails: string[] = [];
  let userToken: string;
  let adminToken: string;
  let resourceId: number;

  beforeAll(async () => {
    app = await createE2eApp();
    seeded = await seedCountry(app);

    const userEmail = uniqueEmail('adminlog-user');
    const adminEmail = uniqueEmail('adminlog-admin');
    createdEmails.push(userEmail, adminEmail);

    const user = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'AdminLog',
        lastName: 'User',
        email: userEmail,
        password: 'Sup3rSecret!',
      });
    userToken = user.body.access_token;

    const admin = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'AdminLog',
        lastName: 'Admin',
        email: adminEmail,
        password: 'Sup3rSecret!',
      });
    await promoteToRole(app, admin.body.user.idUser, 'admin');
    const relogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password: 'Sup3rSecret!' });
    adminToken = relogin.body.access_token;

    // Génère une entrée de journal vérifiable (création d'une ressource).
    const resource = await request(app.getHttpServer())
      .post('/api/resource')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `E2E Ressource Log ${Date.now()}`,
        countryId: seeded.country.idCountry,
      });
    resourceId = resource.body.idResource;
  });

  afterAll(async () => {
    if (resourceId) {
      await request(app.getHttpServer())
        .delete(`/api/resource/${resourceId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
    await deleteUsersByEmail(app, createdEmails);
    await cleanupCountry(app, seeded);
    await app.close();
  });

  it('refuse le journal admin sans authentification, puis à un non-admin', async () => {
    const anon = await request(app.getHttpServer()).get('/api/admin-logs');
    expect(anon.status).toBe(401);

    const nonAdmin = await request(app.getHttpServer())
      .get('/api/admin-logs')
      .set('Authorization', `Bearer ${userToken}`);
    expect(nonAdmin.status).toBe(403);
  });

  it("un admin voit l'entrée du journal correspondant à son action, sans mot de passe exposé", async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const entry = res.body.find(
      (l: { entityId: string; action: string }) =>
        l.entityId === String(resourceId) && l.action === 'CREATE',
    );
    expect(entry).toBeDefined();
    expect(entry.user?.password).toBeUndefined();
  });

  it('refuse les statistiques globales sans droits admin', async () => {
    const anon = await request(app.getHttpServer()).get(
      '/api/admin/dashboard/stats',
    );
    expect(anon.status).toBe(401);

    const nonAdmin = await request(app.getHttpServer())
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${userToken}`);
    expect(nonAdmin.status).toBe(403);
  });

  it('un admin récupère les statistiques globales', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeTruthy();
  });
});
