import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChecklist1759999074820 implements MigrationInterface {
    name = 'CreateChecklist1759999074820'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "checklist" ("checklist_id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "steps" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "country_id" integer NOT NULL, CONSTRAINT "PK_20ef79fbd205ffb36f72f000ed2" PRIMARY KEY ("checklist_id"))`);
        await queryRunner.query(`ALTER TABLE "checklist" ADD CONSTRAINT "FK_d352258e8f5055f7cb105db1891" FOREIGN KEY ("country_id") REFERENCES "country"("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checklist" DROP CONSTRAINT "FK_d352258e8f5055f7cb105db1891"`);
        await queryRunner.query(`DROP TABLE "checklist"`);
    }

}
