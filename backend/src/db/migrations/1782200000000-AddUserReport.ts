import { MigrationInterface, QueryRunner } from 'typeorm';

/** Signalement d'un compte utilisateur par un autre (distinct des signalements de contenu). */
export class AddUserReport1782200000000 implements MigrationInterface {
  name = 'AddUserReport1782200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_report" (
        "id_user_report"   SERIAL       NOT NULL,
        "reporter_id"      INTEGER      NOT NULL,
        "reported_user_id" INTEGER      NOT NULL,
        "reason"           VARCHAR(50)  NOT NULL,
        "details"          TEXT         NULL,
        "status"           VARCHAR(20)  NOT NULL DEFAULT 'pending',
        "moderator_note"   TEXT         NULL,
        "moderator_id"     INTEGER      NULL,
        "resolved_at"      TIMESTAMP    NULL,
        "created_at"       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_user_report" PRIMARY KEY ("id_user_report"),
        CONSTRAINT "FK_user_report_reporter"
          FOREIGN KEY ("reporter_id") REFERENCES "app_user" ("id_user") ON DELETE CASCADE,
        CONSTRAINT "FK_user_report_reported"
          FOREIGN KEY ("reported_user_id") REFERENCES "app_user" ("id_user") ON DELETE CASCADE,
        CONSTRAINT "FK_user_report_moderator"
          FOREIGN KEY ("moderator_id") REFERENCES "app_user" ("id_user") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_user_report_status" ON "user_report" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_report_status"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_report"`);
  }
}
