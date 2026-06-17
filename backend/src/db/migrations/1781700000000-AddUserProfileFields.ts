import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileFields1781700000000 implements MigrationInterface {
  name = 'AddUserProfileFields1781700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Champs de profil collectés à l'onboarding (étape "Profil"), stockés sur app_user.
    // spoken_languages est un tableau natif Postgres (text[]).
    await queryRunner.query(`
      ALTER TABLE "app_user"
        ADD COLUMN IF NOT EXISTS "status"           VARCHAR(50)  NULL,
        ADD COLUMN IF NOT EXISTS "language_level"   VARCHAR(10)  NULL,
        ADD COLUMN IF NOT EXISTS "mother_tongue"    VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS "spoken_languages" TEXT[]       NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "app_user"
        DROP COLUMN IF EXISTS "spoken_languages",
        DROP COLUMN IF EXISTS "mother_tongue",
        DROP COLUMN IF EXISTS "language_level",
        DROP COLUMN IF EXISTS "status"
    `);
  }
}
