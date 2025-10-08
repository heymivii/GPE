import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePays1759917142589 implements MigrationInterface {
    name = 'CreatePays1759917142589'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pays" ("id_pays" SERIAL NOT NULL, "nom_pays" character varying(100) NOT NULL, "code_iso" character(2) NOT NULL, "devise" character varying(50), "langue" text, "infos_visa" text, "drapeau" character varying(255), "id_continent" integer NOT NULL, CONSTRAINT "UQ_7822f33fb978d56fcc3937d154c" UNIQUE ("code_iso"), CONSTRAINT "PK_fa4834f54d063fb5526c89af4be" PRIMARY KEY ("id_pays"))`);
        await queryRunner.query(`ALTER TABLE "pays" ADD CONSTRAINT "FK_8f6491c0f0664fd7d402e1d42f2" FOREIGN KEY ("id_continent") REFERENCES "continent"("id_continent") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pays" DROP CONSTRAINT "FK_8f6491c0f0664fd7d402e1d42f2"`);
        await queryRunner.query(`DROP TABLE "pays"`);
    }

}
