import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Heartbeat for generation runs: updated after EACH category completes.
 * Staleness detection is based on this (a run is stale when no category has
 * finished for STALE_RUN_MS), instead of the total run duration — which
 * falsely killed long-but-healthy runs (11 categories × search+verify+LLM).
 */
export class AddRunHeartbeat1782070000000 implements MigrationInterface {
  name = 'AddRunHeartbeat1782070000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "generation_run" ADD COLUMN IF NOT EXISTS "last_heartbeat_at" TIMESTAMP NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "generation_run" DROP COLUMN IF EXISTS "last_heartbeat_at"`,
    );
  }
}
