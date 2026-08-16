import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * "Visible but not selectable as destination": the country still appears in browsing
 * pages (destinations, comparisons) but is excluded from the project-creation choices.
 */
export class AddCountrySelectable1782120000000 implements MigrationInterface {
  name = 'AddCountrySelectable1782120000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "country" ADD COLUMN IF NOT EXISTS "selectable_as_destination" BOOLEAN NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "country" DROP COLUMN IF EXISTS "selectable_as_destination"`,
    );
  }
}
