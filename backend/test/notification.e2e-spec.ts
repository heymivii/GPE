import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import { uniqueEmail, deleteUsersByEmail } from './utils/seed';

/**
 * Parcours "notifications" : création, lecture, marquage lu (unitaire et
 * global), suppression — et l'étanchéité entre comptes (on ne voit ni ne
 * modifie jamais la notification d'un autre utilisateur).
 */
describe('Notification (e2e)', () => {
  let app: INestApplication;
  const createdEmails: string[] = [];
  let token: string;
  let userId: number;
  let otherToken: string;
  let notificationId: number;

  beforeAll(async () => {
    app = await createE2eApp();

    const email = uniqueEmail('notif-owner');
    const otherEmail = uniqueEmail('notif-other');
    createdEmails.push(email, otherEmail);

    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Notif',
        lastName: 'Owner',
        email,
        password: 'Sup3rSecret!',
      });
    token = res.body.access_token;
    userId = res.body.user.idUser;

    const other = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Notif',
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

  it('refuse la création sans authentification', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/notification')
      .send({ message: 'Anonyme', userId });

    expect(res.status).toBe(401);
  });

  it('crée une notification pour soi-même (le destinataire du body est ignoré)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/notification')
      .set('Authorization', `Bearer ${token}`)
      // userId volontairement différent de soi-même : le contrôleur doit
      // l'ignorer et forcer le destinataire à l'utilisateur authentifié.
      .send({
        message: 'Bienvenue !',
        userId: 999999,
        notificationType: 'info',
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Bienvenue !');
    notificationId = res.body.idNotification;
  });

  it('liste mes notifications', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/notification')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(
      res.body.some(
        (n: { idNotification: number }) => n.idNotification === notificationId,
      ),
    ).toBe(true);
  });

  it("refuse à un tiers l'accès à ma notification", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/notification/${notificationId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });

  it('marque la notification comme lue', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/notification/${notificationId}/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.isRead).toBe(true);
  });

  it('marque toutes mes notifications comme lues', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/notification/read-all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('supprime la notification, puis 404 sur une lecture suivante', async () => {
    const del = await request(app.getHttpServer())
      .delete(`/api/notification/${notificationId}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 204]).toContain(del.status);

    const get = await request(app.getHttpServer())
      .get(`/api/notification/${notificationId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(get.status).toBe(404);
  });
});
