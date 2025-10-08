import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChecklist1759927618262 implements MigrationInterface {
    name = 'CreateChecklist1759927618262'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "checklist" ("id_checklist" SERIAL NOT NULL, "titre" character varying(255) NOT NULL, "etapes" jsonb, "date_creation" TIMESTAMP NOT NULL DEFAULT now(), "id_pays" integer NOT NULL, CONSTRAINT "PK_2e596adaf16befad88417e4a3ee" PRIMARY KEY ("id_checklist"))`);
        await queryRunner.query(`ALTER TABLE "checklist" ADD CONSTRAINT "FK_8b08477bedd507617662e1dc5bd" FOREIGN KEY ("id_pays") REFERENCES "pays"("id_pays") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checklist" DROP CONSTRAINT "FK_8b08477bedd507617662e1dc5bd"`);
        await queryRunner.query(`DROP TABLE "checklist"`);
    }

}
