import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCostOfLivingCache1770700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cost_of_living_cache (
        id SERIAL PRIMARY KEY,
        city_id INTEGER NOT NULL UNIQUE,
        data JSONB NOT NULL,
        cached_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        CONSTRAINT "FK_col_cache_city" FOREIGN KEY (city_id)
          REFERENCES city(id_city) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_col_cache_city ON cost_of_living_cache(city_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_col_cache_expires ON cost_of_living_cache(expires_at);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_col_cache_data ON cost_of_living_cache USING GIN (data);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS cost_of_living_cache;`);
  }
}
