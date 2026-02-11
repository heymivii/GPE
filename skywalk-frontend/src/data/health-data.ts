
export interface HealthSystemInfo {
  type: 'public' | 'private' | 'mixed';
  hasUniversalCoverage: boolean;
  publicCostMonthly?: number;
  privateCostMonthly?: number;
  coPaymentRate?: number;
  emergencyFree: boolean;
  prescriptionSubsidized: boolean;
}

export interface VaccinationRequirement {
  name: string;
  required: boolean;
  recommended: boolean;
  cost?: number;
  notes?: string;
}

export interface HealthBudgetEstimate {
  insurance: number;
  consultations: number;
  medications: number;
  dental: number;
  optical: number;
  emergency: number;
}

export const healthSystemByCountry: Record<string, HealthSystemInfo> = {
  france: {
    type: 'mixed',
    hasUniversalCoverage: true,
    publicCostMonthly: 0,
    privateCostMonthly: 70,
    coPaymentRate: 70,
    emergencyFree: true,
    prescriptionSubsidized: true,
  },
  canada: {
    type: 'public',
    hasUniversalCoverage: true,
    publicCostMonthly: 0,
    privateCostMonthly: 100,
    coPaymentRate: 100,
    emergencyFree: true,
    prescriptionSubsidized: false,
  },
  allemagne: {
    type: 'mixed',
    hasUniversalCoverage: true,
    publicCostMonthly: 180,
    privateCostMonthly: 300,
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
    publicCostMonthly: 0,
    privateCostMonthly: 81,
    coPaymentRate: 80,
    emergencyFree: true,
    prescriptionSubsidized: true,
  },
  suisse: {
    type: 'mixed',
    hasUniversalCoverage: true,
    publicCostMonthly: 413,
    privateCostMonthly: 473,
    coPaymentRate: 90,
    emergencyFree: false,
    prescriptionSubsidized: true,
  },
};

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
};

export const healthBudgetByProfile: Record<string, HealthBudgetEstimate> = {
  young_healthy: {
    insurance: 450,
    consultations: 80,
    medications: 120,
    dental: 200,
    optical: 80,
    emergency: 0,
  },
  adult_average: {
    insurance: 660,
    consultations: 120,
    medications: 180,
    dental: 350,
    optical: 150,
    emergency: 0,
  },
  senior: {
    insurance: 1200,
    consultations: 200,
    medications: 300,
    dental: 400,
    optical: 200,
    emergency: 0,
  },
  chronic_condition: {
    insurance: 900,
    consultations: 250,
    medications: 400,
    dental: 300,
    optical: 100,
    emergency: 0,
  },
};

export const healthBudgetByProfileSwitzerland: Record<string, HealthBudgetEstimate> = {
  young_healthy: {
    insurance: 4725,
    consultations: 158,
    medications: 263,
    dental: 315,
    optical: 158,
    emergency: 0,
  },
  adult_average: {
    insurance: 6300,
    consultations: 263,
    medications: 420,
    dental: 525,
    optical: 210,
    emergency: 0,
  },
  senior: {
    insurance: 9450,
    consultations: 420,
    medications: 630,
    dental: 735,
    optical: 315,
    emergency: 0,
  },
  chronic_condition: {
    insurance: 8400,
    consultations: 315,
    medications: 840,
    dental: 525,
    optical: 210,
    emergency: 0,
  },
};

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
