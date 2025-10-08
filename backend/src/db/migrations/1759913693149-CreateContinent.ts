import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateContinent1759913693149 implements MigrationInterface {
    name = 'CreateContinent1759913693149'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`CREATE TABLE "continent" ("id_continent" SERIAL NOT NULL, "nom_continent" character varying(50) NOT NULL, "code_iso" character(2) NOT NULL, CONSTRAINT "UQ_46f7a10af66dab13854f896bbc8" UNIQUE ("code_iso"), CONSTRAINT "PK_aabbbae38b59cfc94b8bf293400" PRIMARY KEY ("id_continent"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "continent"`);
        
    }

}
