import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Lot de démarrage de mots interdits (FR + EN, sévérités variées).
 * high/critical = publication bloquée ; low/medium = publiée mais flaggée + avertissement.
 * La liste complète (LDNOOBW fr+en) pourra être importée ensuite via l'admin.
 * Insert-only (ON CONFLICT DO NOTHING) : ne réécrit jamais les réglages admin.
 */
export class SeedForbiddenWords1782180000000 implements MigrationInterface {
  name = 'SeedForbiddenWords1782180000000';

  private readonly seed: { word: string; severity: string }[] = [
    // critical — haine / slurs → bloqué
    { word: 'bougnoule', severity: 'critical' },
    { word: 'negro', severity: 'critical' },
    { word: 'nigger', severity: 'critical' },
    { word: 'faggot', severity: 'critical' },
    // high — insultes fortes / menaces → bloqué
    { word: 'enculé', severity: 'high' },
    { word: 'fils de pute', severity: 'high' },
    { word: 'ntm', severity: 'high' },
    { word: 'motherfucker', severity: 'high' },
    // medium — modéré → publié mais flaggé
    { word: 'connard', severity: 'medium' },
    { word: 'salope', severity: 'medium' },
    { word: 'asshole', severity: 'medium' },
    { word: 'bitch', severity: 'medium' },
    // low — léger → publié mais flaggé
    { word: 'merde', severity: 'low' },
    { word: 'putain', severity: 'low' },
    { word: 'damn', severity: 'low' },
    { word: 'crap', severity: 'low' },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const { word, severity } of this.seed) {
      await queryRunner.query(
        `INSERT INTO "forbidden_word" ("word", "severity", "is_active")
         VALUES ($1, $2, TRUE)
         ON CONFLICT ("word") DO NOTHING`,
        [word, severity],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const words = this.seed.map((s) => s.word);
    await queryRunner.query(
      `DELETE FROM "forbidden_word" WHERE "word" = ANY($1)`,
      [words],
    );
  }
}
