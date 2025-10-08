import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRessource1759928160897 implements MigrationInterface {
    name = 'CreateRessource1759928160897'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ressource" ("id_ressource" SERIAL NOT NULL, "titre" character varying(255) NOT NULL, "url" character varying(500), "type_ressource" character varying(50), "date_creation" TIMESTAMP NOT NULL DEFAULT now(), "id_pays" integer NOT NULL, CONSTRAINT "PK_3334cff53fb2622a04bddd64652" PRIMARY KEY ("id_ressource"))`);
        await queryRunner.query(`ALTER TABLE "ressource" ADD CONSTRAINT "FK_4bafe73628ee1fa5f7345c67837" FOREIGN KEY ("id_pays") REFERENCES "pays"("id_pays") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ressource" DROP CONSTRAINT "FK_4bafe73628ee1fa5f7345c67837"`);
        await queryRunner.query(`DROP TABLE "ressource"`);
    }

}
