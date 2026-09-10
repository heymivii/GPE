import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './utils/test-app';
import {
  uniqueEmail,
  seedCountry,
  cleanupCountry,
  deleteUsersByEmail,
} from './utils/seed';

/**
 * Parcours "retour d'expérience" : un utilisateur authentifié partage son
 * vécu sur un pays. Contrairement à `forum-message` (qui vérifie
 * `message.user.idUser !== userId` avant modification/suppression),
 * `ExperienceService.update`/`remove` ne vérifient AUCUNE propriété —
 * ce test le met en évidence sans corriger le code (hors périmètre).
 */
describe('Experience (e2e)', () => {
  let app: INestApplication;
  let seeded: Awaited<ReturnType<typeof seedCountry>>;
  const createdEmails: string[] = [];

  let authorToken: string;
  let otherToken: string;
  let experienceId: number;

  beforeAll(async () => {
    app = await createE2eApp();
    seeded = await seedCountry(app);

    const authorEmail = uniqueEmail('exp-author');
    const otherEmail = uniqueEmail('exp-other');
    createdEmails.push(authorEmail, otherEmail);

    const author = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Exp',
        lastName: 'Author',
        email: authorEmail,
        password: 'Sup3rSecret!',
      });
    authorToken = author.body.access_token;

    const other = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Exp',
        lastName: 'Other',
        email: otherEmail,
        password: 'Sup3rSecret!',
      });
    otherToken = other.body.access_token;
  });

  afterAll(async () => {
    await deleteUsersByEmail(app, createdEmails);
    await cleanupCountry(app, seeded);
    await app.close();
  });

  it('refuse la création sans authentification', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/experience')
      .send({
        title: 'Mon année à Berlin',
        description: 'Anonyme',
        countryId: seeded.country.idCountry,
      });
    expect(res.status).toBe(401);
  });

  it('partage un retour d’expérience', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/experience')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({
        title: 'Mon année à Berlin',
        description: 'Une expérience formidable',
        rating: 5,
        countryId: seeded.country.idCountry,
      });

    expect(res.status).toBe(201);
    experienceId = res.body.idExperience;
    expect(experienceId).toEqual(expect.any(Number));
  });

  it('lit le retour d’expérience publiquement', async () => {
    const list = await request(app.getHttpServer()).get('/api/experience');
    expect(list.status).toBe(200);
    expect(
      list.body.some(
        (e: { idExperience: number }) => e.idExperience === experienceId,
      ),
    ).toBe(true);

    const one = await request(app.getHttpServer()).get(
      `/api/experience/${experienceId}`,
    );
    expect(one.status).toBe(200);
    expect(one.body.title).toBe('Mon année à Berlin');
  });

  // Bug découvert ici — pas corrigé (hors périmètre : tests uniquement, code
  // inchangé). `ExperienceController` ne garde que `@UseGuards(JwtAuthGuard)`
  // sur update/remove, sans jamais comparer `req.user.userId` à l'auteur —
  // n'importe quel compte authentifié peut donc modifier ou supprimer le
  // retour d'expérience de n'importe qui d'autre (IDOR). Ce test fige ce
  // comportement pour qu'il saute au jour où la vérification sera ajoutée.
  it("un tiers authentifié PEUT modifier le témoignage d'autrui (IDOR — bug connu)", async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/experience/${experienceId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Modifié par un tiers' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Modifié par un tiers');
  });

  it("un tiers authentifié PEUT aussi supprimer le témoignage d'autrui (IDOR — bug connu)", async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/experience/${experienceId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect([200, 204]).toContain(res.status);

    const get = await request(app.getHttpServer()).get(
      `/api/experience/${experienceId}`,
    );
    expect(get.status).toBe(404);
  });
});
