import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectCompletionCancellation1770900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" ADD COLUMN "completed_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" ADD COLUMN "completed_reason" TEXT`,
    );
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" ADD COLUMN "completed_feedback" TEXT`,
    );
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" ADD COLUMN "cancelled_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" ADD COLUMN "cancellation_reason" VARCHAR(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" ADD COLUMN "cancellation_details" TEXT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" DROP COLUMN "cancellation_details"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" DROP COLUMN "cancellation_reason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" DROP COLUMN "cancelled_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" DROP COLUMN "completed_feedback"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" DROP COLUMN "completed_reason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" DROP COLUMN "completed_at"`,
    );
  }
}
