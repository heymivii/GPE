export interface TransportPrices {
  fuelPricePerLiter: number;
  publicTransportMonthly: number;
  parkingMonthly?: number;
  vehicleInsuranceYearly?: number;
}

export interface DriverLicenseInfo {
  canExchange: boolean;
  requiresTest: boolean;
  requiresTheory: boolean;
  validityPeriod?: number;
  internationalLicenseAccepted: boolean;
  processingTimeWeeks: number;
  notes?: string;
}

export const transportPricesByCountry: Record<string, TransportPrices> = {
  france: {
    fuelPricePerLiter: 1.78,
    publicTransportMonthly: 88.40,
    parkingMonthly: 250,
    vehicleInsuranceYearly: 637,
  },
  canada: {
    fuelPricePerLiter: 1.50,
    publicTransportMonthly: 90,
    parkingMonthly: 200,
    vehicleInsuranceYearly: 1200,
  },
  allemagne: {
    fuelPricePerLiter: 1.75,
    publicTransportMonthly: 49,
    parkingMonthly: 100,
    vehicleInsuranceYearly: 500,
  },
  espagne: {
    fuelPricePerLiter: 1.60,
    publicTransportMonthly: 55,
    parkingMonthly: 120,
    vehicleInsuranceYearly: 550,
  },
  'royaume-uni': {
    fuelPricePerLiter: 1.58,
    publicTransportMonthly: 364,
    parkingMonthly: 348,
    vehicleInsuranceYearly: 652,
  },
  suisse: {
    fuelPricePerLiter: 1.77,
    publicTransportMonthly: 105,
    parkingMonthly: 231,
    vehicleInsuranceYearly: 735,
  },
};

export const driverLicenseRules: Record<string, Record<string, DriverLicenseInfo>> = {
  france: {
    canada: {
      canExchange: true,
      requiresTest: false,
      requiresTheory: false,
      validityPeriod: 12,
      internationalLicenseAccepted: true,
      processingTimeWeeks: 4,
      notes: "Permis canadien valable 1 an, puis échange obligatoire",
    },
    usa: {
      canExchange: true,
      requiresTest: false,
      requiresTheory: false,
      validityPeriod: 12,
      internationalLicenseAccepted: true,
      processingTimeWeeks: 4,
    },
  },
  canada: {
    france: {
      canExchange: true,
      requiresTest: false,
      requiresTheory: true,
      validityPeriod: 6,
      internationalLicenseAccepted: true,
      processingTimeWeeks: 6,
      notes: "Varie selon les provinces",
    },
  },
  'royaume-uni': {
    france: {
      canExchange: true,
      requiresTest: false,
      requiresTheory: false,
      validityPeriod: 36,
      internationalLicenseAccepted: false,
      processingTimeWeeks: 3,
      notes: "Échange possible sans examen pour les permis français (avant 70 ans).",
    },
  },
  suisse: {
    france: {
      canExchange: true,
      requiresTest: false,
      requiresTheory: false,
      validityPeriod: 12,
      internationalLicenseAccepted: false,
      processingTimeWeeks: 2,
      notes: "Obligation d'échanger le permis dans les 12 mois suivant l'arrivée.",
    },
  },
};

export const vehicleDocumentsChecklist = [
  "Pièce d'identité valide",
  "Justificatif de domicile",
  "Permis de conduire valide",
  "Preuve d'assurance automobile",
  "Certificat d'immatriculation (carte grise)",
  "Contrôle technique (si véhicule d'occasion)",
  "Certificat de non-gage",
  "Carte bancaire ou moyen de paiement",
];
