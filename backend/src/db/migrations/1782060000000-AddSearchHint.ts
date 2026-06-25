import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSearchHint1782060000000 implements MigrationInterface {
  name = 'AddSearchHint1782060000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "search_hint" (
        "id_search_hint"   SERIAL       NOT NULL,
        "country_code"     VARCHAR(2)   NOT NULL,
        "category"         VARCHAR(50)  NOT NULL,
        "official_domains" JSONB        NOT NULL DEFAULT '[]',
        "keywords"         TEXT         NOT NULL DEFAULT '',
        "query_lang"       VARCHAR(5)   NOT NULL DEFAULT 'fr',
        "exclude_terms"    JSONB        NOT NULL DEFAULT '[]',
        "pinned_url"       TEXT         NULL,
        "created_at"       TIMESTAMP    NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMP    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_search_hint" PRIMARY KEY ("id_search_hint"),
        CONSTRAINT "UQ_search_hint_country_cat" UNIQUE ("country_code", "category")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "search_hint"`);
  }
}
