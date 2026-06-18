import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGovLinkActions1782000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE gov_link ADD COLUMN IF NOT EXISTS actions jsonb NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE gov_link DROP COLUMN IF EXISTS actions`,
    );
  }
}
