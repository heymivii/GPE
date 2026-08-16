import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Two-step city review: the creator ASSIGNS a reviewer; the reviewer marks the check done
 * (status 'review_done'); the creator then publishes or sends it back for another review.
 */
export class AddCityReviewAssignment1782130000000 implements MigrationInterface {
  name = 'AddCityReviewAssignment1782130000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "city" ADD COLUMN IF NOT EXISTS "assigned_to_id" INTEGER NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "city" ADD CONSTRAINT "FK_city_assigned_to"
        FOREIGN KEY ("assigned_to_id") REFERENCES "app_user"("id_user") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "city" DROP CONSTRAINT IF EXISTS "FK_city_assigned_to"`);
    await queryRunner.query(`ALTER TABLE "city" DROP COLUMN IF EXISTS "assigned_to_id"`);
  }
}
