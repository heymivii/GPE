import { ForbiddenException } from '@nestjs/common';

/**
 * Interrupteur de la génération automatique (recherche de liens officiels,
 * extraction par le modèle, synthèse des checklists).
 *
 * Désactivée par défaut : le contenu des checklists a été rédigé et vérifié
 * à la main, et generateFromGovLinks() écraserait les tâches curatées. Les
 * boutons sont masqués côté interface ; ce verrou garantit qu'aucun appel
 * direct ne contourne ce choix. Réactiver avec GENERATION_ENABLED=true.
 */
export function isGenerationEnabled(): boolean {
  return process.env.GENERATION_ENABLED === 'true';
}

export function assertGenerationEnabled(): void {
  if (!isGenerationEnabled()) {
    throw new ForbiddenException(
      'Génération automatique désactivée : le contenu des checklists se modifie à la main (GENERATION_ENABLED=true pour réactiver).',
    );
  }
}
