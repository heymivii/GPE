import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProcedureTracking1760002259232
  implements MigrationInterface
{
  name = 'CreateProcedureTracking1760002259232';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "procedure_tracking" ("tracking_id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'in_progress', "start_date" date, "end_date" date, "comment" text, "user_id" integer NOT NULL, "admin_procedure_id" integer NOT NULL, CONSTRAINT "PK_bba633e283332a1e6f70456c4e3" PRIMARY KEY ("tracking_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "procedure_tracking" ADD CONSTRAINT "FK_c34a3fe3d910f7c9f8e60b6d597" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "procedure_tracking" ADD CONSTRAINT "FK_288e66bed362bcb73bd28631101" FOREIGN KEY ("admin_procedure_id") REFERENCES "admin_procedure"("admin_procedure_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "procedure_tracking" DROP CONSTRAINT "FK_288e66bed362bcb73bd28631101"`,
    );
    await queryRunner.query(
      `ALTER TABLE "procedure_tracking" DROP CONSTRAINT "FK_c34a3fe3d910f7c9f8e60b6d597"`,
    );
    await queryRunner.query(`DROP TABLE "procedure_tracking"`);
  }
}
