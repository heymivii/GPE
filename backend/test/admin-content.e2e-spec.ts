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
 * Contenus éditoriaux "admin only, lecture publique" : checklist, guide,
 * resource, business-sector. Même contrat CRUD dans les quatre modules (créer/
 * modifier/supprimer réservés à un admin, lecture ouverte à tous) — un seul
 * fichier regroupe les quatre plutôt que de dupliquer le même scénario.
 */
describe('Admin Content — checklist / guide / resource / business-sector (e2e)', () => {
  let app: INestApplication;
  let seeded: Awaited<ReturnType<typeof seedCountry>>;
  const createdEmails: string[] = [];

  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = await createE2eApp();
    seeded = await seedCountry(app);

    const userEmail = uniqueEmail('content-user');
    const adminEmail = uniqueEmail('content-admin');
    createdEmails.push(userEmail, adminEmail);

    const user = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Content',
        lastName: 'User',
        email: userEmail,
        password: 'Sup3rSecret!',
      });
    userToken = user.body.access_token;

    const admin = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Content',
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

  describe('Checklist', () => {
    let id: number;

    it('refuse la création à un non-admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/checklist')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Checklist visa',
          steps: { a: 1 },
          countryId: seeded.country.idCountry,
        });
      expect(res.status).toBe(403);
    });

    it('un admin crée une checklist', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/checklist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Checklist visa',
          steps: { a: 1 },
          countryId: seeded.country.idCountry,
        });
      expect(res.status).toBe(201);
      id = res.body.idChecklist;
      expect(id).toEqual(expect.any(Number));
    });

    it('lit la checklist publiquement', async () => {
      const list = await request(app.getHttpServer()).get('/api/checklist');
      expect(list.status).toBe(200);

      const one = await request(app.getHttpServer()).get(
        `/api/checklist/${id}`,
      );
      expect(one.status).toBe(200);
    });

    it('un admin modifie puis supprime la checklist', async () => {
      const patch = await request(app.getHttpServer())
        .patch(`/api/checklist/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Checklist visa (à jour)' });
      expect(patch.status).toBe(200);
      expect(patch.body.title).toBe('Checklist visa (à jour)');

      const del = await request(app.getHttpServer())
        .delete(`/api/checklist/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200, 204]).toContain(del.status);
    });
  });

  describe('Guide', () => {
    let id: number;

    it('refuse la création à un non-admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/guide')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Guide logement',
          content: 'Contenu',
          countryId: seeded.country.idCountry,
        });
      expect(res.status).toBe(403);
    });

    it('un admin crée un guide', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/guide')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Guide logement',
          content: 'Contenu du guide',
          guideType: 'housing',
          countryId: seeded.country.idCountry,
        });
      expect(res.status).toBe(201);
      id = res.body.idGuide;
      expect(id).toEqual(expect.any(Number));
    });

    it('lit le guide publiquement, puis un admin le modifie et le supprime', async () => {
      expect(
        (await request(app.getHttpServer()).get(`/api/guide/${id}`)).status,
      ).toBe(200);

      const patch = await request(app.getHttpServer())
        .patch(`/api/guide/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Guide logement (à jour)' });
      expect(patch.status).toBe(200);

      const del = await request(app.getHttpServer())
        .delete(`/api/guide/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200, 204]).toContain(del.status);
    });
  });

  describe('Resource', () => {
    let id: number;

    it('refuse la création à un non-admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/resource')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Site utile', countryId: seeded.country.idCountry });
      expect(res.status).toBe(403);
    });

    it('un admin crée une ressource', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/resource')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Site utile',
          url: 'https://example.com',
          resourceType: 'website',
          countryId: seeded.country.idCountry,
        });
      expect(res.status).toBe(201);
      id = res.body.idResource;
      expect(id).toEqual(expect.any(Number));
    });

    it('filtre les ressources par pays, puis un admin la modifie et la supprime', async () => {
      const byCountry = await request(app.getHttpServer()).get(
        `/api/resource?countryId=${seeded.country.idCountry}`,
      );
      expect(byCountry.status).toBe(200);
      expect(
        byCountry.body.some((r: { idResource: number }) => r.idResource === id),
      ).toBe(true);

      const patch = await request(app.getHttpServer())
        .patch(`/api/resource/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Site utile (à jour)' });
      expect(patch.status).toBe(200);

      const del = await request(app.getHttpServer())
        .delete(`/api/resource/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200, 204]).toContain(del.status);
    });
  });

  describe('Business Sector', () => {
    let id: number;

    it('refuse la création à un non-admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/business-sector')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Numérique' });
      expect(res.status).toBe(403);
    });

    it('un admin crée un secteur, le liste, le modifie puis le supprime', async () => {
      const create = await request(app.getHttpServer())
        .post('/api/business-sector')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Numérique e2e', description: 'Tech & IT' });
      expect(create.status).toBe(201);
      id = create.body.idBusinessSector;
      expect(id).toEqual(expect.any(Number));

      const list = await request(app.getHttpServer()).get(
        '/api/business-sector',
      );
      expect(list.status).toBe(200);

      const patch = await request(app.getHttpServer())
        .patch(`/api/business-sector/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Tech, IT & data' });
      expect(patch.status).toBe(200);

      const del = await request(app.getHttpServer())
        .delete(`/api/business-sector/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200, 204]).toContain(del.status);
    });
  });
});
