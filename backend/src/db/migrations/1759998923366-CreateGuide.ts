import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGuide1759998923366 implements MigrationInterface {
  name = 'CreateGuide1759998923366';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "guide" ("guide_id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "content" text NOT NULL, "guide_type" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "country_id" integer NOT NULL, CONSTRAINT "PK_674fd0a73f788fee271616ca829" PRIMARY KEY ("guide_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "guide" ADD CONSTRAINT "FK_c6a9522aa1c4ad8a6e209a82991" FOREIGN KEY ("country_id") REFERENCES "country"("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "guide" DROP CONSTRAINT "FK_c6a9522aa1c4ad8a6e209a82991"`,
    );
    await queryRunner.query(`DROP TABLE "guide"`);
  }
}
