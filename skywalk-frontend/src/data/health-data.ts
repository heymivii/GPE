/**
 * DONNÉES SANTÉ PAR PAYS
 * 
 * TODO: Compléter avec les vraies données pour chaque pays
 * Sources recommandées :
 * - WHO (Organisation Mondiale de la Santé) : https://www.who.int/
 * - Sites gouvernementaux de santé publique
 * - Compagnies d'assurance internationales
 * - Ambassades et consulats
 */

export interface HealthSystemInfo {
  type: 'public' | 'private' | 'mixed'; // Type de système
  hasUniversalCoverage: boolean; // Couverture universelle ?
  publicCostMonthly?: number; // Cotisation publique mensuelle en €
  privateCostMonthly?: number; // Assurance privée moyenne en €
  coPaymentRate?: number; // Taux de remboursement (0-100%)
  emergencyFree: boolean; // Urgences gratuites ?
  prescriptionSubsidized: boolean; // Médicaments remboursés ?
}

export interface VaccinationRequirement {
  name: string; // Nom du vaccin
  required: boolean; // Obligatoire ?
  recommended: boolean; // Recommandé ?
  cost?: number; // Coût estimé en €
  notes?: string;
}

export interface HealthBudgetEstimate {
  insurance: number; // Assurance mensuelle
  consultations: number; // Consultations annuelles
  medications: number; // Médicaments mensuels
  dental: number; // Soins dentaires annuels
  optical: number; // Optique annuel
  emergency: number; // Urgences potentielles annuelles
}

// TODO: Ajouter les données réelles pour chaque pays
// Sources France:
// - Ameli.fr: https://www.ameli.fr/assure/remboursements/rembourse/tableau-recapitulatif-taux-remboursement
// - Info.gouv.fr: https://www.info.gouv.fr/actualite/sante-consultation-a-30-euros-chez-le-medecin-generaliste
// - Magnolia.fr: https://www.magnolia.fr/mutuelle-sante/prix
// - DREES: https://drees.solidarites-sante.gouv.fr/
export const healthSystemByCountry: Record<string, HealthSystemInfo> = {
  france: {
    type: 'mixed',
    hasUniversalCoverage: true,
    publicCostMonthly: 0, // Sécurité sociale via cotisations automatiques
    privateCostMonthly: 70, // Mutuelle complémentaire moyenne 2025
    coPaymentRate: 70, // 70% remboursé par sécurité sociale
    emergencyFree: true,
    prescriptionSubsidized: true, // Remboursement selon tarif conventionné
  },
  canada: {
    type: 'public',
    hasUniversalCoverage: true,
    publicCostMonthly: 0, // Via impôts
    privateCostMonthly: 100, // Pour médicaments, dentaire, optique
    coPaymentRate: 100, // Soins couverts à 100%
    emergencyFree: true,
    prescriptionSubsidized: false, // Nécessite assurance privée
  },
  allemagne: {
    type: 'mixed',
    hasUniversalCoverage: true,
    publicCostMonthly: 180, // Environ 14.6% du salaire
    privateCostMonthly: 300, // Assurance privée
    coPaymentRate: 90,
    emergencyFree: true,
    prescriptionSubsidized: true,
  },
  espagne: {
    type: 'public',
    hasUniversalCoverage: true,
    publicCostMonthly: 0,
    privateCostMonthly: 60,
    coPaymentRate: 100,
    emergencyFree: true,
    prescriptionSubsidized: true,
  },
  'royaume-uni': {
    type: 'public', // NHS (National Health Service)
    hasUniversalCoverage: true,
    publicCostMonthly: 0, // NHS gratuit via impôts + IHS (£624/an pour visas)
    privateCostMonthly: 81, // 70 GBP × 1.16 (pour éviter délais NHS)
    coPaymentRate: 80, // NHS couvre ~80% en moyenne
    emergencyFree: true, // Urgences NHS gratuites pour résidents
    prescriptionSubsidized: true, // Prescriptions NHS ~£9.90 par item
  },
  suisse: {
    type: 'mixed', // Assurance obligatoire privée (LAMal) + complémentaires
    hasUniversalCoverage: true,
    publicCostMonthly: 413, // 393.30 CHF × 1.05 = Prime LAMal moyenne 2026 (OBLIGATOIRE)
    privateCostMonthly: 473, // 450 CHF × 1.05 = Complémentaires privées optionnelles
    coPaymentRate: 90, // 90% remboursé après franchise + 10% quote-part (max 700 CHF/an)
    emergencyFree: false, // Franchise + quote-part s'appliquent
    prescriptionSubsidized: true, // Après franchise
  },
  // TODO: Ajouter les autres pays
};

