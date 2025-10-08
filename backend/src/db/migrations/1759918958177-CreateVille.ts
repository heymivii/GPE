import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVille1759918958177 implements MigrationInterface {
    name = 'CreateVille1759918958177'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ville" ("id_ville" SERIAL NOT NULL, "nom_ville" character varying(100) NOT NULL, "latitude" numeric(10,8), "longitude" numeric(11,8), "population" integer, "id_pays" integer NOT NULL, CONSTRAINT "PK_3801e6c5f63242cfb129437d834" PRIMARY KEY ("id_ville"))`);
        await queryRunner.query(`ALTER TABLE "ville" ADD CONSTRAINT "FK_c06adb52f95ea9924e0649bf24d" FOREIGN KEY ("id_pays") REFERENCES "pays"("id_pays") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ville" DROP CONSTRAINT "FK_c06adb52f95ea9924e0649bf24d"`);
        await queryRunner.query(`DROP TABLE "ville"`);
    }

}
