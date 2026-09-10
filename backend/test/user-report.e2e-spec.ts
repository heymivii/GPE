import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import {
  uniqueEmail,
  promoteToRole,
  deleteUserReportsForUsers,
  deleteUsersByEmail,
} from './utils/seed';

/**
 * Parcours "signalement de membre" : un utilisateur signale un autre compte
 * (harcèlement, spam...), un modérateur traite le signalement. Distinct du
 * signalement de contenu (forum-message.e2e-spec.ts) — ici la cible est un
 * profil, pas un message.
 */
describe('User Report (e2e)', () => {
  let app: INestApplication;
  const createdEmails: string[] = [];

  let reporterToken: string;
  let reporterId: number;
  let reportedId: number;
  let moderatorToken: string;
  let moderatorId: number;
  let reportId: number;

  beforeAll(async () => {
    app = await createE2eApp();

    const reporterEmail = uniqueEmail('ureport-reporter');
    const reportedEmail = uniqueEmail('ureport-reported');
    const moderatorEmail = uniqueEmail('ureport-moderator');
    createdEmails.push(reporterEmail, reportedEmail, moderatorEmail);

    const reporter = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Reporter',
        lastName: 'User',
        email: reporterEmail,
        password: 'Sup3rSecret!',
      });
    reporterToken = reporter.body.access_token;
    reporterId = reporter.body.user.idUser;

    const reported = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Reported',
        lastName: 'User',
        email: reportedEmail,
        password: 'Sup3rSecret!',
      });
    reportedId = reported.body.user.idUser;

    const moderator = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Mod',
        lastName: 'User',
        email: moderatorEmail,
        password: 'Sup3rSecret!',
      });
    moderatorId = moderator.body.user.idUser;
    await promoteToRole(app, moderatorId, 'moderator');
    const relogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: moderatorEmail, password: 'Sup3rSecret!' });
    moderatorToken = relogin.body.access_token;
  });

  afterAll(async () => {
    await deleteUserReportsForUsers(app, [reporterId, reportedId, moderatorId]);
    await deleteUsersByEmail(app, createdEmails);
    await app.close();
  });

  it('refuse de se signaler soi-même (400)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user-report')
      .set('Authorization', `Bearer ${reporterToken}`)
      .send({ reportedUserId: reporterId, reason: 'spam' });

    expect(res.status).toBe(400);
  });

  it('signale un membre', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user-report')
      .set('Authorization', `Bearer ${reporterToken}`)
      .send({
        reportedUserId: reportedId,
        reason: 'harassment',
        details: 'Messages insistants',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    reportId = res.body.idUserReport;
  });

  it('refuse un second signalement en attente sur le même membre', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user-report')
      .set('Authorization', `Bearer ${reporterToken}`)
      .send({ reportedUserId: reportedId, reason: 'spam' });

    expect(res.status).toBe(400);
  });

  it('refuse la liste des signalements à un non-modérateur (403)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/user-report')
      .set('Authorization', `Bearer ${reporterToken}`);

    expect(res.status).toBe(403);
  });

  it('le modérateur voit le signalement et les statistiques', async () => {
    const list = await request(app.getHttpServer())
      .get('/api/user-report?status=pending')
      .set('Authorization', `Bearer ${moderatorToken}`);
    expect(list.status).toBe(200);
    expect(
      list.body.some(
        (r: { idUserReport: number }) => r.idUserReport === reportId,
      ),
    ).toBe(true);

    const stats = await request(app.getHttpServer())
      .get('/api/user-report/stats')
      .set('Authorization', `Bearer ${moderatorToken}`);
    expect(stats.status).toBe(200);
  });

  it('le modérateur résout le signalement', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/user-report/${reportId}/resolve`)
      .set('Authorization', `Bearer ${moderatorToken}`)
      .send({ action: 'resolved', moderatorNote: 'Avertissement envoyé' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('resolved');
  });
});
