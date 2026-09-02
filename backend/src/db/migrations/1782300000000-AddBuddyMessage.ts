import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBuddyMessage1782300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "buddy_message" (
        "id_buddy_message"   SERIAL       NOT NULL,
        "content"            TEXT         NOT NULL,
        "sent_at"            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "is_read"            BOOLEAN      NOT NULL DEFAULT false,
        "contact_request_id" INTEGER      NOT NULL,
        "sender_id"          INTEGER      NOT NULL,
        CONSTRAINT "PK_buddy_message" PRIMARY KEY ("id_buddy_message"),
        CONSTRAINT "FK_buddy_message_contact_request" FOREIGN KEY ("contact_request_id") REFERENCES "buddy_contact_request"("id_buddy_contact_request") ON DELETE CASCADE,
        CONSTRAINT "FK_buddy_message_sender" FOREIGN KEY ("sender_id") REFERENCES "app_user"("id_user") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "buddy_message"`);
  }
}
//jd