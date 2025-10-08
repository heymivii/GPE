import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGuide1759927032622 implements MigrationInterface {
    name = 'CreateGuide1759927032622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "guide" ("id_guide" SERIAL NOT NULL, "titre" character varying(255) NOT NULL, "contenu" text NOT NULL, "type_guide" character varying(50), "date_creation" TIMESTAMP NOT NULL DEFAULT now(), "id_pays" integer NOT NULL, CONSTRAINT "PK_3f3c8b45ca95832e27179535a2b" PRIMARY KEY ("id_guide"))`);
        await queryRunner.query(`ALTER TABLE "guide" ADD CONSTRAINT "FK_88229f765cb671d60588e091ea2" FOREIGN KEY ("id_pays") REFERENCES "pays"("id_pays") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guide" DROP CONSTRAINT "FK_88229f765cb671d60588e091ea2"`);
        await queryRunner.query(`DROP TABLE "guide"`);
    }

}
