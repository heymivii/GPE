import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDaysBeforeDepartureToAdminProcedure1781950000000 implements MigrationInterface {
  name = 'AddDaysBeforeDepartureToAdminProcedure1781950000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "admin_procedure"
        ADD COLUMN IF NOT EXISTS "days_before_departure" INTEGER NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "admin_procedure"
        DROP COLUMN IF EXISTS "days_before_departure"
    `);
  }
}