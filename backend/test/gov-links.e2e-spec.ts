import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import { uniqueEmail, deleteUsersByEmail } from './utils/seed';

/**
 * Moteur gov-links (recherche + classement LLM + génération de checklist) :
 * ne couvre QUE les routes sans appel externe — liste des pays supportés,
 * liste des liens en base, et la garde d'accès sur l'approbation. Jamais
 * `/health` (ping réel du LLM/moteur de recherche), `/approve`/`/reject`
 * (déclenchent `generateFromGovLinks`, sujette au flag `GENERATION_ENABLED`
 * et à un appel LLM) ni la génération elle-même — hors périmètre d'un test
 * d'intégration reproductible et déterministe.
 */
describe('Gov Links (e2e) — routes sans dépendance externe', () => {
  let app: INestApplication;
  const createdEmails: string[] = [];
  let userToken: string;

  beforeAll(async () => {
    app = await createE2eApp();

    const userEmail = uniqueEmail('govlinks-user');
    createdEmails.push(userEmail);

    const user = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'GovLinks',
        lastName: 'User',
        email: userEmail,
        password: 'Sup3rSecret!',
      });
    userToken = user.body.access_token;
  });

  afterAll(async () => {
    await deleteUsersByEmail(app, createdEmails);
    await app.close();
  });

  it('refuse la liste des pays supportés sans authentification', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/gov-links/supported-countries',
    );
    expect(res.status).toBe(401);
  });

  it('un utilisateur authentifié consulte les pays supportés', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/gov-links/supported-countries')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('un utilisateur authentifié liste les liens (vide en base fraîche)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/gov-links')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("refuse l'approbation d'un lien à un non-admin", async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/gov-links/1/approve')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it("refuse l'accès au health-check du moteur à un non-admin", async () => {
    const res = await request(app.getHttpServer())
      .get('/api/gov-links/health')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});
