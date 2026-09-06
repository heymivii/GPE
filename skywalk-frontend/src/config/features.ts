/**
 * Interrupteurs de fonctionnalités.
 *
 * GENERATION_ENABLED — génération automatique des liens officiels et des
 * checklists (recherche + extraction par le modèle). Désactivée par défaut :
 * le contenu des checklists a été rédigé et vérifié à la main (fiche
 * PROMPT_CHECKLISTS_GEMINI.md), et une régénération l'écraserait. La
 * validation des liens et la modification manuelle des étapes restent
 * disponibles. Réactiver avec VITE_GENERATION_ENABLED=true.
 */
export const GENERATION_ENABLED = import.meta.env.VITE_GENERATION_ENABLED === 'true';
