import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * expatriation_project n'avait pas de updated_at, alors que le front lit
 * ce champ. Ajout de la colonne (@UpdateDateColumn la maintient à jour).
 */
export class AddProjectUpdatedAt1782170000000 implements MigrationInterface {
  name = 'AddProjectUpdatedAt1782170000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" DROP COLUMN IF EXISTS "updated_at"`,
    );
  }
}
