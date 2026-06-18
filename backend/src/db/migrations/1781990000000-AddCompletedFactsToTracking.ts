import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompletedFactsToTracking1781990000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "procedure_tracking" ADD COLUMN IF NOT EXISTS "completed_facts" jsonb NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "procedure_tracking" DROP COLUMN IF EXISTS "completed_facts"`,
    );
  }
}
