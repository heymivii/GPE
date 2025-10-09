import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAdminProcedure1760002001983 implements MigrationInterface {
    name = 'CreateAdminProcedure1760002001983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin_procedure" ("admin_procedure_id" SERIAL NOT NULL, "procedure_type" character varying(100) NOT NULL, "description" text, "required_documents" text, "average_delay_days" integer, "country_id" integer NOT NULL, CONSTRAINT "PK_81ff589bf24f33b242cff2e1631" PRIMARY KEY ("admin_procedure_id"))`);
        await queryRunner.query(`ALTER TABLE "admin_procedure" ADD CONSTRAINT "FK_94bde5dd4c942c6a788bfbe847b" FOREIGN KEY ("country_id") REFERENCES "country"("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin_procedure" DROP CONSTRAINT "FK_94bde5dd4c942c6a788bfbe847b"`);
        await queryRunner.query(`DROP TABLE "admin_procedure"`);
    }

}
