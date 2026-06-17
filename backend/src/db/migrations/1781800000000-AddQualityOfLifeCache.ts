import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQualityOfLifeCache1781800000000 implements MigrationInterface {
  name = 'AddQualityOfLifeCache1781800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "quality_of_life_cache" (
        "id_quality_of_life_cache" SERIAL        NOT NULL,
        "country"                  VARCHAR(100)  NOT NULL,
        "data"                     JSONB         NOT NULL,
        "source_last_update"       VARCHAR(50)   NULL,
        "cached_at"                TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expires_at"               TIMESTAMP     NOT NULL,
        CONSTRAINT "PK_quality_of_life_cache" PRIMARY KEY ("id_quality_of_life_cache"),
        CONSTRAINT "UQ_quality_of_life_cache_country" UNIQUE ("country")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "quality_of_life_cache"`);
  }
}
