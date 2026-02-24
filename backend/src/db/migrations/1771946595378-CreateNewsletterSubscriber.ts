import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNewsletterSubscriber1771946595378 implements MigrationInterface {
    name = 'CreateNewsletterSubscriber1771946595378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."newsletter_subscriber_status_enum" AS ENUM('ACTIVE', 'UNSUBSCRIBED')`);
        await queryRunner.query(`CREATE TABLE "newsletter_subscriber" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "status" "public"."newsletter_subscriber_status_enum" NOT NULL DEFAULT 'ACTIVE', "source" character varying NOT NULL DEFAULT 'landing_page', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c7c77fa243eefb2415b13f1b4e4" UNIQUE ("email"), CONSTRAINT "PK_673f5f9a16ef0e216059224e02f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "newsletter_subscriber"`);
        await queryRunner.query(`DROP TYPE "public"."newsletter_subscriber_status_enum"`);
    }
}
