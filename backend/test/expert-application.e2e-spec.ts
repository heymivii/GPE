import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import { uniqueEmail, promoteToRole, deleteUsersByEmail } from './utils/seed';

// Signature %PDF suffit à passer la vérification magic-bytes du service —
// pas besoin d'un PDF structurellement valide pour ce test.
const FAKE_PDF = Buffer.from('%PDF-1.4\n%%EOF');

/**
 * Parcours "candidature expert vérifié" : dépôt d'un justificatif (upload
 * multipart, vérifié par ses octets réels et non son mimetype déclaré),
 * unicité de la candidature en attente, revue admin (accepter → l'utilisateur
 * devient expert vérifié) et téléchargement du justificatif par un modérateur.
 */
describe('Expert Application (e2e)', () => {
  let app: INestApplication;
  const createdEmails: string[] = [];
  let applicantToken: string;
  let applicantId: number;
  let adminToken: string;
  let applicationId: number;

  beforeAll(async () => {
    app = await createE2eApp();

    const applicantEmail = uniqueEmail('expertapp-applicant');
    const adminEmail = uniqueEmail('expertapp-admin');
    createdEmails.push(applicantEmail, adminEmail);

    const applicant = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Applicant',
        lastName: 'User',
        email: applicantEmail,
        password: 'Sup3rSecret!',
      });
    applicantToken = applicant.body.access_token;
    applicantId = applicant.body.user.idUser;

    const admin = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'ExpertApp',
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
    // `expert_application.user_id` est en CASCADE : supprimer les comptes suffit.
    await deleteUsersByEmail(app, createdEmails);
    await app.close();
  });

  it('refuse le dépôt sans justificatif', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/expert-applications')
      .set('Authorization', `Bearer ${applicantToken}`)
      .field('expertTitle', 'Consultant immigration')
      .field(
        'motivation',
        'Dix ans d’expérience à accompagner des expatriés dans leurs démarches administratives.',
      );

    expect(res.status).toBe(400);
  });

  it('dépose une candidature avec justificatif', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/expert-applications')
      .set('Authorization', `Bearer ${applicantToken}`)
      .field('expertTitle', 'Consultant immigration')
      .field(
        'motivation',
        'Dix ans d’expérience à accompagner des expatriés dans leurs démarches administratives.',
      )
      .attach('diploma', FAKE_PDF, {
        filename: 'diplome.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    applicationId = res.body.idExpertApplication;
  });

  it('refuse une seconde candidature tant que la première est en attente', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/expert-applications')
      .set('Authorization', `Bearer ${applicantToken}`)
      .field('expertTitle', 'Consultant immigration')
      .field(
        'motivation',
        'Dix ans d’expérience à accompagner des expatriés dans leurs démarches administratives.',
      )
      .attach('diploma', FAKE_PDF, {
        filename: 'diplome2.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(409);
  });

  it('voit sa candidature dans son historique', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/expert-applications/mine')
      .set('Authorization', `Bearer ${applicantToken}`);

    expect(res.status).toBe(200);
    expect(
      res.body.some(
        (a: { idExpertApplication: number }) =>
          a.idExpertApplication === applicationId,
      ),
    ).toBe(true);
  });

  it('refuse la liste des candidatures à un non-admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/expert-applications')
      .set('Authorization', `Bearer ${applicantToken}`);
    expect(res.status).toBe(403);
  });

  it('un admin voit la candidature en attente et le compteur associé', async () => {
    const list = await request(app.getHttpServer())
      .get('/api/expert-applications?status=pending')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(list.status).toBe(200);
    expect(
      list.body.some(
        (a: { idExpertApplication: number }) =>
          a.idExpertApplication === applicationId,
      ),
    ).toBe(true);

    const count = await request(app.getHttpServer())
      .get('/api/expert-applications/pending-count')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(count.status).toBe(200);
    expect(count.body.count).toBeGreaterThanOrEqual(1);
  });

  it('un admin télécharge le justificatif', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/expert-applications/${applicationId}/diploma`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
  });

  it('un admin accepte la candidature — le candidat devient expert vérifié', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/expert-applications/${applicationId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');

    const experts = await request(app.getHttpServer()).get(
      `/api/users/experts?q=${encodeURIComponent('Applicant')}`,
    );
    expect(experts.status).toBe(200);
    expect(
      experts.body.some((u: { idUser: number }) => u.idUser === applicantId),
    ).toBe(true);
  });

  it('refuse de re-traiter une candidature déjà décidée', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/expert-applications/${applicationId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'rejected' });

    expect(res.status).toBe(409);
  });
});
