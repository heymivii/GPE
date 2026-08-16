import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * F4 — Notation de l'aide reçue. Table support_rating (rater → rated_user, sur un message),
 * étoiles 1..5, unicité (rater, message). Migration écrite à la main (cf. AddForumTopicFollow).
 */
export class AddSupportRating1786311500000 implements MigrationInterface {
  name = 'AddSupportRating1786311500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "support_rating" (
        "id_support_rating" SERIAL NOT NULL,
        "rater_id" integer NOT NULL,
        "rated_user_id" integer NOT NULL,
        "message_id" integer,
        "stars" smallint NOT NULL,
        "comment" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_support_rating" PRIMARY KEY ("id_support_rating"),
        CONSTRAINT "CHK_support_rating_stars" CHECK ("stars" >= 1 AND "stars" <= 5)
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_support_rating_rater_message" ON "support_rating" ("rater_id", "message_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_rating" ADD CONSTRAINT "FK_support_rating_rater" FOREIGN KEY ("rater_id") REFERENCES "app_user"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_rating" ADD CONSTRAINT "FK_support_rating_rated_user" FOREIGN KEY ("rated_user_id") REFERENCES "app_user"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_rating" ADD CONSTRAINT "FK_support_rating_message" FOREIGN KEY ("message_id") REFERENCES "forum_message"("id_forum_message") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "support_rating" DROP CONSTRAINT "FK_support_rating_message"`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_rating" DROP CONSTRAINT "FK_support_rating_rated_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_rating" DROP CONSTRAINT "FK_support_rating_rater"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_support_rating_rater_message"`,
    );
    await queryRunner.query(`DROP TABLE "support_rating"`);
  }
}
