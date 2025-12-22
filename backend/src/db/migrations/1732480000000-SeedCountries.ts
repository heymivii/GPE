import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedCountries1732480000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "continent" ("continent_name", "iso_code") VALUES
            ('Europe', 'EU'),
            ('Amérique du Nord', 'NA'),
            ('Amérique du Sud', 'SA'),
            ('Asie', 'AS'),
            ('Océanie', 'OC')
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
            ('Canada', 'CA', ${continentMap['NA']}, 'CAD', 'Français/Anglais', 'https://flagcdn.com/ca.svg'),
            ('Suisse', 'CH', ${continentMap['EU']}, 'CHF', 'Français/Allemand/Italien', 'https://flagcdn.com/ch.svg'),
            ('Allemagne', 'DE', ${continentMap['EU']}, 'EUR', 'Allemand', 'https://flagcdn.com/de.svg'),
            ('Espagne', 'ES', ${continentMap['EU']}, 'EUR', 'Espagnol', 'https://flagcdn.com/es.svg'),
            ('Italie', 'IT', ${continentMap['EU']}, 'EUR', 'Italien', 'https://flagcdn.com/it.svg'),
            ('Portugal', 'PT', ${continentMap['EU']}, 'EUR', 'Portugais', 'https://flagcdn.com/pt.svg'),
            ('Belgique', 'BE', ${continentMap['EU']}, 'EUR', 'Français/Néerlandais', 'https://flagcdn.com/be.svg'),
            ('Pays-Bas', 'NL', ${continentMap['EU']}, 'EUR', 'Néerlandais', 'https://flagcdn.com/nl.svg'),
            ('Luxembourg', 'LU', ${continentMap['EU']}, 'EUR', 'Français/Allemand', 'https://flagcdn.com/lu.svg'),
            ('Royaume-Uni', 'GB', ${continentMap['EU']}, 'GBP', 'Anglais', 'https://flagcdn.com/gb.svg'),
            ('Irlande', 'IE', ${continentMap['EU']}, 'EUR', 'Anglais/Irlandais', 'https://flagcdn.com/ie.svg'),
            ('États-Unis', 'US', ${continentMap['NA']}, 'USD', 'Anglais', 'https://flagcdn.com/us.svg'),
            ('Australie', 'AU', ${continentMap['OC']}, 'AUD', 'Anglais', 'https://flagcdn.com/au.svg'),
            ('Nouvelle-Zélande', 'NZ', ${continentMap['OC']}, 'NZD', 'Anglais', 'https://flagcdn.com/nz.svg'),
            ('Japon', 'JP', ${continentMap['AS']}, 'JPY', 'Japonais', 'https://flagcdn.com/jp.svg'),
            ('Singapour', 'SG', ${continentMap['AS']}, 'SGD', 'Anglais/Chinois/Malais', 'https://flagcdn.com/sg.svg'),
            ('Émirats arabes unis', 'AE', ${continentMap['AS']}, 'AED', 'Arabe', 'https://flagcdn.com/ae.svg'),
            ('Mexique', 'MX', ${continentMap['NA']}, 'MXN', 'Espagnol', 'https://flagcdn.com/mx.svg'),
            ('Brésil', 'BR', ${continentMap['SA']}, 'BRL', 'Portugais', 'https://flagcdn.com/br.svg')
            ON CONFLICT DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "country" WHERE "iso_code" IN ('FR','CA','CH','DE','ES','IT','PT','BE','NL','LU','GB','IE','US','AU','NZ','JP','SG','AE','MX','BR');`);
        await queryRunner.query(`DELETE FROM "continent" WHERE "iso_code" IN ('EU','NA','SA','AS','OC');`);
    }
}
