import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOriginCountryToProject1762802000002
  implements MigrationInterface
{
  name = 'AddOriginCountryToProject1762802000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" ADD "id_origin_country" integer`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_project_origin_country" ON "expatriation_project" ("id_origin_country")`,
    );
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" ADD CONSTRAINT "FK_project_origin_country" FOREIGN KEY ("id_origin_country") REFERENCES "country"("id_country") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" DROP CONSTRAINT "FK_project_origin_country"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_project_origin_country"`);
    await queryRunner.query(
      `ALTER TABLE "expatriation_project" DROP COLUMN "id_origin_country"`,
    );
  }
}
