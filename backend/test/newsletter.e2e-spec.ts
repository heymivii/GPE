import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createE2eApp } from './utils/test-app';
import { NewsletterSubscriber } from '../src/features/newsletter/entities/newsletter-subscriber.entity';

/**
 * Parcours "inscription newsletter" : public, sans authentification.
 * Comportement anti-fuite d'information volontaire — une adresse déjà
 * abonnée renvoie un succès générique plutôt qu'une erreur (on ne révèle pas
 * qui est déjà inscrit).
 */
describe('Newsletter (e2e)', () => {
  let app: INestApplication;
  const email = `e2e-newsletter-${Date.now()}@e2e.skywalk.test`;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    const repo: Repository<NewsletterSubscriber> = app.get(
      getRepositoryToken(NewsletterSubscriber),
    );
    await repo.delete({ email });
    await app.close();
  });

  it('rejette une adresse email invalide', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/newsletter/subscribe')
      .send({ email: 'pas-un-email' });
    expect(res.status).toBe(400);
  });

  it('inscrit une adresse valide', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/newsletter/subscribe')
      .send({ email, source: 'e2e-test' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('une seconde inscription de la même adresse reste un succès générique', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/newsletter/subscribe')
      .send({ email });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
