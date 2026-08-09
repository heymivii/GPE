import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * F1 — Réseau d'experts vérifiés. Ajoute les colonnes expert sur `app_user`.
 * (Migration écrite à la main pour ne pas embarquer le diff parasite de
 * `migration:generate` — cf. AddForumTopicFollow.)
 */
export class AddUserExpertFields1786311400000 implements MigrationInterface {
  name = 'AddUserExpertFields1786311400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_user" ADD COLUMN IF NOT EXISTS "is_expert" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" ADD COLUMN IF NOT EXISTS "expert_title" varchar(120)`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" ADD COLUMN IF NOT EXISTS "expert_bio" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" ADD COLUMN IF NOT EXISTS "expert_country_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" ADD COLUMN IF NOT EXISTS "expert_verified_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" ADD COLUMN IF NOT EXISTS "expert_verified_by" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" ADD CONSTRAINT "FK_app_user_expert_country" FOREIGN KEY ("expert_country_id") REFERENCES "country"("id_country") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" ADD CONSTRAINT "FK_app_user_expert_verified_by" FOREIGN KEY ("expert_verified_by") REFERENCES "app_user"("id_user") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_user" DROP CONSTRAINT IF EXISTS "FK_app_user_expert_verified_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" DROP CONSTRAINT IF EXISTS "FK_app_user_expert_country"`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" DROP COLUMN IF EXISTS "expert_verified_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" DROP COLUMN IF EXISTS "expert_verified_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" DROP COLUMN IF EXISTS "expert_country_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" DROP COLUMN IF EXISTS "expert_bio"`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" DROP COLUMN IF EXISTS "expert_title"`,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" DROP COLUMN IF EXISTS "is_expert"`,
    );
  }
}
