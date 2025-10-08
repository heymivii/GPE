import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUser1759925734061 implements MigrationInterface {
    name = 'CreateUser1759925734061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "utilisateur" ("id_utilisateur" SERIAL NOT NULL, "nom" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "mot_de_passe" character varying(255) NOT NULL, "role" character varying(50) NOT NULL DEFAULT 'utilisateur', "date_creation" TIMESTAMP NOT NULL DEFAULT now(), "id_pays_origine" integer, "id_pays_destination" integer, CONSTRAINT "UQ_e1136325a6b28e2a02b81b2f5e1" UNIQUE ("email"), CONSTRAINT "PK_d719cc17b2e613463e34fbae395" PRIMARY KEY ("id_utilisateur"))`);
        await queryRunner.query(`ALTER TABLE "utilisateur" ADD CONSTRAINT "FK_82cebf0fb3a3ab856e1a8320dd6" FOREIGN KEY ("id_pays_origine") REFERENCES "pays"("id_pays") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "utilisateur" ADD CONSTRAINT "FK_c95a53a996c3ea15c71610d4ee7" FOREIGN KEY ("id_pays_destination") REFERENCES "pays"("id_pays") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "utilisateur" DROP CONSTRAINT "FK_c95a53a996c3ea15c71610d4ee7"`);
        await queryRunner.query(`ALTER TABLE "utilisateur" DROP CONSTRAINT "FK_82cebf0fb3a3ab856e1a8320dd6"`);
        await queryRunner.query(`DROP TABLE "utilisateur"`);
    }

}
