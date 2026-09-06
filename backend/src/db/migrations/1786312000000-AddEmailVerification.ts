import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Vérification d'adresse email (retour de recette : « les adresses mails ne sont
 * pas vérifiées »).
 *
 * Les comptes EXISTANTS sont marqués comme vérifiés : ils se sont inscrits quand
 * la confirmation n'existait pas, les faire basculer « non vérifiés » afficherait
 * un bandeau d'alerte à tout le monde — jury et admins compris — sans qu'ils aient
 * rien fait de mal. Seules les inscriptions POSTÉRIEURES à cette migration doivent
 * confirmer leur adresse.
 */
export class AddEmailVerification1786312000000 implements MigrationInterface {
  name = 'AddEmailVerification1786312000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_user" ADD COLUMN IF NOT EXISTS "email_verified_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `UPDATE "app_user" SET "email_verified_at" = NOW() WHERE "email_verified_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_user" DROP COLUMN IF EXISTS "email_verified_at"`,
    );
  }
}
