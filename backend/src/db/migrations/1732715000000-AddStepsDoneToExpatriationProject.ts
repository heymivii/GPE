import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStepsDoneToExpatriationProject1732715000000 implements MigrationInterface {
    name = 'AddStepsDoneToExpatriationProject1732715000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "expatriation_project" 
            ADD COLUMN "steps_done" TEXT
        `);
        
        await queryRunner.query(`
            COMMENT ON COLUMN "expatriation_project"."steps_done" 
            IS 'Démarches déjà effectuées par l''utilisateur, stockées sous forme de chaîne séparée par des virgules'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "expatriation_project" 
            DROP COLUMN "steps_done"
        `);
    }
}
