import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCountries1732480000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "continent" ("continent_name", "iso_code") VALUES
            ('Europe', 'EU'),
            ('Amérique du Nord', 'NA'),
            ('Asie', 'AS')
            ON CONFLICT DO NOTHING;
        `);

    const continents = await queryRunner.query(`
            SELECT id_continent, iso_code FROM "continent";
        `);

    const continentMap: Record<string, number> = {};
    continents.forEach((c: any) => {
      continentMap[c.iso_code] = c.id_continent;
    });

    await queryRunner.query(`
            INSERT INTO "country" ("country_name", "iso_code", "id_continent", "currency", "language", "flag_url") VALUES
            ('France', 'FR', ${continentMap['EU']}, 'EUR', 'Français', 'https://flagcdn.com/fr.svg'),
            ('Suisse', 'CH', ${continentMap['EU']}, 'CHF', 'Français/Allemand/Italien', 'https://flagcdn.com/ch.svg'),
            ('États-Unis', 'US', ${continentMap['NA']}, 'USD', 'Anglais', 'https://flagcdn.com/us.svg'),
            ('Japon', 'JP', ${continentMap['AS']}, 'JPY', 'Japonais', 'https://flagcdn.com/jp.svg')
            ON CONFLICT DO NOTHING;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "country" WHERE "iso_code" IN ('FR','CH','US','JP');`,
    );
    await queryRunner.query(
      `DELETE FROM "continent" WHERE "iso_code" IN ('EU','NA','AS');`,
    );
  }
}
