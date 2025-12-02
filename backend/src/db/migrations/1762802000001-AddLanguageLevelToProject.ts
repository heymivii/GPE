import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLanguageLevelToProject1762802000001 implements MigrationInterface {
    name = 'AddLanguageLevelToProject1762802000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expatriation_project" ADD "language_level" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expatriation_project" DROP COLUMN "language_level"`);
    }
}
