import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminProcedureStatus1782050000000 implements MigrationInterface {
  name = 'AddAdminProcedureStatus1782050000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE admin_procedure
        ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'active'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE admin_procedure DROP COLUMN IF EXISTS status`);
  }
}
