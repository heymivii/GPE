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
export const healthSystemByCountry: Record<string, HealthSystemInfo> = {
  france: {
    type: 'mixed',
    hasUniversalCoverage: true,
    publicCostMonthly: 0, // Sécurité sociale via cotisations
    privateCostMonthly: 50, // Mutuelle complémentaire moyenne
    coPaymentRate: 70, // 70% remboursé par sécu
    emergencyFree: true,
    prescriptionSubsidized: true,
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
    type: 'public',
    hasUniversalCoverage: true,
    publicCostMonthly: 0, // NHS gratuit via impôts
    privateCostMonthly: 120,
    coPaymentRate: 100,
    emergencyFree: true,
    prescriptionSubsidized: true,
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
// TODO: Affiner avec données réelles par pays
export const healthBudgetByProfile: Record<string, HealthBudgetEstimate> = {
  young_healthy: {
    insurance: 600, // 50€/mois
    consultations: 200, // 2-3 consultations/an
    medications: 120, // 10€/mois
    dental: 150,
    optical: 100,
    emergency: 50,
  },
  adult_average: {
    insurance: 900, // 75€/mois
    consultations: 400, // 4-5 consultations/an
    medications: 240, // 20€/mois
    dental: 300,
    optical: 150,
    emergency: 100,
  },
  senior: {
    insurance: 1500, // 125€/mois
    consultations: 800, // 8-10 consultations/an
    medications: 600, // 50€/mois
    dental: 500,
    optical: 200,
    emergency: 200,
  },
  chronic_condition: {
    insurance: 1200,
    consultations: 1000,
    medications: 1200, // Traitements réguliers
    dental: 300,
    optical: 150,
    emergency: 150,
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
