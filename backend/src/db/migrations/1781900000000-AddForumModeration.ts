import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForumModeration1781900000000 implements MigrationInterface {
  name = 'AddForumModeration1781900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Champs de modération sur forum_message
    await queryRunner.query(`
      ALTER TABLE "forum_message"
        ADD COLUMN IF NOT EXISTS "is_moderated"      BOOLEAN   NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS "moderation_reason" TEXT      NULL,
        ADD COLUMN IF NOT EXISTS "moderated_at"      TIMESTAMP NULL
    `);

    // 2. Compteur dénormalisé d'avertissements sur app_user
    await queryRunner.query(`
      ALTER TABLE "app_user"
        ADD COLUMN IF NOT EXISTS "warning_count" INTEGER NOT NULL DEFAULT 0
    `);

    // 3. Table des mots/expressions interdits
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "forbidden_word" (
        "id_forbidden_word" SERIAL       NOT NULL,
        "word"              VARCHAR(255) NOT NULL,
        "severity"          VARCHAR(20)  NOT NULL DEFAULT 'medium',
        "is_active"         BOOLEAN      NOT NULL DEFAULT TRUE,
        "created_at"        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at"        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_forbidden_word"         PRIMARY KEY ("id_forbidden_word"),
        CONSTRAINT "UQ_forbidden_word_word"    UNIQUE ("word"),
        CONSTRAINT "CHK_forbidden_word_severity"
          CHECK ("severity" IN ('low', 'medium', 'high', 'critical'))
      )
    `);

    // 4. Table des avertissements utilisateurs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_warning" (
        "id_user_warning"   SERIAL    NOT NULL,
        "user_id"           INTEGER   NOT NULL,
        "message_id"        INTEGER   NULL,
        "forbidden_word_id" INTEGER   NULL,
        "reason"            TEXT      NOT NULL,
        "created_at"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_user_warning" PRIMARY KEY ("id_user_warning"),
        CONSTRAINT "FK_user_warning_user"
          FOREIGN KEY ("user_id")
          REFERENCES "app_user" ("id_user")
          ON DELETE CASCADE,
        CONSTRAINT "FK_user_warning_message"
          FOREIGN KEY ("message_id")
          REFERENCES "forum_message" ("id_forum_message")
          ON DELETE SET NULL,
        CONSTRAINT "FK_user_warning_forbidden_word"
          FOREIGN KEY ("forbidden_word_id")
          REFERENCES "forbidden_word" ("id_forbidden_word")
          ON DELETE SET NULL
      )
    `);

    // 5. Index sur forum_message
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_forum_message_is_moderated"
      ON "forum_message" ("is_moderated")
    `);

    // 6. Index sur user_warning
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_user_warning_user_id"
      ON "user_warning" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_user_warning_message_id"
      ON "user_warning" ("message_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_user_warning_forbidden_word_id"
      ON "user_warning" ("forbidden_word_id")
    `);

    // 7. Index sur forbidden_word
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_forbidden_word_is_active"
      ON "forbidden_word" ("is_active")
    `);

    // 8. Trigger : maintien automatique de warning_count sur app_user
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_user_warning_count()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE "app_user"
            SET "warning_count" = "warning_count" + 1
            WHERE "id_user" = NEW.user_id;
          RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE "app_user"
            SET "warning_count" = GREATEST("warning_count" - 1, 0)
            WHERE "id_user" = OLD.user_id;
          RETURN OLD;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS "trg_user_warning_count" ON "user_warning"
    `);

    await queryRunner.query(`
      CREATE TRIGGER "trg_user_warning_count"
      AFTER INSERT OR DELETE ON "user_warning"
      FOR EACH ROW EXECUTE FUNCTION update_user_warning_count()
    `);

    // 9. Trigger : mise à jour automatique de updated_at sur forbidden_word
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_forbidden_word_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS "trg_forbidden_word_updated_at" ON "forbidden_word"
    `);

    await queryRunner.query(`
      CREATE TRIGGER "trg_forbidden_word_updated_at"
      BEFORE UPDATE ON "forbidden_word"
      FOR EACH ROW EXECUTE FUNCTION update_forbidden_word_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback dans l'ordre inverse

    // 9. Supprimer trigger + fonction updated_at
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS "trg_forbidden_word_updated_at" ON "forbidden_word"
    `);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_forbidden_word_updated_at()`);

    // 8. Supprimer trigger + fonction warning_count
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS "trg_user_warning_count" ON "user_warning"
    `);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_user_warning_count()`);

    // 7. Index forbidden_word
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_forbidden_word_is_active"`);

    // 6. Index user_warning
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_warning_forbidden_word_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_warning_message_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_warning_user_id"`);

    // 5. Index forum_message
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_forum_message_is_moderated"`);

    // 4. Table user_warning
    await queryRunner.query(`DROP TABLE IF EXISTS "user_warning"`);

    // 3. Table forbidden_word
    await queryRunner.query(`DROP TABLE IF EXISTS "forbidden_word"`);

    // 2. Colonne warning_count
    await queryRunner.query(`
      ALTER TABLE "app_user" DROP COLUMN IF EXISTS "warning_count"
    `);

    // 1. Colonnes de modération
    await queryRunner.query(`
      ALTER TABLE "forum_message"
        DROP COLUMN IF EXISTS "moderated_at",
        DROP COLUMN IF EXISTS "moderation_reason",
        DROP COLUMN IF EXISTS "is_moderated"
    `);
  }
}
