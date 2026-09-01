import { MigrationInterface, QueryRunner } from 'typeorm';

/** Palier de rappel d'échéance déjà envoyé (dedup des rappels J-30 / J-7). */
export class AddReminderTracking1782210000000 implements MigrationInterface {
  name = 'AddReminderTracking1782210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "procedure_tracking" ADD COLUMN IF NOT EXISTS "last_reminder_days" INTEGER NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "procedure_tracking" DROP COLUMN IF EXISTS "last_reminder_days"`,
    );
  }
}
