import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Provenance of city indices: 'Numbeo' (scraped) or 'manuel' (admin-edited).
 * An admin can override/complete the scraped values; re-fetching from Numbeo
 * resets the source to 'Numbeo' (and replaces manual edits — by design).
 */
export class AddCityIndicesSource1782100000000 implements MigrationInterface {
  name = 'AddCityIndicesSource1782100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of [
      'quality_of_life_city_cache',
      'property_investment_city_cache',
    ]) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "source" VARCHAR(20) NOT NULL DEFAULT 'Numbeo'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of [
      'quality_of_life_city_cache',
      'property_investment_city_cache',
    ]) {
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "source"`,
      );
    }
  }
}
