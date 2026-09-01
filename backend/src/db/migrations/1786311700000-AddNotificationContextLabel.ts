import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Complète (context_type, context_id) par un libellé optionnel — ex. le prénom
 * de la personne visée par un contexte « user » — pour éviter au front de
 * dépendre d'un état déjà en cache (ex. l'affichage du nom d'un contact tant
 * qu'aucune conversation n'existe encore avec lui).
 */
export class AddNotificationContextLabel1786311700000
  implements MigrationInterface
{
  name = 'AddNotificationContextLabel1786311700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "context_label" varchar(120)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN IF EXISTS "context_label"`,
    );
  }
}