// TODO: Compléter avec les vaccins obligatoires/recommandés par pays
export const vaccinationsByCountry: Record<string, VaccinationRequirement[]> = {
  france: [
    { name: 'DTP (Diphtérie, Tétanos, Polio)', required: false, recommended: true, cost: 30 },
    { name: 'Hépatite B', required: false, recommended: true, cost: 40 },
    { name: 'COVID-19', required: false, recommended: true, cost: 0 },
  ],
  canada: [
    { name: 'DTP', required: false, recommended: true, cost: 35 },
    { name: 'Hépatite B', required: false, recommended: true, cost: 45 },
    { name: 'Grippe (annuel)', required: false, recommended: true, cost: 0 },
  ],
  // TODO: Ajouter les autres pays et leurs exigences spécifiques
};

// Budget santé par profil (valeurs moyennes annuelles en €)
// Sources France: Mutuelle moyenne 55€/mois + reste à charge selon profil
// Source: https://www.magnolia.fr/mutuelle-sante/prix-moyen-mutuelle + ameli.fr
// Suisse: Primes LAMal obligatoires TRÈS ÉLEVÉES (source: FOPH 2026 + conversion CHF→EUR)
export const healthBudgetByProfile: Record<string, HealthBudgetEstimate> = {
  young_healthy: {
    insurance: 450, // 55€/mois mutuelle France (formule intermédiaire)
    consultations: 80, // 2-3 consultations médecin généraliste
    medications: 120, // Faible besoin médicaments
    dental: 200, // Contrôle annuel + petits soins
    optical: 80, // Peu de besoins
    emergency: 0, // Rarement (inclus dans consultations)
  },
  adult_average: {
    insurance: 660, // 55€/mois mutuelle France
    consultations: 120, // 4-5 consultations/an
    medications: 180, // Besoins moyens
    dental: 350, // Soins + détartrage
    optical: 150, // Lunettes/lentilles
    emergency: 0, // Inclus
  },
  senior: {
    insurance: 1200, // 100€/mois (mutuelle senior plus chère)
    consultations: 200, // Suivi régulier 6-8 consultations/an
    medications: 300, // Traitements plus fréquents
    dental: 400,
    optical: 200,
    emergency: 0,
  },
  chronic_condition: {
    insurance: 900, // Mutuelle adaptée aux maladies chroniques
    consultations: 250, // Suivi médical régulier
    medications: 400, // Traitements réguliers (ALD 100% remboursée Sécu)
    dental: 300,
    optical: 100,
    emergency: 0,
  },
};

// Budgets santé Suisse (⚠️ BEAUCOUP PLUS ÉLEVÉS que reste de l'Europe)
// Source: switzerland-mapping.ts (budgets CHF convertis en EUR)
export const healthBudgetByProfileSwitzerland: Record<string, HealthBudgetEstimate> = {
  young_healthy: {
    insurance: 4725, // 4500 CHF × 1.05 (LAMal obligatoire + franchise)
    consultations: 158, // 150 CHF × 1.05
    medications: 263, // 250 CHF × 1.05
    dental: 315, // 300 CHF × 1.05 (NON couvert par LAMal)
    optical: 158, // 150 CHF × 1.05 (NON couvert par LAMal)
    emergency: 0,
  },
  adult_average: {
    insurance: 6300, // 6000 CHF × 1.05
    consultations: 263, // 250 CHF × 1.05
    medications: 420, // 400 CHF × 1.05
    dental: 525, // 500 CHF × 1.05
    optical: 210, // 200 CHF × 1.05
    emergency: 0,
  },
  senior: {
    insurance: 9450, // 9000 CHF × 1.05 (primes seniors très élevées)
    consultations: 420, // 400 CHF × 1.05
    medications: 630, // 600 CHF × 1.05
    dental: 735, // 700 CHF × 1.05
    optical: 315, // 300 CHF × 1.05
    emergency: 0,
  },
  chronic_condition: {
    insurance: 8400, // 8000 CHF × 1.05
    consultations: 315, // 300 CHF × 1.05
    medications: 840, // 800 CHF × 1.05
    dental: 525, // 500 CHF × 1.05
    optical: 210, // 200 CHF × 1.05
    emergency: 0,
  },
};

// Documents médicaux nécessaires (générique)
export const medicalDocumentsChecklist = [
  "Dossier médical complet traduit",
  "Carnet de vaccination à jour",
  "Ordonnances en cours (traduites)",
  "Certificats médicaux spécifiques",
  "Carte de groupe sanguin",
  "Carte européenne d'assurance maladie (si UE)",
  "Attestation d'assurance santé internationale",
  "Liste des allergies et conditions préexistantes",
  "Contacts médecins traitants (origine + destination)",
  "Certificat optique/dentaire récent",
];
