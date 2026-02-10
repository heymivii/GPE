import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCityEntity1770649372589 implements MigrationInterface {
    name = 'UpdateCityEntity1770649372589'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Only add the new columns mandated by the feature requirements
        // We skip dropping/renaming other columns to prevent data loss due to schema drift
        await queryRunner.query(`ALTER TABLE "city" ADD "slug" character varying(150)`);
        await queryRunner.query(`ALTER TABLE "city" ADD CONSTRAINT "UQ_city_slug" UNIQUE ("slug")`);
        await queryRunner.query(`ALTER TABLE "city" ADD "timezone" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "city" ADD "is_capital" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "city" ADD "priority" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "city" ADD "image_url" text`);
        await queryRunner.query(`ALTER TABLE "city" ADD "description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "image_url"`);
        await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "priority"`);
        await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "is_capital"`);
        await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "timezone"`);
        await queryRunner.query(`ALTER TABLE "city" DROP CONSTRAINT "UQ_city_slug"`);
        await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "slug"`);
    }

}
