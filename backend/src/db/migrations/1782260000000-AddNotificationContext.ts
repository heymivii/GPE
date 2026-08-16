import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rend les notifications cliquables : on stocke un contexte sémantique
 * (context_type + context_id, ex. « project » + idProject) que le front mappe
 * vers la route concernée (ex. /projects/:id/checklist). Nullable : une notif
 * sans contexte reste simplement non-cliquable.
 */
export class AddNotificationContext1782260000000 implements MigrationInterface {
  name = 'AddNotificationContext1782260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "context_type" varchar(40)`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "context_id" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN IF EXISTS "context_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN IF EXISTS "context_type"`,
    );
  }
}
