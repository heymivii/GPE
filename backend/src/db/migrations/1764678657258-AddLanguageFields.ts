import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLanguageFields1764678657258 implements MigrationInterface {
    name = 'AddLanguageFields1764678657258'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app_user" ADD "mother_tongue" character varying`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD "spoken_languages" text array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app_user" DROP COLUMN "spoken_languages"`);
        await queryRunner.query(`ALTER TABLE "app_user" DROP COLUMN "mother_tongue"`);
    }
}
