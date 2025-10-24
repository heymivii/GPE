import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateForumMessage1760002692174 implements MigrationInterface {
  name = 'CreateForumMessage1760002692174';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "forum_message" ("message_id" SERIAL NOT NULL, "content" text NOT NULL, "sent_at" TIMESTAMP NOT NULL DEFAULT now(), "topic_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_28629008563959a4a17344ee223" PRIMARY KEY ("message_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_message" ADD CONSTRAINT "FK_bb9e67251430d09539f97b67095" FOREIGN KEY ("topic_id") REFERENCES "forum_topic"("topic_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_message" ADD CONSTRAINT "FK_f44374405c3512cd5d7f1aeadd9" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forum_message" DROP CONSTRAINT "FK_f44374405c3512cd5d7f1aeadd9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_message" DROP CONSTRAINT "FK_bb9e67251430d09539f97b67095"`,
    );
    await queryRunner.query(`DROP TABLE "forum_message"`);
  }
}
