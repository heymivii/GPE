import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExperience1760003195772 implements MigrationInterface {
  name = 'CreateExperience1760003195772';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "experience" ("experience_id" SERIAL NOT NULL, "title" character varying(255), "description" text, "rating" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "country_id" integer NOT NULL, CONSTRAINT "CHK_c6f1807d063dd814eb96e63b45" CHECK ("rating" >= 1 AND "rating" <= 5), CONSTRAINT "PK_6af2ebf3f4ca1c9df23f721abbe" PRIMARY KEY ("experience_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "experience" ADD CONSTRAINT "FK_62c0623650986849f3fc1d148e7" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "experience" ADD CONSTRAINT "FK_20a0d6b01fbb6b045344a1c7b9c" FOREIGN KEY ("country_id") REFERENCES "country"("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "experience" DROP CONSTRAINT "FK_20a0d6b01fbb6b045344a1c7b9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "experience" DROP CONSTRAINT "FK_62c0623650986849f3fc1d148e7"`,
    );
    await queryRunner.query(`DROP TABLE "experience"`);
  }
}
