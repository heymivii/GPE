import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBuddyContactRequest1782000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "buddy_contact_request" (
        "id_buddy_contact_request" SERIAL NOT NULL,
        "status"       VARCHAR(20)  NOT NULL DEFAULT 'pending',
        "message"      TEXT         NULL,
        "created_at"   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expires_at"   TIMESTAMP    NOT NULL,
        "sender_id"    INTEGER      NOT NULL,
        "recipient_id" INTEGER      NOT NULL,
        "procedure_id" INTEGER      NOT NULL,
        CONSTRAINT "PK_buddy_contact_request" PRIMARY KEY ("id_buddy_contact_request"),
        CONSTRAINT "FK_buddy_contact_sender"    FOREIGN KEY ("sender_id")    REFERENCES "app_user"("id_user") ON DELETE CASCADE,
        CONSTRAINT "FK_buddy_contact_recipient" FOREIGN KEY ("recipient_id") REFERENCES "app_user"("id_user") ON DELETE CASCADE,
        CONSTRAINT "FK_buddy_contact_procedure" FOREIGN KEY ("procedure_id") REFERENCES "admin_procedure"("id_admin_procedure") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "buddy_contact_request"`);
  }
}
