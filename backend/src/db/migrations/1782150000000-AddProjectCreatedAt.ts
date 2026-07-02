import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * expatriation_project had no creation timestamp, so the project detail page
 * rendered "Créé le Invalid Date". Add a created_at column; existing rows are
 * backfilled with now() (their real creation time is unknown), new rows get it
 * automatically via @CreateDateColumn.
 */
export class AddProjectCreatedAt1782150000000 implements MigrationInterface {
  name = 'AddProjectCreatedAt1782150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" DROP COLUMN IF EXISTS "created_at"`,
    );
  }
}
