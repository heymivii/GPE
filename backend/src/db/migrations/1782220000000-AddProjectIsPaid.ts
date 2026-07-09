import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Modèle « payer par projet » : un projet doit être débloqué (payé) pour accéder au plan
 * complet. Les projets DÉJÀ existants sont grandfathered (is_paid = true) pour ne rien
 * casser ; seuls les nouveaux projets démarrent verrouillés (default false).
 */
export class AddProjectIsPaid1782220000000 implements MigrationInterface {
  name = 'AddProjectIsPaid1782220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" ADD COLUMN IF NOT EXISTS "is_paid" BOOLEAN NOT NULL DEFAULT FALSE`,
    );
    // Grandfather : les projets déjà créés restent accessibles.
    await queryRunner.query(
      `UPDATE "expatriation_project" SET "is_paid" = TRUE WHERE "is_paid" = FALSE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" DROP COLUMN IF EXISTS "is_paid"`,
    );
  }
}
