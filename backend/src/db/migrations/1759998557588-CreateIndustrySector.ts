import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIndustrySector1759998557588 implements MigrationInterface {
  name = 'CreateIndustrySector1759998557588';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "industry_sector" ("sector_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, CONSTRAINT "PK_b38b22a4597322510ce16f31c83" PRIMARY KEY ("sector_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "industry_sector"`);
  }
}
