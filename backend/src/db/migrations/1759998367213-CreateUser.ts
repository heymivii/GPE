import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUser1759998367213 implements MigrationInterface {
  name = 'CreateUser1759998367213';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("user_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" character varying(50) NOT NULL DEFAULT 'user', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "origin_country_id" integer, "destination_country_id" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_bdaf0b0a015d87a841d74d28948" FOREIGN KEY ("origin_country_id") REFERENCES "country"("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_95ba8b4778258db8d76d1a8144d" FOREIGN KEY ("destination_country_id") REFERENCES "country"("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_95ba8b4778258db8d76d1a8144d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_bdaf0b0a015d87a841d74d28948"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
