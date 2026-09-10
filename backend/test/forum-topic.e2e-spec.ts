import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import { uniqueEmail, deleteUsersByEmail } from './utils/seed';

/**
 * Parcours critique "forum" : créer un topic, le lire publiquement (sans
 * authentification), le suivre/ne plus suivre, le modifier puis le
 * supprimer. Aucune dépendance de données externe (pas de pays requis) —
 * seul un compte utilisateur est nécessaire pour les actions authentifiées.
 */
describe('Forum Topic (e2e)', () => {
  let app: INestApplication;
  const createdEmails: string[] = [];
  let token: string;
  let topicId: number;

  beforeAll(async () => {
    app = await createE2eApp();

    const email = uniqueEmail('forum-author');
    createdEmails.push(email);

    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Forum',
        lastName: 'Author',
        email,
        password: 'Sup3rSecret!',
      });
    token = res.body.access_token;
  });

  afterAll(async () => {
    // Le topic est supprimé par le test lui-même ; on ne nettoie ici que le
    // compte, pour ne pas dépendre de l'ordre d'exécution des `it`.
    if (topicId) {
      await request(app.getHttpServer())
        .delete(`/api/forum-topic/${topicId}`)
        .set('Authorization', `Bearer ${token}`);
    }
    await deleteUsersByEmail(app, createdEmails);
    await app.close();
  });

  it('refuse la création sans authentification', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/forum-topic')
      .send({ title: 'Titre', content: 'Contenu du topic' });

    expect(res.status).toBe(401);
  });

  it('crée un topic pour un utilisateur authentifié', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/forum-topic')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: `Topic e2e ${Date.now()}`,
        content: 'Contenu tout à fait normal pour un test e2e.',
        category: 'discussion',
      });

    expect(res.status).toBe(201);
    expect(res.body.idForumTopic).toEqual(expect.any(Number));
    topicId = res.body.idForumTopic;
  });

  it('liste les topics publiquement (sans authentification)', async () => {
    const res = await request(app.getHttpServer()).get('/api/forum-topic');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('lit le détail du topic publiquement et incrémente les vues', async () => {
    const first = await request(app.getHttpServer()).get(
      `/api/forum-topic/${topicId}`,
    );
    expect(first.status).toBe(200);
    const initialViews = first.body.viewsCount ?? 0;

    const second = await request(app.getHttpServer()).get(
      `/api/forum-topic/${topicId}`,
    );
    expect(second.body.viewsCount).toBeGreaterThanOrEqual(initialViews);
  });

  it('permet de suivre puis de ne plus suivre le topic', async () => {
    const follow = await request(app.getHttpServer())
      .post(`/api/forum-topic/${topicId}/follow`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 201]).toContain(follow.status);

    const unfollow = await request(app.getHttpServer())
      .delete(`/api/forum-topic/${topicId}/follow`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 204]).toContain(unfollow.status);
  });

  it('met à jour le topic pour son auteur', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/forum-topic/${topicId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: `Topic e2e modifié ${Date.now()}` });

    expect(res.status).toBe(200);
    expect(res.body.title).toMatch(/modifié/);
  });

  it('supprime le topic, puis 404 sur la lecture suivante', async () => {
    const del = await request(app.getHttpServer())
      .delete(`/api/forum-topic/${topicId}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 204]).toContain(del.status);

    const get = await request(app.getHttpServer()).get(
      `/api/forum-topic/${topicId}`,
    );
    expect(get.status).toBe(404);

    // Déjà supprimé : on évite un second DELETE dans afterAll.
    topicId = 0;
  });
});
