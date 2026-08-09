import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * F2 — Suivi de discussions. Table de liaison user ↔ topic, avec unicité (user_id, topic_id).
 *
 * NB : `migration:generate` produisait ici un diff parasite (renommage de FK, suppression
 * du CHECK forbidden_word, de plusieurs index, changements de ON DELETE sur city/country/…)
 * car ce dépôt utilise des migrations écrites à la main. On ne garde donc QUE la création de
 * la nouvelle table pour respecter la contrainte « ne casse rien ».
 */
export class AddForumTopicFollow1786311307928 implements MigrationInterface {
  name = 'AddForumTopicFollow1786311307928';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "forum_topic_follow" (
        "id_forum_topic_follow" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "topic_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_forum_topic_follow" PRIMARY KEY ("id_forum_topic_follow")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_forum_topic_follow_user_topic" ON "forum_topic_follow" ("user_id", "topic_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_topic_follow" ADD CONSTRAINT "FK_forum_topic_follow_user" FOREIGN KEY ("user_id") REFERENCES "app_user"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_topic_follow" ADD CONSTRAINT "FK_forum_topic_follow_topic" FOREIGN KEY ("topic_id") REFERENCES "forum_topic"("id_forum_topic") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forum_topic_follow" DROP CONSTRAINT "FK_forum_topic_follow_topic"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_topic_follow" DROP CONSTRAINT "FK_forum_topic_follow_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_forum_topic_follow_user_topic"`,
    );
    await queryRunner.query(`DROP TABLE "forum_topic_follow"`);
  }
}
