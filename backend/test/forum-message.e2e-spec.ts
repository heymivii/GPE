import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import {
  uniqueEmail,
  promoteToRole,
  deleteForumReportsForUsers,
  deleteForumMessagesForTopic,
  deleteUsersByEmail,
} from './utils/seed';

/**
 * Parcours critique "message de forum + signalement + modération" : poster
 * une réponse dans un topic, la noter, la signaler, puis la traiter côté
 * modération (résoudre le signalement, retirer le message). Complète
 * forum-topic.e2e-spec.ts, qui s'arrête à la création du topic lui-même.
 */
describe('Forum Message & Moderation (e2e)', () => {
  let app: INestApplication;
  const createdEmails: string[] = [];

  let authorToken: string;
  let authorId: number;
  let reporterToken: string;
  let reporterId: number;
  let moderatorToken: string;
  let moderatorId: number;
  let topicId: number;
  let messageId: number;
  let reportId: number;

  beforeAll(async () => {
    app = await createE2eApp();

    const authorEmail = uniqueEmail('fm-author');
    const reporterEmail = uniqueEmail('fm-reporter');
    const moderatorEmail = uniqueEmail('fm-moderator');
    createdEmails.push(authorEmail, reporterEmail, moderatorEmail);

    const author = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Author',
        lastName: 'User',
        email: authorEmail,
        password: 'Sup3rSecret!',
      });
    authorToken = author.body.access_token;
    authorId = author.body.user.idUser;

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
    // Le rôle est figé dans le JWT à l'émission : il faut se reconnecter pour
    // obtenir un jeton portant le rôle 'moderator' fraîchement attribué.
    const relogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: moderatorEmail, password: 'Sup3rSecret!' });
    moderatorToken = relogin.body.access_token;

    const topic = await request(app.getHttpServer())
      .post('/api/forum-topic')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({
        title: `Topic fm e2e ${Date.now()}`,
        content: 'Sujet de test pour les messages e2e.',
        category: 'discussion',
      });
    topicId = topic.body.idForumTopic;
  });

  afterAll(async () => {
    await deleteForumReportsForUsers(app, [authorId, reporterId, moderatorId]);
    await deleteForumMessagesForTopic(app, topicId);
    await request(app.getHttpServer())
      .delete(`/api/forum-topic/${topicId}`)
      .set('Authorization', `Bearer ${authorToken}`);
    await deleteUsersByEmail(app, createdEmails);
    await app.close();
  });

  it('refuse la création sans authentification', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/forum-message')
      .send({ topicId, content: 'Message anonyme' });

    expect(res.status).toBe(401);
  });

  it('poste une réponse dans le topic', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/forum-message')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ topicId, content: 'Merci pour ce partage, très utile !' });

    expect(res.status).toBe(201);
    expect(res.body.idForumMessage).toEqual(expect.any(Number));
    messageId = res.body.idForumMessage;
  });

  it('liste les messages du topic', async () => {
    const res = await request(app.getHttpServer()).get(
      `/api/forum-message?topicId=${topicId}`,
    );

    expect(res.status).toBe(200);
    expect(
      res.body.some(
        (m: { idForumMessage: number }) => m.idForumMessage === messageId,
      ),
    ).toBe(true);
  });

  it("refuse qu'un tiers modifie le message d'autrui (403)", async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/forum-message/${messageId}`)
      .set('Authorization', `Bearer ${reporterToken}`)
      .send({ content: 'Modification usurpée' });

    expect(res.status).toBe(403);
  });

  it('permet à un tiers de noter le message (pas son auteur)', async () => {
    const rate = await request(app.getHttpServer())
      .post(`/api/forum-message/${messageId}/rate`)
      .set('Authorization', `Bearer ${reporterToken}`)
      .send({ stars: 5, comment: 'Réponse très claire' });

    expect(rate.status).toBe(201);

    const mine = await request(app.getHttpServer())
      .get(`/api/forum-message/ratings/mine?topicId=${topicId}`)
      .set('Authorization', `Bearer ${reporterToken}`);
    expect(mine.status).toBe(200);
  });

  it('refuse que l’auteur note son propre message (400)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/forum-message/${messageId}/rate`)
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ stars: 3 });

    expect(res.status).toBe(400);
  });

  it('signale le message', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/forum-message/report')
      .set('Authorization', `Bearer ${reporterToken}`)
      .send({ messageId, reason: 'spam', details: 'Contenu douteux' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    reportId = res.body.idReport;
  });

  it('refuse un second signalement du même contenu par la même personne', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/forum-message/report')
      .set('Authorization', `Bearer ${reporterToken}`)
      .send({ messageId, reason: 'spam' });

    expect(res.status).toBe(400);
  });

  it('refuse la liste des signalements à un non-modérateur (403)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/forum-message/reports/all')
      .set('Authorization', `Bearer ${authorToken}`);

    expect(res.status).toBe(403);
  });

  it('le modérateur voit le signalement en attente', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/forum-message/reports/all?status=pending')
      .set('Authorization', `Bearer ${moderatorToken}`);

    expect(res.status).toBe(200);
    expect(
      res.body.some((r: { idReport: number }) => r.idReport === reportId),
    ).toBe(true);
  });

  it('le modérateur résout le signalement', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/forum-message/reports/${reportId}/resolve`)
      .set('Authorization', `Bearer ${moderatorToken}`)
      .send({ action: 'resolved', moderatorNote: 'Vérifié, RAS' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('resolved');
  });

  it('refuse la suppression modérée à un non-modérateur (403)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/forum-message/moderate/${messageId}`)
      .set('Authorization', `Bearer ${reporterToken}`);

    expect(res.status).toBe(403);
  });

  it('le modérateur retire le message, puis 404 sur une lecture suivante', async () => {
    const del = await request(app.getHttpServer())
      .delete(`/api/forum-message/moderate/${messageId}`)
      .set('Authorization', `Bearer ${moderatorToken}`);
    expect([200, 204]).toContain(del.status);

    const get = await request(app.getHttpServer()).get(
      `/api/forum-message/${messageId}`,
    );
    expect(get.status).toBe(404);
  });
});
