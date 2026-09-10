import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import {
  uniqueEmail,
  seedCountry,
  seedAdminProcedure,
  cleanupCountry,
  cleanupAdminProcedure,
  deleteBuddyRequestsForProcedure,
  deleteNotificationsForUsers,
  deleteUsersByEmail,
} from './utils/seed';

/**
 * Parcours critique "mise en relation buddy" : un utilisateur sollicite un
 * contact au sujet d'une démarche administrative, le destinataire l'accepte,
 * puis toute nouvelle demande entre les deux passe par la messagerie (déjà en
 * relation). Nécessite un pays + une démarche admin réels (contraintes FK).
 */
describe('Buddy Contact (e2e)', () => {
  let app: INestApplication;
  let seeded: Awaited<ReturnType<typeof seedCountry>>;
  let procedure: Awaited<ReturnType<typeof seedAdminProcedure>>;
  const createdEmails: string[] = [];

  let senderToken: string;
  let senderId: number;
  let recipientToken: string;
  let recipientId: number;
  let requestId: number;

  beforeAll(async () => {
    app = await createE2eApp();
    seeded = await seedCountry(app);
    procedure = await seedAdminProcedure(app, seeded.country.idCountry);

    const senderEmail = uniqueEmail('buddy-sender');
    const recipientEmail = uniqueEmail('buddy-recipient');
    createdEmails.push(senderEmail, recipientEmail);

    const sender = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Sender',
        lastName: 'User',
        email: senderEmail,
        password: 'Sup3rSecret!',
      });
    senderToken = sender.body.access_token;
    senderId = sender.body.user.idUser;

    const recipient = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Recipient',
        lastName: 'User',
        email: recipientEmail,
        password: 'Sup3rSecret!',
      });
    recipientToken = recipient.body.access_token;
    recipientId = recipient.body.user.idUser;
  });

  afterAll(async () => {
    await deleteBuddyRequestsForProcedure(app, procedure.idAdminProcedure);
    await deleteNotificationsForUsers(app, [senderId, recipientId]);
    await deleteUsersByEmail(app, createdEmails);
    await cleanupAdminProcedure(app, procedure);
    await cleanupCountry(app, seeded);
    await app.close();
  });

  it('refuse de se contacter soi-même (400)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/buddy-contact/request')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({ recipientId: senderId, procedureId: procedure.idAdminProcedure });

    expect(res.status).toBe(400);
  });

  it('envoie une demande de contact', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/buddy-contact/request')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        recipientId,
        procedureId: procedure.idAdminProcedure,
        message: 'On se motive ensemble sur cette démarche ?',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    requestId = res.body.id;
  });

  it('refuse une seconde demande en attente pour la même démarche', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/buddy-contact/request')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({ recipientId, procedureId: procedure.idAdminProcedure });

    expect(res.status).toBe(400);
  });

  it('le destinataire voit la demande dans ses requêtes', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/buddy-contact/requests')
      .set('Authorization', `Bearer ${recipientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.some((r: { id: number }) => r.id === requestId)).toBe(true);
  });

  it("refuse qu'un tiers (l'expéditeur) réponde à la place du destinataire", async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/buddy-contact/request/${requestId}`)
      .set('Authorization', `Bearer ${senderToken}`)
      .send({ accept: true });

    expect(res.status).toBe(403);
  });

  it('le destinataire accepte la demande', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/buddy-contact/request/${requestId}`)
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({ accept: true });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('accepted');
  });

  it('une fois acceptée, toute nouvelle demande est bloquée (déjà en relation)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/buddy-contact/request')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({ recipientId, procedureId: procedure.idAdminProcedure });

    expect(res.status).toBe(400);
  });
});
