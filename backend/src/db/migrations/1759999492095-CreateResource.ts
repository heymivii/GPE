import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateResource1759999492095 implements MigrationInterface {
    name = 'CreateResource1759999492095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "resource" ("resource_id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "url" character varying(500), "resource_type" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "country_id" integer NOT NULL, CONSTRAINT "PK_1b95660aa570a827fbe216669e3" PRIMARY KEY ("resource_id"))`);
        await queryRunner.query(`ALTER TABLE "resource" ADD CONSTRAINT "FK_1b2f1a1b85dc8f8af93869019b0" FOREIGN KEY ("country_id") REFERENCES "country"("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "resource" DROP CONSTRAINT "FK_1b2f1a1b85dc8f8af93869019b0"`);
        await queryRunner.query(`DROP TABLE "resource"`);
    }

}
