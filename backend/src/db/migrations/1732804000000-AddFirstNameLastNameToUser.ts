import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFirstNameLastNameToUser1732804000000 implements MigrationInterface {
  name = 'AddFirstNameLastNameToUser1732804000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter les colonnes first_name et last_name
    await queryRunner.query(`
      ALTER TABLE "app_user" 
      ADD COLUMN "first_name" VARCHAR(50),
      ADD COLUMN "last_name" VARCHAR(50)
    `);

    // Migrer les données existantes : séparer full_name en first_name et last_name
    await queryRunner.query(`
      UPDATE "app_user"
      SET 
        "first_name" = SPLIT_PART("full_name", ' ', 1),
        "last_name" = CASE 
          WHEN LENGTH(TRIM("full_name")) - LENGTH(REPLACE(TRIM("full_name"), ' ', '')) >= 1 
          THEN SUBSTRING("full_name" FROM POSITION(' ' IN "full_name") + 1)
          ELSE ''
        END
      WHERE "full_name" IS NOT NULL
    `);

    console.log('✅ Colonnes first_name et last_name ajoutées avec succès');
    console.log('✅ Données migrées depuis full_name');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restaurer full_name depuis first_name et last_name avant de supprimer
    await queryRunner.query(`
      UPDATE "app_user"
      SET "full_name" = CONCAT("first_name", ' ', "last_name")
      WHERE "first_name" IS NOT NULL OR "last_name" IS NOT NULL
    `);

    // Supprimer les colonnes
    await queryRunner.query(`
      ALTER TABLE "app_user" 
      DROP COLUMN "first_name",
      DROP COLUMN "last_name"
    `);

    console.log('✅ Migration annulée : colonnes first_name et last_name supprimées');
  }
}
