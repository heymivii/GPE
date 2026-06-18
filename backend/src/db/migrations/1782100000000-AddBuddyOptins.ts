import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBuddyOptins1782100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "app_user"
        ADD COLUMN IF NOT EXISTS "buddy_opt_in"         BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS "buddy_contact_opt_in" BOOLEAN NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "app_user"
        DROP COLUMN IF EXISTS "buddy_opt_in",
        DROP COLUMN IF EXISTS "buddy_contact_opt_in"
    `);
  }
}
