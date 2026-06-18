import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminProcedureActionItems1782010000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE admin_procedure ADD COLUMN IF NOT EXISTS action_items jsonb NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE admin_procedure DROP COLUMN IF EXISTS action_items`,
    );
  }
}
