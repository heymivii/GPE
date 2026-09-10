import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import { uniqueEmail, deleteUsersByEmail } from './utils/seed';

// Signature %PDF suffit à passer la vérification magic-bytes du service.
const FAKE_PDF = Buffer.from('%PDF-1.4\n%%EOF');

/**
 * Parcours "coffre de documents personnel" — l'API backend reste
 * pleinement fonctionnelle même si la route frontend correspondante est
 * actuellement désactivée (voir routes/index.tsx, bloc "DOCUMENTS
 * DÉSACTIVÉS"). Upload vérifié par ses octets réels, coffre strictement
 * privé (jamais accessible à un tiers, ni en téléchargement ni en suppression).
 */
describe('Document (e2e)', () => {
  let app: INestApplication;
  const createdEmails: string[] = [];
  let ownerToken: string;
  let otherToken: string;
  let documentId: number;

  beforeAll(async () => {
    app = await createE2eApp();

    const ownerEmail = uniqueEmail('doc-owner');
    const otherEmail = uniqueEmail('doc-other');
    createdEmails.push(ownerEmail, otherEmail);

    const owner = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Doc',
        lastName: 'Owner',
        email: ownerEmail,
        password: 'Sup3rSecret!',
      });
    ownerToken = owner.body.access_token;

    const other = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Doc',
        lastName: 'Other',
        email: otherEmail,
        password: 'Sup3rSecret!',
      });
    otherToken = other.body.access_token;
  });

  afterAll(async () => {
    await deleteUsersByEmail(app, createdEmails);
    await app.close();
  });

  it('refuse le dépôt sans authentification', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/documents')
      .attach('file', FAKE_PDF, {
        filename: 'passeport.pdf',
        contentType: 'application/pdf',
      });
    expect(res.status).toBe(401);
  });

  it('dépose un document dans son coffre personnel', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/documents')
      .set('Authorization', `Bearer ${ownerToken}`)
      .field('docType', 'passeport')
      .attach('file', FAKE_PDF, {
        filename: 'passeport.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(201);
    documentId = res.body.idDocument;
    expect(documentId).toEqual(expect.any(Number));
  });

  it('liste mon coffre personnel', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/documents')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(
      res.body.some((d: { idDocument: number }) => d.idDocument === documentId),
    ).toBe(true);
  });

  it('télécharge son propre document', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/documents/${documentId}/download`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
  });

  it("refuse à un tiers l'accès en téléchargement", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/documents/${documentId}/download`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  it('refuse à un tiers de supprimer le document', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  it('je peux supprimer mon propre document, puis 404 sur un accès suivant', async () => {
    const del = await request(app.getHttpServer())
      .delete(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect([200, 204]).toContain(del.status);

    const get = await request(app.getHttpServer())
      .get(`/api/documents/${documentId}/download`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(get.status).toBe(404);
  });
});
