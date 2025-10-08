import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOffreEmploi1759933283464 implements MigrationInterface {
    name = 'CreateOffreEmploi1759933283464'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "offre_emploi" ("id_offre" SERIAL NOT NULL, "titre_poste" character varying(255) NOT NULL, "entreprise" character varying(255), "salaire_moyen" numeric(10,2), "description" text, "date_publication" date NOT NULL DEFAULT ('now'::text)::date, "id_ville" integer NOT NULL, "id_secteur" integer NOT NULL, CONSTRAINT "PK_eb382b2096383a3e05e03388b3b" PRIMARY KEY ("id_offre"))`);
        await queryRunner.query(`ALTER TABLE "offre_emploi" ADD CONSTRAINT "FK_c36a81aa0949da6ed5d7433bb6e" FOREIGN KEY ("id_ville") REFERENCES "ville"("id_ville") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offre_emploi" ADD CONSTRAINT "FK_dd8c91239376b006f013586ea23" FOREIGN KEY ("id_secteur") REFERENCES "secteur_activite"("id_secteur") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offre_emploi" DROP CONSTRAINT "FK_dd8c91239376b006f013586ea23"`);
        await queryRunner.query(`ALTER TABLE "offre_emploi" DROP CONSTRAINT "FK_c36a81aa0949da6ed5d7433bb6e"`);
        await queryRunner.query(`DROP TABLE "offre_emploi"`);
    }

}
