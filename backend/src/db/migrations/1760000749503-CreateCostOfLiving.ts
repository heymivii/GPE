import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCostOfLiving1760000749503 implements MigrationInterface {
  name = 'CreateCostOfLiving1760000749503';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cost_of_living" ("cost_id" SERIAL NOT NULL, "avg_housing" numeric(10,2), "monthly_transport" numeric(10,2), "food" numeric(10,2), "public_services" numeric(10,2), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "city_id" integer NOT NULL, CONSTRAINT "PK_341d8ec7c674b3045847660e5ce" PRIMARY KEY ("cost_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cost_of_living" ADD CONSTRAINT "FK_0582b7c576e0c9a3c7cffd092d1" FOREIGN KEY ("city_id") REFERENCES "city"("city_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cost_of_living" DROP CONSTRAINT "FK_0582b7c576e0c9a3c7cffd092d1"`,
    );
    await queryRunner.query(`DROP TABLE "cost_of_living"`);
  }
}
