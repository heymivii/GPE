import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * L'onboarding collecte les « étapes de préparation déjà faites » mais elles
 * n'étaient jamais persistées (aucune colonne). Ajout de steps_done.
 */
export class AddProjectStepsDone1782160000000 implements MigrationInterface {
  name = 'AddProjectStepsDone1782160000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" ADD COLUMN IF NOT EXISTS "steps_done" VARCHAR(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" DROP COLUMN IF EXISTS "steps_done"`,
    );
  }
}
