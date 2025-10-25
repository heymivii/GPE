import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateForumTopic1760002458351 implements MigrationInterface {
  name = 'CreateForumTopic1760002458351';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "forum_topic" ("topic_id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "category" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "country_id" integer NOT NULL, CONSTRAINT "PK_d9bde06a3de1222464d99715a18" PRIMARY KEY ("topic_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_topic" ADD CONSTRAINT "FK_8c676de0c6ad474ceebdb547571" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_topic" ADD CONSTRAINT "FK_476a9c58c8cb88ee9c1f5fdd1db" FOREIGN KEY ("country_id") REFERENCES "country"("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forum_topic" DROP CONSTRAINT "FK_476a9c58c8cb88ee9c1f5fdd1db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_topic" DROP CONSTRAINT "FK_8c676de0c6ad474ceebdb547571"`,
    );
    await queryRunner.query(`DROP TABLE "forum_topic"`);
  }
}
