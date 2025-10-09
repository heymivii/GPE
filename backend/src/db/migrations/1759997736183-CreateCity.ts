import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCity1759997736183 implements MigrationInterface {
    name = 'CreateCity1759997736183'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "city" ("city_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "latitude" numeric(10,8), "longitude" numeric(11,8), "population" integer, "country_id" integer NOT NULL, CONSTRAINT "PK_bae511dd6a3e9d5a22331fc0fa9" PRIMARY KEY ("city_id"))`);
        await queryRunner.query(`ALTER TABLE "city" ADD CONSTRAINT "FK_08af2eeb576770524fa05e26f39" FOREIGN KEY ("country_id") REFERENCES "country"("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "city" DROP CONSTRAINT "FK_08af2eeb576770524fa05e26f39"`);
        await queryRunner.query(`DROP TABLE "city"`);
    }

}
