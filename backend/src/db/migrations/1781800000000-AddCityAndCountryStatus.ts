import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCityAndCountryStatus1781800000000 implements MigrationInterface {
  name = 'AddCityAndCountryStatus1781800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "city"
        ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) NOT NULL DEFAULT 'active'
    `);

    await queryRunner.query(`
      ALTER TABLE "country"
        ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) NOT NULL DEFAULT 'active'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "country"
        DROP COLUMN IF EXISTS "status"
    `);

    await queryRunner.query(`
      ALTER TABLE "city"
        DROP COLUMN IF EXISTS "status"
    `);
  }
}
