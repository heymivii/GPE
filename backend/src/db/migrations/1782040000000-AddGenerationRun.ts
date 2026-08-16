import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGenerationRun1782040000000 implements MigrationInterface {
  name = 'AddGenerationRun1782040000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "generation_run" (
        "id_generation_run" SERIAL        NOT NULL,
        "country_code"      VARCHAR(2)    NOT NULL,
        "status"            VARCHAR(20)   NOT NULL DEFAULT 'running',
        "total"             INTEGER       NOT NULL DEFAULT 0,
        "results"           JSONB         NOT NULL DEFAULT '[]',
        "started_at"        TIMESTAMP     NOT NULL DEFAULT now(),
        "finished_at"       TIMESTAMP     NULL,
        CONSTRAINT "PK_generation_run" PRIMARY KEY ("id_generation_run")
      )
    `);
    // Speeds up GET /gov-links/runs/latest?country=XX (latest run per country).
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_generation_run_country" ON "generation_run" ("country_code", "started_at" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "generation_run"`);
  }
}
