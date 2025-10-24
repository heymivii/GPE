import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContinent1759996870702 implements MigrationInterface {
  name = 'CreateContinent1759996870702';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "continent" ("continent_id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "iso_code" character(2) NOT NULL, CONSTRAINT "UQ_17aebd954bc31323f680569dd0e" UNIQUE ("iso_code"), CONSTRAINT "PK_03663b1f6ec0979fe81361b0bde" PRIMARY KEY ("continent_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "continent"`);
  }
}
