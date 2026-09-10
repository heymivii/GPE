import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import {
  uniqueEmail,
  seedCountry,
  seedAdminProcedure,
  cleanupCountry,
  cleanupAdminProcedure,
  deleteUsersByEmail,
} from './utils/seed';

/**
 * Parcours critique "checklist / suivi de démarche" : le cœur métier de
 * SkyWalk — un utilisateur rattache une démarche administrative à son projet
 * d'expatriation, la fait progresser, puis la retire. Nécessite un pays, une
 * démarche admin (`admin_procedure`) et un projet réels (contraintes FK).
 */
describe('Procedure Tracking (e2e)', () => {
  let app: INestApplication;
  let seeded: Awaited<ReturnType<typeof seedCountry>>;
  let procedure: Awaited<ReturnType<typeof seedAdminProcedure>>;
  const createdEmails: string[] = [];

  let ownerToken: string;
  let otherToken: string;
  let projectId: number;
  let trackingId: number;

  beforeAll(async () => {
    app = await createE2eApp();
    seeded = await seedCountry(app);
    procedure = await seedAdminProcedure(app, seeded.country.idCountry);

    const ownerEmail = uniqueEmail('tracking-owner');
    const otherEmail = uniqueEmail('tracking-other');
    createdEmails.push(ownerEmail, otherEmail);

    const owner = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Owner',
        lastName: 'Tracker',
        email: ownerEmail,
        password: 'Sup3rSecret!',
      });
    ownerToken = owner.body.access_token;

    const other = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Other',
        lastName: 'Tracker',
        email: otherEmail,
        password: 'Sup3rSecret!',
      });
    otherToken = other.body.access_token;

    const project = await request(app.getHttpServer())
      .post('/api/expatriation-project')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ destinationCountryId: seeded.country.idCountry });
    projectId = project.body.idProject;
  });

  afterAll(async () => {
    // Le projet supprime déjà ses `procedure_tracking` en cascade
    // (ExpatriationProjectService.remove, transaction dédiée) — inutile de
    // supprimer le suivi séparément avant de retirer le projet.
    await request(app.getHttpServer())
      .delete(`/api/expatriation-project/${projectId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    await deleteUsersByEmail(app, createdEmails);
    await cleanupAdminProcedure(app, procedure);
    await cleanupCountry(app, seeded);
    await app.close();
  });

  it('refuse la création sans authentification', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/procedure-tracking')
      .send({
        adminProcedureId: procedure.idAdminProcedure,
        expatProjectId: projectId,
      });

    expect(res.status).toBe(401);
  });

  it('rattache une démarche au projet (statut par défaut "not_started")', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/procedure-tracking')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        adminProcedureId: procedure.idAdminProcedure,
        expatProjectId: projectId,
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('not_started');
    trackingId = res.body.idProcedureTracking;
  });

  it("refuse l'accès au suivi à un autre utilisateur (403)", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/procedure-tracking/${trackingId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });

  it('coche des sous-étapes (completedFacts)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/procedure-tracking/${trackingId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ completedFacts: [0, 2] });

    expect(res.status).toBe(200);
    expect(res.body.completedFacts).toEqual([0, 2]);
  });

  it('passe la démarche à "completed" et renseigne end_date', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/procedure-tracking/${trackingId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.end_date).toBeTruthy();
  });

  it('retire la démarche, puis 404 sur un GET suivant', async () => {
    const del = await request(app.getHttpServer())
      .delete(`/api/procedure-tracking/${trackingId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(del.status).toBe(200);

    const get = await request(app.getHttpServer())
      .get(`/api/procedure-tracking/${trackingId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(get.status).toBe(404);
  });
});
