import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CITY-level Numbeo indices caches (the existing quality_of_life_cache / in-memory
 * property cache are COUNTRY-level). One row per city, 30-day TTL, jsonb payload —
 * same anti-ban + provenance rationale as quality_of_life_cache.
 */
export class AddCityIndicesCaches1782090000000 implements MigrationInterface {
  name = 'AddCityIndicesCaches1782090000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of [
      'quality_of_life_city_cache',
      'property_investment_city_cache',
    ]) {
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "${table}" (
          "id_${table}"        SERIAL      NOT NULL,
          "city_id"            INTEGER     NOT NULL,
          "data"               JSONB       NOT NULL,
          "source_last_update" VARCHAR(50) NULL,
          "cached_at"          TIMESTAMP   NOT NULL DEFAULT now(),
          "expires_at"         TIMESTAMP   NOT NULL,
          CONSTRAINT "PK_${table}" PRIMARY KEY ("id_${table}"),
          CONSTRAINT "UQ_${table}_city" UNIQUE ("city_id"),
          CONSTRAINT "FK_${table}_city" FOREIGN KEY ("city_id")
            REFERENCES "city"("id_city") ON DELETE CASCADE
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "quality_of_life_city_cache"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "property_investment_city_cache"`,
    );
  }
}
