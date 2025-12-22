import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChecklistProgressToProject1732803000000
  implements MigrationInterface
{
  name = 'AddChecklistProgressToProject1732803000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "expatriation_project" 
      ADD COLUMN "checklist_progress" JSONB DEFAULT '{}'::jsonb
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_expatriation_project_checklist_progress" 
      ON "expatriation_project" USING GIN ("checklist_progress")
    `);

    console.log('✅ Colonne checklist_progress ajoutée avec succès');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_expatriation_project_checklist_progress"`,
    );

    await queryRunner.query(`
      ALTER TABLE "expatriation_project" 
      DROP COLUMN IF EXISTS "checklist_progress"
    `);

    console.log('✅ Colonne checklist_progress supprimée');
  }
}
