import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCoutVie1759928756992 implements MigrationInterface {
    name = 'CreateCoutVie1759928756992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cout_vie" ("id_cout" SERIAL NOT NULL, "logement_moyen" numeric(10,2), "transport_mensuel" numeric(10,2), "alimentation" numeric(10,2), "services_public" numeric(10,2), "date_maj" TIMESTAMP NOT NULL DEFAULT now(), "id_ville" integer NOT NULL, CONSTRAINT "PK_e1a9c8ee28e9e3bbd0e9631da3f" PRIMARY KEY ("id_cout"))`);
        await queryRunner.query(`ALTER TABLE "cout_vie" ADD CONSTRAINT "FK_8d8a36bc3a690bf156c2dc2296b" FOREIGN KEY ("id_ville") REFERENCES "ville"("id_ville") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cout_vie" DROP CONSTRAINT "FK_8d8a36bc3a690bf156c2dc2296b"`);
        await queryRunner.query(`DROP TABLE "cout_vie"`);
    }

}
