import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Admin-managed gov-links engine config, ON the country row (single source of truth):
 *   - gov_link_enabled: "the AI engine processes this country" switch,
 *   - official_domains: the anti-hallucination allowlist (hostname suffixes).
 * Seeds the four historic countries from the static registry so behaviour is unchanged.
 */
export class AddGovLinkCountryConfig1782110000000 implements MigrationInterface {
  name = 'AddGovLinkCountryConfig1782110000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "country"
        ADD COLUMN IF NOT EXISTS "gov_link_enabled" BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "official_domains" JSONB NOT NULL DEFAULT '[]'
    `);
    const seed: Record<string, string[]> = {
      FR: ['gouv.fr', 'service-public.fr', 'ameli.fr', 'campusfrance.org'],
      US: ['.gov', 'uscis.gov', 'state.gov'],
      JP: ['go.jp', 'moj.go.jp', 'isa.go.jp'],
      CH: ['admin.ch', 'ch.ch'],
    };
    for (const [iso, domains] of Object.entries(seed)) {
      await queryRunner.query(
        `UPDATE "country" SET "gov_link_enabled" = true, "official_domains" = $1 WHERE "iso_code" = $2`,
        [JSON.stringify(domains), iso],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "country"
        DROP COLUMN IF EXISTS "gov_link_enabled",
        DROP COLUMN IF EXISTS "official_domains"
    `);
  }
}
