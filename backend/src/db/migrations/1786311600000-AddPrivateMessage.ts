import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * F3 — Messagerie privée. Table private_message (paire sender/recipient, pas de table
 * conversation). Migration écrite à la main (cf. AddForumTopicFollow).
 */
export class AddPrivateMessage1786311600000 implements MigrationInterface {
  name = 'AddPrivateMessage1786311600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "private_message" (
        "id_private_message" SERIAL NOT NULL,
        "sender_id" integer NOT NULL,
        "recipient_id" integer NOT NULL,
        "content" text NOT NULL,
        "sent_at" TIMESTAMP NOT NULL DEFAULT now(),
        "read_at" TIMESTAMP,
        "is_moderated" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_private_message" PRIMARY KEY ("id_private_message")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_private_message_pair" ON "private_message" ("sender_id", "recipient_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_private_message_recipient_unread" ON "private_message" ("recipient_id", "read_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "private_message" ADD CONSTRAINT "FK_private_message_sender" FOREIGN KEY ("sender_id") REFERENCES "app_user"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "private_message" ADD CONSTRAINT "FK_private_message_recipient" FOREIGN KEY ("recipient_id") REFERENCES "app_user"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "private_message" DROP CONSTRAINT "FK_private_message_recipient"`,
    );
    await queryRunner.query(
      `ALTER TABLE "private_message" DROP CONSTRAINT "FK_private_message_sender"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_private_message_recipient_unread"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_private_message_pair"`);
    await queryRunner.query(`DROP TABLE "private_message"`);
  }
}
