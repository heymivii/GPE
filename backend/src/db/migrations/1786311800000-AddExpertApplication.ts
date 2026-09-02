import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Candidatures au statut d'expert vérifié.
 *
 * Les experts affichés sur /experts étaient promus à la main en base : aucun
 * parcours ne permettait de postuler, et rien n'expliquait leur provenance.
 * Cette table porte la demande, sa pièce justificative (chiffrée sur disque,
 * seule la clé aléatoire est stockée ici) et la décision du modérateur.
 *
 * Migration écrite à la main (cf. AddPrivateMessage).
 */
export class AddExpertApplication1786311800000 implements MigrationInterface {
  name = 'AddExpertApplication1786311800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "expert_application" (
        "id_expert_application" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "country_id" integer,
        "expert_title" character varying(120) NOT NULL,
        "motivation" text NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "diploma_original_name" character varying(255) NOT NULL,
        "diploma_mime_type" character varying(100) NOT NULL,
        "diploma_size_bytes" integer NOT NULL,
        "diploma_storage_key" character varying(100) NOT NULL,
        "review_note" text,
        "reviewed_by" integer,
        "reviewed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_expert_application" PRIMARY KEY ("id_expert_application")
      )`,
    );

    // File de modération : on lit presque toujours « les candidatures en attente ».
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_expert_application_status"
       ON "expert_application" ("status", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_expert_application_user"
       ON "expert_application" ("user_id")`,
    );

    await queryRunner.query(
      `ALTER TABLE "expert_application"
       ADD CONSTRAINT "FK_expert_application_user"
       FOREIGN KEY ("user_id") REFERENCES "app_user"("id_user")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    // Le pays peut disparaître sans invalider la candidature.
    await queryRunner.query(
      `ALTER TABLE "expert_application"
       ADD CONSTRAINT "FK_expert_application_country"
       FOREIGN KEY ("country_id") REFERENCES "country"("id_country")
       ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expert_application" DROP CONSTRAINT IF EXISTS "FK_expert_application_country"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expert_application" DROP CONSTRAINT IF EXISTS "FK_expert_application_user"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_expert_application_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_expert_application_status"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "expert_application"`);
  }
}
