import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStepsDoneToExpatriationProject1732715000000 implements MigrationInterface {
    name = 'AddStepsDoneToExpatriationProject1732715000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajouter la colonne steps_done pour stocker les démarches déjà effectuées
        await queryRunner.query(`
            ALTER TABLE "expatriation_project" 
            ADD COLUMN "steps_done" TEXT
        `);
        
        // Ajouter un commentaire pour documenter la colonne
        await queryRunner.query(`
            COMMENT ON COLUMN "expatriation_project"."steps_done" 
            IS 'Démarches déjà effectuées par l''utilisateur, stockées sous forme de chaîne séparée par des virgules'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer la colonne en cas de rollback
        await queryRunner.query(`
            ALTER TABLE "expatriation_project" 
            DROP COLUMN "steps_done"
        `);
    }
}
