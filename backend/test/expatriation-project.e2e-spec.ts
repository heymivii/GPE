import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import {
  uniqueEmail,
  seedCountry,
  cleanupCountry,
  deleteUsersByEmail,
} from './utils/seed';

/**
 * Parcours critique "projet d'expatriation" : un utilisateur authentifié crée
 * un projet, le consulte, le met à jour puis le supprime — et un tiers ne peut
 * ni le voir ni le modifier. Utilise une vraie base Postgres migrée ; un pays/
 * continent jetable est semé pour satisfaire la contrainte de clé étrangère
 * `destinationCountryId`.
 */
describe('Expatriation Project (e2e)', () => {
  let app: INestApplication;
  let seeded: Awaited<ReturnType<typeof seedCountry>>;
  const createdEmails: string[] = [];

  let ownerToken: string;
  let otherToken: string;
  let projectId: number;

  beforeAll(async () => {
    app = await createE2eApp();
    seeded = await seedCountry(app);

    const ownerEmail = uniqueEmail('project-owner');
    const otherEmail = uniqueEmail('project-other');
    createdEmails.push(ownerEmail, otherEmail);

    const owner = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Owner',
        lastName: 'User',
        email: ownerEmail,
        password: 'Sup3rSecret!',
      });
    ownerToken = owner.body.access_token;

    const other = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Other',
        lastName: 'User',
        email: otherEmail,
        password: 'Sup3rSecret!',
      });
    otherToken = other.body.access_token;
  });

  afterAll(async () => {
    await deleteUsersByEmail(app, createdEmails);
    await cleanupCountry(app, seeded);
    await app.close();
  });

  it('refuse la création sans authentification', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/expatriation-project')
      .send({ destinationCountryId: seeded.country.idCountry });

    expect(res.status).toBe(401);
  });

  it('crée un projet pour l’utilisateur authentifié', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/expatriation-project')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        destinationCountryId: seeded.country.idCountry,
        objective: 'Travailler à l’étranger',
        budget: 15000,
      });

    expect(res.status).toBe(201);
    expect(res.body.idProject).toEqual(expect.any(Number));
    expect(res.body.destinationCountryId).toBe(seeded.country.idCountry);
    projectId = res.body.idProject;
  });

  it('liste le projet créé dans GET /expatriation-project', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/expatriation-project')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(
      res.body.some((p: { idProject: number }) => p.idProject === projectId),
    ).toBe(true);
  });

  it('récupère le détail du projet', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/expatriation-project/${projectId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.idProject).toBe(projectId);
    expect(res.body.destinationCountry?.idCountry).toBe(
      seeded.country.idCountry,
    );
  });

  it("refuse l'accès au projet à un autre utilisateur (403)", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/expatriation-project/${projectId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });

  it('met à jour le projet', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/expatriation-project/${projectId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ budget: 20000, status: 'active' });

    expect(res.status).toBe(200);
    expect(Number(res.body.budget)).toBe(20000);
    expect(res.body.status).toBe('active');
  });

  it('supprime le projet, puis 404 sur un GET suivant', async () => {
    const del = await request(app.getHttpServer())
      .delete(`/api/expatriation-project/${projectId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(del.status).toBe(204);

    const get = await request(app.getHttpServer())
      .get(`/api/expatriation-project/${projectId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(get.status).toBe(404);
  });
});
