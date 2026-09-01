import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Coffre personnel : un document appartient à l'utilisateur ; le projet devient un
 * contexte OPTIONNEL (on peut ranger son passeport sans le lier à un projet précis).
 */
export class DocumentProjectOptional1782250000000
  implements MigrationInterface
{
  name = 'DocumentProjectOptional1782250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_document" ALTER COLUMN "project_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_document" ALTER COLUMN "project_id" SET NOT NULL`,
    );
  }
}
