import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminProcedureGovFields1781980000000 implements MigrationInterface {
  name = 'AddAdminProcedureGovFields1781980000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "admin_procedure"
        ADD COLUMN IF NOT EXISTS "source_url"  TEXT  NULL,
        ADD COLUMN IF NOT EXISTS "objectives"  JSONB NULL,
        ADD COLUMN IF NOT EXISTS "key_facts"   JSONB NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "admin_procedure"
        DROP COLUMN IF EXISTS "key_facts",
        DROP COLUMN IF EXISTS "objectives",
        DROP COLUMN IF EXISTS "source_url"
    `);
  }
}
