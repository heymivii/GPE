import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobOffer1760001792195 implements MigrationInterface {
    name = 'CreateJobOffer1760001792195'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "job_offer" ("job_offer_id" SERIAL NOT NULL, "job_title" character varying(255) NOT NULL, "company" character varying(255), "avg_salary" numeric(10,2), "description" text, "publication_date" date NOT NULL DEFAULT ('now'::text)::date, "city_id" integer NOT NULL, "sector_id" integer NOT NULL, CONSTRAINT "PK_31def82e3c7ae09390b00d6eb02" PRIMARY KEY ("job_offer_id"))`);
        await queryRunner.query(`ALTER TABLE "job_offer" ADD CONSTRAINT "FK_7049ab4881e9d2c68edd4b72bd7" FOREIGN KEY ("city_id") REFERENCES "city"("city_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_offer" ADD CONSTRAINT "FK_2d9e3b89c230a2879a3c3519c89" FOREIGN KEY ("sector_id") REFERENCES "industry_sector"("sector_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_offer" DROP CONSTRAINT "FK_2d9e3b89c230a2879a3c3519c89"`);
        await queryRunner.query(`ALTER TABLE "job_offer" DROP CONSTRAINT "FK_7049ab4881e9d2c68edd4b72bd7"`);
        await queryRunner.query(`DROP TABLE "job_offer"`);
    }

}
