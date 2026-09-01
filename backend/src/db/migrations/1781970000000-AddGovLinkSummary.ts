import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGovLinkSummary1781970000000 implements MigrationInterface {
  name = 'AddGovLinkSummary1781970000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gov_link" ADD COLUMN IF NOT EXISTS "summary" jsonb NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gov_link" DROP COLUMN IF EXISTS "summary"`,
    );
  }
}
