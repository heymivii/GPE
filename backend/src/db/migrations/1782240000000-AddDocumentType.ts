import { MigrationInterface, QueryRunner } from 'typeorm';

/** Type prédéfini de document (passport, id_card, visa…) pour un coffre lisible. */
export class AddDocumentType1782240000000 implements MigrationInterface {
  name = 'AddDocumentType1782240000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_document" ADD COLUMN IF NOT EXISTS "doc_type" VARCHAR(40) NOT NULL DEFAULT 'other'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_document" DROP COLUMN IF EXISTS "doc_type"`,
    );
  }
}
