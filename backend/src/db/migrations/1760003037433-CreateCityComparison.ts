import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCityComparison1760003037433 implements MigrationInterface {
  name = 'CreateCityComparison1760003037433';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "city_comparison" ("comparison_id" SERIAL NOT NULL, "user_id" integer NOT NULL, "city_id" integer NOT NULL, CONSTRAINT "PK_7c483b7dea5cc976e7cad82bd76" PRIMARY KEY ("comparison_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "city_comparison" ADD CONSTRAINT "FK_812e386ed117c745c9f8d8d3e6b" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "city_comparison" ADD CONSTRAINT "FK_718687433b504c27e8cd22af944" FOREIGN KEY ("city_id") REFERENCES "city"("city_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "city_comparison" DROP CONSTRAINT "FK_718687433b504c27e8cd22af944"`,
    );
    await queryRunner.query(
      `ALTER TABLE "city_comparison" DROP CONSTRAINT "FK_812e386ed117c745c9f8d8d3e6b"`,
    );
    await queryRunner.query(`DROP TABLE "city_comparison"`);
  }
}
