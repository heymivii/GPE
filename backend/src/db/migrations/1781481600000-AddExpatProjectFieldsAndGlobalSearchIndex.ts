import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpatProjectFieldsAndGlobalSearchIndex1781481600000
  implements MigrationInterface
{
  name = 'AddExpatProjectFieldsAndGlobalSearchIndex1781481600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Nouvelles colonnes sur expatriation_project
    await queryRunner.query(`
      ALTER TABLE "expatriation_project"
        ADD COLUMN IF NOT EXISTS "checklist_progress"    JSONB        NULL,
        ADD COLUMN IF NOT EXISTS "priorities"            VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS "completed_at"          TIMESTAMP    NULL,
        ADD COLUMN IF NOT EXISTS "completed_reason"      TEXT         NULL,
        ADD COLUMN IF NOT EXISTS "completed_feedback"    TEXT         NULL,
        ADD COLUMN IF NOT EXISTS "cancelled_at"          TIMESTAMP    NULL,
        ADD COLUMN IF NOT EXISTS "cancellation_reason"   VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS "cancellation_details"  TEXT         NULL
    `);

    // 2. Nouvelle colonne sur procedure_tracking
    await queryRunner.query(`
      ALTER TABLE "procedure_tracking"
        ADD COLUMN IF NOT EXISTS "comments" TEXT NULL
    `);

    // 3. Création de la table global_search_index
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "global_search_index" (
        "id"            SERIAL       NOT NULL,
        "category"      TEXT         NOT NULL,
        "entity_id"     TEXT         NOT NULL,
        "title"         VARCHAR(255) NOT NULL,
        "description"   TEXT,
        "extra"         VARCHAR(255),
        "url"           TEXT,
        "country_name"  VARCHAR(255),
        "image_url"     VARCHAR(255),
        "search_vector" TSVECTOR,
        CONSTRAINT "PK_global_search_index" PRIMARY KEY ("id")
      )
    `);

    // 4. Index GIN pour la recherche full-text
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_global_search_index_search_vector"
      ON "global_search_index"
      USING GIN("search_vector")
    `);

    // Index complémentaires pour les filtres courants
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_global_search_index_category"
      ON "global_search_index" ("category")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_global_search_index_entity_id"
      ON "global_search_index" ("entity_id")
    `);

    // 5. Fonction trigger de mise à jour du search_vector
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_global_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector := to_tsvector(
          'simple',
          coalesce(NEW.title, '')        || ' ' ||
          coalesce(NEW.description, '')  || ' ' ||
          coalesce(NEW.extra, '')        || ' ' ||
          coalesce(NEW.country_name, '')
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    // 6. Trigger BEFORE INSERT OR UPDATE
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS "trg_global_search_vector"
      ON "global_search_index"
    `);

    await queryRunner.query(`
      CREATE TRIGGER "trg_global_search_vector"
      BEFORE INSERT OR UPDATE ON "global_search_index"
      FOR EACH ROW
      EXECUTE FUNCTION update_global_search_vector()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback dans l'ordre inverse

    // 6. Supprimer le trigger et la fonction
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS "trg_global_search_vector"
      ON "global_search_index"
    `);

    await queryRunner.query(`
      DROP FUNCTION IF EXISTS update_global_search_vector()
    `);

    // 4-5. Supprimer les index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_global_search_index_entity_id"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_global_search_index_category"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_global_search_index_search_vector"
    `);

    // 3. Supprimer la table global_search_index
    await queryRunner.query(`
      DROP TABLE IF EXISTS "global_search_index"
    `);

    // 2. Retirer la colonne comments de procedure_tracking
    await queryRunner.query(`
      ALTER TABLE "procedure_tracking"
        DROP COLUMN IF EXISTS "comments"
    `);

    // 1. Retirer les colonnes ajoutées à expatriation_project
    await queryRunner.query(`
      ALTER TABLE "expatriation_project"
        DROP COLUMN IF EXISTS "cancellation_details",
        DROP COLUMN IF EXISTS "cancellation_reason",
        DROP COLUMN IF EXISTS "cancelled_at",
        DROP COLUMN IF EXISTS "completed_feedback",
        DROP COLUMN IF EXISTS "completed_reason",
        DROP COLUMN IF EXISTS "completed_at",
        DROP COLUMN IF EXISTS "priorities",
        DROP COLUMN IF EXISTS "checklist_progress"
    `);
  }
}
