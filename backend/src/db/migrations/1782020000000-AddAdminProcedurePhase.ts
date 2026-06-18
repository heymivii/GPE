import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminProcedurePhase1782020000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE admin_procedure ADD COLUMN IF NOT EXISTS phase varchar(20) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE admin_procedure DROP COLUMN IF EXISTS phase`,
    );
  }
}
