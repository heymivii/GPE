import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Continent } from '../../src/features/continent/entities/continent.entity';
import { Country } from '../../src/features/country/entities/country.entity';
import { AdminProcedure } from '../../src/features/admin-procedure/entities/admin-procedure.entity';
import { User } from '../../src/features/user/entities/user.entity';
import { BuddyContactRequest } from '../../src/features/buddy-contact/entities/buddy-contact-request.entity';
import { Notification } from '../../src/features/notification/entities/notification.entity';
import { ForumMessage } from '../../src/features/forum-message/entities/forum-message.entity';
import { ForumReport } from '../../src/features/forum-message/entities/forum-report.entity';
import { UserReport } from '../../src/features/user-report/entities/user-report.entity';
import { City } from '../../src/features/city/entities/city.entity';

/** Suffixe unique pour ne jamais entrer en collision avec un run précédent
 * (base de test persistante en local) ni avec un autre fichier e2e exécuté
 * en parallèle. */
export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${uniqueSuffix()}@e2e.skywalk.test`;
}

export async function seedCountry(app: INestApplication) {
  const continentRepo: Repository<Continent> = app.get(
    getRepositoryToken(Continent),
  );
  const countryRepo: Repository<Country> = app.get(getRepositoryToken(Country));

  const suffix = uniqueSuffix();
  const continent = await continentRepo.save(
    continentRepo.create({ name: `E2E Continent ${suffix}` }),
  );
  const country = await countryRepo.save(
    countryRepo.create({
      countryName: `E2E Country ${suffix}`,
      continentId: continent.idContinent,
      status: 'active',
    }),
  );

  return { continent, country };
}

export async function setCountryStatus(
  app: INestApplication,
  countryId: number,
  status: 'active' | 'archived',
) {
  const countryRepo: Repository<Country> = app.get(getRepositoryToken(Country));
  await countryRepo.update(countryId, { status });
}

export async function cleanupCountry(
  app: INestApplication,
  seeded: { continent: Continent; country: Country },
) {
  const continentRepo: Repository<Continent> = app.get(
    getRepositoryToken(Continent),
  );
  const countryRepo: Repository<Country> = app.get(getRepositoryToken(Country));

  await countryRepo.delete(seeded.country.idCountry);
  await continentRepo.delete(seeded.continent.idContinent);
}

export async function seedCity(app: INestApplication, countryId: number) {
  const cityRepo: Repository<City> = app.get(getRepositoryToken(City));
  return cityRepo.save(
    cityRepo.create({
      name: `E2E City ${uniqueSuffix()}`,
      countryId,
      status: 'active',
    }),
  );
}

export async function cleanupCity(app: INestApplication, city: City) {
  const cityRepo: Repository<City> = app.get(getRepositoryToken(City));
  await cityRepo.delete(city.idCity);
}

export async function seedAdminProcedure(
  app: INestApplication,
  countryId: number,
) {
  const procedureRepo: Repository<AdminProcedure> = app.get(
    getRepositoryToken(AdminProcedure),
  );

  return procedureRepo.save(
    procedureRepo.create({
      procedureType: `E2E Procedure ${uniqueSuffix()}`,
      country: { idCountry: countryId } as Country,
      status: 'active',
    }),
  );
}

export async function cleanupAdminProcedure(
  app: INestApplication,
  procedure: AdminProcedure,
) {
  const procedureRepo: Repository<AdminProcedure> = app.get(
    getRepositoryToken(AdminProcedure),
  );
  await procedureRepo.delete(procedure.idAdminProcedure);
}

export async function deleteBuddyRequestsForProcedure(
  app: INestApplication,
  procedureId: number,
) {
  const requestRepo: Repository<BuddyContactRequest> = app.get(
    getRepositoryToken(BuddyContactRequest),
  );
  await requestRepo.delete({ procedureId });
}

/** À appeler avant `deleteUsersByEmail` : les notifications (ex. accepter/
 * refuser une demande buddy) référencent l'utilisateur sans cascade. */
export async function deleteNotificationsForUsers(
  app: INestApplication,
  userIds: number[],
) {
  const notificationRepo: Repository<Notification> = app.get(
    getRepositoryToken(Notification),
  );
  for (const userId of userIds) {
    await notificationRepo.delete({ userId });
  }
}

/** Promeut un compte déjà inscrit (rôle 'user' par défaut) — il n'existe pas
 * de voie applicative pour ça, un test qui veut vérifier un accès admin/
 * modérateur doit passer par la base. Le token déjà émis ne change pas
 * (le rôle est figé dans le JWT à l'émission) : il faut se reconnecter après
 * l'appel pour obtenir un jeton portant le nouveau rôle. */
export async function promoteToRole(
  app: INestApplication,
  userId: number,
  role: 'admin' | 'moderator',
) {
  const userRepo: Repository<User> = app.get(getRepositoryToken(User));
  await userRepo.update({ idUser: userId }, { roles: role });
}

/** À appeler avant de supprimer les utilisateurs concernés : `forum_report`
 * référence son rapporteur et son modérateur SANS cascade — contrairement au
 * lien vers le message/topic signalé, qui passe en NULL dès leur suppression
 * (`onDelete: 'SET NULL'`). Une fois un message modéré-supprimé, un report
 * n'a donc plus ni `topic_id` ni `message_id` fiable : cibler par utilisateur
 * impliqué (rapporteur ou modérateur) est le seul moyen robuste de retrouver
 * ces lignes.
 */
export async function deleteForumReportsForUsers(
  app: INestApplication,
  userIds: number[],
) {
  if (userIds.length === 0) return;
  const reportRepo: Repository<ForumReport> = app.get(
    getRepositoryToken(ForumReport),
  );
  await reportRepo
    .createQueryBuilder()
    .delete()
    .where('reporter_id IN (:...userIds)', { userIds })
    .orWhere('moderator_id IN (:...userIds)', { userIds })
    .execute();
}

/** À appeler avant de supprimer le topic : `forum_report.topic_id` (signalements
 * qui portent directement sur le topic, pas sur un message) n'a pas de cascade. */
export async function deleteForumReportsForTopic(
  app: INestApplication,
  topicId: number,
) {
  const reportRepo: Repository<ForumReport> = app.get(
    getRepositoryToken(ForumReport),
  );
  await reportRepo.delete({ topic: { idForumTopic: topicId } });
}

/** À appeler avant de supprimer le topic : `forum_message.topic_id` n'a pas
 * de cascade. */
export async function deleteForumMessagesForTopic(
  app: INestApplication,
  topicId: number,
) {
  const messageRepo: Repository<ForumMessage> = app.get(
    getRepositoryToken(ForumMessage),
  );
  await messageRepo
    .createQueryBuilder()
    .delete()
    .where('topic_id = :topicId', { topicId })
    .execute();
}

/** À appeler avant de supprimer les utilisateurs concernés : `user_report`
 * référence rapporteur, signalé ET modérateur SANS aucune cascade. */
export async function deleteUserReportsForUsers(
  app: INestApplication,
  userIds: number[],
) {
  if (userIds.length === 0) return;
  const reportRepo: Repository<UserReport> = app.get(
    getRepositoryToken(UserReport),
  );
  await reportRepo
    .createQueryBuilder()
    .delete()
    .where('reporter_id IN (:...userIds)', { userIds })
    .orWhere('reported_user_id IN (:...userIds)', { userIds })
    .orWhere('moderator_id IN (:...userIds)', { userIds })
    .execute();
}

export async function deleteUsersByEmail(
  app: INestApplication,
  emails: string[],
) {
  const userRepo: Repository<User> = app.get(getRepositoryToken(User));
  for (const email of emails) {
    await userRepo.delete({ email });
  }
}
