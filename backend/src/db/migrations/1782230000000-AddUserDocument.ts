import { MigrationInterface, QueryRunner } from 'typeorm';

/** Coffre de documents personnels (métadonnées ; les fichiers sont chiffrés sur disque). */
export class AddUserDocument1782230000000 implements MigrationInterface {
  name = 'AddUserDocument1782230000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_document" (
        "id_document"           SERIAL       NOT NULL,
        "original_name"         VARCHAR(255) NOT NULL,
        "mime_type"             VARCHAR(100) NOT NULL,
        "size_bytes"            INTEGER      NOT NULL,
        "storage_key"           VARCHAR(100) NOT NULL,
        "created_at"            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "user_id"               INTEGER      NOT NULL,
        "project_id"            INTEGER      NOT NULL,
        "procedure_tracking_id" INTEGER      NULL,
        CONSTRAINT "PK_user_document" PRIMARY KEY ("id_document"),
        CONSTRAINT "FK_user_document_user"
          FOREIGN KEY ("user_id") REFERENCES "app_user" ("id_user") ON DELETE CASCADE,
        CONSTRAINT "FK_user_document_project"
          FOREIGN KEY ("project_id") REFERENCES "expatriation_project" ("id_project") ON DELETE CASCADE,
        CONSTRAINT "FK_user_document_procedure"
          FOREIGN KEY ("procedure_tracking_id")
          REFERENCES "procedure_tracking" ("id_procedure_tracking") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_user_document_project" ON "user_document" ("project_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_document_project"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_document"`);
  }
}
