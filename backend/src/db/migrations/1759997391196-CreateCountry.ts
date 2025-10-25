import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCountry1759997391196 implements MigrationInterface {
  name = 'CreateCountry1759997391196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "country" ("country_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "iso_code" character(2) NOT NULL, "currency" character varying(50), "language" text, "visa_info" text, "flag" character varying(255), "continent_id" integer NOT NULL, CONSTRAINT "UQ_d8a20ea179fa742827ea45f270e" UNIQUE ("iso_code"), CONSTRAINT "PK_220fe368500f103cf873b01f159" PRIMARY KEY ("country_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "country" ADD CONSTRAINT "FK_5029f36b1de4667226bd738c404" FOREIGN KEY ("continent_id") REFERENCES "continent"("continent_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "country" DROP CONSTRAINT "FK_5029f36b1de4667226bd738c404"`,
    );
    await queryRunner.query(`DROP TABLE "country"`);
  }
}
