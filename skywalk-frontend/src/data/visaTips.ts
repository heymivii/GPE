/**
 * Polarité des conseils visa.
 *
 * Elle était encodée par un emoji en tête de la chaîne traduite (« ✅ … » /
 * « ❌ … »). VisaStats le retirait avant affichage, VisaPage non : le
 * pictogramme apparaissait donc tel quel à l'écran (retour de recette).
 *
 * La polarité vit désormais ici : les traductions ne portent plus que du texte,
 * et les deux écrans rendent la même icône lucide.
 */
const NEGATIVE_TIPS = new Set<string>(['tipDontQuit']);

export function isNegativeVisaTip(tipKey: string): boolean {
  return NEGATIVE_TIPS.has(tipKey);
}
