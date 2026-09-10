import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import { uniqueEmail, deleteUsersByEmail } from './utils/seed';

/**
 * Parcours critique "messagerie privée" : suite naturelle de la mise en
 * relation buddy (buddy-contact.e2e-spec.ts) — une fois deux personnes en
 * contact, elles échangent par ce canal. `onDelete: 'CASCADE'` sur
 * `PrivateMessage.sender/recipient` évite tout nettoyage manuel des messages.
 */
describe('Private Message (e2e)', () => {
  let app: INestApplication;
  const createdEmails: string[] = [];

  let aToken: string;
  let aId: number;
  let bToken: string;
  let bId: number;

  beforeAll(async () => {
    app = await createE2eApp();

    const aEmail = uniqueEmail('pm-a');
    const bEmail = uniqueEmail('pm-b');
    createdEmails.push(aEmail, bEmail);

    const a = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Alice',
        lastName: 'Sender',
        email: aEmail,
        password: 'Sup3rSecret!',
      });
    aToken = a.body.access_token;
    aId = a.body.user.idUser;

    const b = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Bob',
        lastName: 'Recipient',
        email: bEmail,
        password: 'Sup3rSecret!',
      });
    bToken = b.body.access_token;
    bId = b.body.user.idUser;
  });

  afterAll(async () => {
    await deleteUsersByEmail(app, createdEmails);
    await app.close();
  });

  it('refuse de s’écrire à soi-même (400)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/private-message')
      .set('Authorization', `Bearer ${aToken}`)
      .send({ recipientId: aId, content: 'Coucou moi-même' });

    expect(res.status).toBe(400);
  });

  it('refuse l’envoi sans authentification', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/private-message')
      .send({ recipientId: bId, content: 'Salut' });

    expect(res.status).toBe(401);
  });

  it('envoie un message de A vers B', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/private-message')
      .set('Authorization', `Bearer ${aToken}`)
      .send({ recipientId: bId, content: 'On se motive sur le visa ?' });

    expect(res.status).toBe(201);
    expect(res.body.senderId).toBe(aId);
    expect(res.body.recipientId).toBe(bId);
  });

  it('apparaît dans les conversations de A avec B comme interlocuteur', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/private-message/conversations')
      .set('Authorization', `Bearer ${aToken}`);

    expect(res.status).toBe(200);
    const withB = res.body.find((c: { userId: number }) => c.userId === bId);
    expect(withB).toBeDefined();
    expect(withB.lastMessage).toBe('On se motive sur le visa ?');
  });

  it('incrémente le compteur de non-lus de B', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/private-message/unread-count')
      .set('Authorization', `Bearer ${bToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  it('B lit le fil avec A : le message est marqué comme lu', async () => {
    const thread = await request(app.getHttpServer())
      .get(`/api/private-message/with/${aId}`)
      .set('Authorization', `Bearer ${bToken}`);

    expect(thread.status).toBe(200);
    expect(thread.body).toHaveLength(1);
    expect(thread.body[0].content).toBe('On se motive sur le visa ?');
    expect(thread.body[0].mine).toBe(false);

    const unread = await request(app.getHttpServer())
      .get('/api/private-message/unread-count')
      .set('Authorization', `Bearer ${bToken}`);
    expect(unread.body.count).toBe(0);
  });

  it("refuse qu'un tiers (l'expéditeur) marque son propre message comme lu", async () => {
    const list = await request(app.getHttpServer())
      .get(`/api/private-message/with/${bId}`)
      .set('Authorization', `Bearer ${aToken}`);
    const messageId = list.body[0].idPrivateMessage;

    const res = await request(app.getHttpServer())
      .patch(`/api/private-message/${messageId}/read`)
      .set('Authorization', `Bearer ${aToken}`);

    expect(res.status).toBe(403);
  });
});
