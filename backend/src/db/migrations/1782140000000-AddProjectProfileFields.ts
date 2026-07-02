import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * High-signal fields that actually personalise the checklist:
 *  - nationality (ISO2): THE visa determinant (EU/EEA free movement vs third-country);
 *  - has_children: drives school / childcare steps;
 *  - has_job_offer: drives the work-visa path vs job-search.
 * (Precise departure date already exists as expected_departure_date — only the front changes.)
 */
export class AddProjectProfileFields1782140000000 implements MigrationInterface {
  name = 'AddProjectProfileFields1782140000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "expatriation_project"
        ADD COLUMN IF NOT EXISTS "nationality" VARCHAR(2) NULL,
        ADD COLUMN IF NOT EXISTS "has_children" BOOLEAN NULL,
        ADD COLUMN IF NOT EXISTS "has_job_offer" BOOLEAN NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "expatriation_project"
        DROP COLUMN IF EXISTS "nationality",
        DROP COLUMN IF EXISTS "has_children",
        DROP COLUMN IF EXISTS "has_job_offer"
    `);
  }
}
