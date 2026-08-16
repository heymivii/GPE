import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResetCompletedFactsToContentKeys1782030000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Reset stale positional indices — completed_facts now stores action texts (content-keyed).
    await queryRunner.query(
      `UPDATE procedure_tracking SET completed_facts = '[]'::jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No semantic rollback possible; just clear again.
    await queryRunner.query(
      `UPDATE procedure_tracking SET completed_facts = '[]'::jsonb`,
    );
  }
}
