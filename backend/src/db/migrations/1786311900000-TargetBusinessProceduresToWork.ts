import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * « Créer une entreprise » (catégorie business) était générée avec objectives = []
 * (universelle) et polluait donc les checklists des projets 'study'. On aligne les
 * lignes existantes sur CATEGORY_OBJECTIVES_MAP : business cible désormais ['work'].
 * Les procedure_tracking déjà créés sont conservés — le service les masque à la
 * lecture quand la procédure ne correspond plus à l'objectif du projet.
 */
export class TargetBusinessProceduresToWork1786311900000
  implements MigrationInterface
{
  name = 'TargetBusinessProceduresToWork1786311900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "admin_procedure" SET "objectives" = '["work"]'::jsonb WHERE "category" = 'business'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "admin_procedure" SET "objectives" = '[]'::jsonb WHERE "category" = 'business'`,
    );
  }
}
