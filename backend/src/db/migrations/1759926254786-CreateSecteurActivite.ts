import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSecteurActivite1759926254786 implements MigrationInterface {
    name = 'CreateSecteurActivite1759926254786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "secteur_activite" ("id_secteur" SERIAL NOT NULL, "nom_secteur" character varying(100) NOT NULL, "description" text, CONSTRAINT "PK_646bada5b296a451bc34f13beb8" PRIMARY KEY ("id_secteur"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "secteur_activite"`);
    }

}
