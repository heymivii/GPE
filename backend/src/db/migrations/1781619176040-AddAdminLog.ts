import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminLog1781619176040 implements MigrationInterface {
    name = 'AddAdminLog1781619176040'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "procedure_tracking" DROP CONSTRAINT "FK_85bb443d1bf1f34f95f7ab5d621"`);
        await queryRunner.query(`CREATE TABLE "admin_log" ("id_admin_log" SERIAL NOT NULL, "action" character varying(50) NOT NULL, "entity_type" character varying(50) NOT NULL, "entity_id" character varying(255) NOT NULL, "details" text, "user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c606672c4cb8ba954723660330f" PRIMARY KEY ("id_admin_log"))`);
        await queryRunner.query(`ALTER TABLE "procedure_tracking" ADD CONSTRAINT "FK_85bb443d1bf1f34f95f7ab5d621" FOREIGN KEY ("project_id") REFERENCES "expatriation_project"("id_project") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin_log" ADD CONSTRAINT "FK_1157169f1572e9a07329361d306" FOREIGN KEY ("user_id") REFERENCES "app_user"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin_log" DROP CONSTRAINT "FK_1157169f1572e9a07329361d306"`);
        await queryRunner.query(`ALTER TABLE "procedure_tracking" DROP CONSTRAINT "FK_85bb443d1bf1f34f95f7ab5d621"`);
        await queryRunner.query(`DROP TABLE "admin_log"`);
        await queryRunner.query(`ALTER TABLE "procedure_tracking" ADD CONSTRAINT "FK_85bb443d1bf1f34f95f7ab5d621" FOREIGN KEY ("project_id") REFERENCES "expatriation_project"("id_project") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
