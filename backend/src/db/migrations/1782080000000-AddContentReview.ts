import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Content review workflow (countries & cities):
 *   - who added the row (created_by_id),
 *   - who verified it (reviewed_by_id, reviewed_at).
 * New rows are created with status 'pending_review' (invisible user-side — public queries
 * filter status='active') until ANOTHER admin approves them. Existing rows keep 'active'.
 */
export class AddContentReview1782080000000 implements MigrationInterface {
  name = 'AddContentReview1782080000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['country', 'city']) {
      await queryRunner.query(`
        ALTER TABLE "${table}"
          ADD COLUMN IF NOT EXISTS "created_by_id" INTEGER NULL,
          ADD COLUMN IF NOT EXISTS "reviewed_by_id" INTEGER NULL,
          ADD COLUMN IF NOT EXISTS "reviewed_at" TIMESTAMP NULL
      `);
      await queryRunner.query(`
        ALTER TABLE "${table}"
          ADD CONSTRAINT "FK_${table}_created_by" FOREIGN KEY ("created_by_id")
            REFERENCES "app_user"("id_user") ON DELETE SET NULL,
          ADD CONSTRAINT "FK_${table}_reviewed_by" FOREIGN KEY ("reviewed_by_id")
            REFERENCES "app_user"("id_user") ON DELETE SET NULL
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['country', 'city']) {
      await queryRunner.query(`
        ALTER TABLE "${table}"
          DROP CONSTRAINT IF EXISTS "FK_${table}_created_by",
          DROP CONSTRAINT IF EXISTS "FK_${table}_reviewed_by"
      `);
      await queryRunner.query(`
        ALTER TABLE "${table}"
          DROP COLUMN IF EXISTS "created_by_id",
          DROP COLUMN IF EXISTS "reviewed_by_id",
          DROP COLUMN IF EXISTS "reviewed_at"
      `);
    }
  }
}
