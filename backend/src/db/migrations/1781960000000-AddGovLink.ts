import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGovLink1781960000000 implements MigrationInterface {
  name = 'AddGovLink1781960000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "gov_link" (
        "id_gov_link"  SERIAL        NOT NULL,
        "country_code" VARCHAR(2)    NOT NULL,
        "category"     VARCHAR(50)   NOT NULL,
        "label"        VARCHAR(255)  NOT NULL,
        "url"          TEXT          NOT NULL,
        "source_query" TEXT          NULL,
        "confidence"   DOUBLE PRECISION NOT NULL DEFAULT 0,
        "verified_at"  TIMESTAMP     NULL,
        "status"       VARCHAR(20)   NOT NULL DEFAULT 'active',
        CONSTRAINT "PK_gov_link" PRIMARY KEY ("id_gov_link"),
        CONSTRAINT "UQ_gov_link_country_cat" UNIQUE ("country_code","category")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "gov_link"`);
  }
}
