import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastLoginToUser1781619876802 implements MigrationInterface {
    name = 'AddLastLoginToUser1781619876802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app_user" ADD "last_login_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app_user" DROP COLUMN "last_login_at"`);
    }

}
