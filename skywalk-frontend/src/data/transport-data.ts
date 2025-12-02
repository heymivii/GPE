/**
 * DONNÉES TRANSPORT PAR PAYS
 * 
 * TODO: Compléter avec les vraies données pour chaque pays
 * Sources recommandées :
 * - Prix essence : https://www.globalpetrolprices.com/
 * - Transports publics : Sites officiels des villes/pays
 * - Permis de conduire : Ambassades et consulats
 */

export interface TransportPrices {
  fuelPricePerLiter: number; // Prix essence en €/L
  publicTransportMonthly: number; // Abonnement mensuel moyen en €
  parkingMonthly?: number; // Parking mensuel moyen en € (optionnel)
  vehicleInsuranceYearly?: number; // Assurance auto annuelle moyenne en €
}

export interface DriverLicenseInfo {
  canExchange: boolean; // Échange direct possible ?
  requiresTest: boolean; // Test de conduite obligatoire ?
  requiresTheory: boolean; // Test théorique obligatoire ?
  validityPeriod?: number; // Durée de validité en mois (si échange)
  internationalLicenseAccepted: boolean; // Permis international accepté ?
  processingTimeWeeks: number; // Délai de traitement en semaines
  notes?: string; // Notes spécifiques
}

// TODO: Ajouter les données réelles pour chaque pays
// Sources France:
// - Prix essence: https://carbu.com/france/prixmoyens
// - Pass transport: https://www.bonjour-ratp.fr/actualites/articles/tarifs-forfaits-navigo-2025/
// - Assurance: https://goodassur.com/assurance-auto/tarif
// - Entretien: https://www.largus.fr/actualite-automobile/
export const transportPricesByCountry: Record<string, TransportPrices> = {
  france: {
    fuelPricePerLiter: 1.72, // Prix moyen essence France 2025
    publicTransportMonthly: 88.4, // Forfait Navigo toutes zones Île-de-France
    parkingMonthly: 100, // Péages ~16€ + parking ~80€ en grande ville
    vehicleInsuranceYearly: 637, // 53.1€/mois × 12 (moyenne toutes formules)
  },
  canada: {
    fuelPricePerLiter: 1.50, // TODO: Mettre à jour
    publicTransportMonthly: 90,
    parkingMonthly: 200,
    vehicleInsuranceYearly: 1200,
  },
  allemagne: {
    fuelPricePerLiter: 1.75, // TODO: Mettre à jour
    publicTransportMonthly: 49, // Deutschland-Ticket
    parkingMonthly: 100,
    vehicleInsuranceYearly: 500,
  },
  espagne: {
    fuelPricePerLiter: 1.60, // TODO: Mettre à jour
    publicTransportMonthly: 55,
    parkingMonthly: 120,
    vehicleInsuranceYearly: 550,
  },
  'royaume-uni': {
    fuelPricePerLiter: 1.58, // 1.36 GBP × 1.16 (taux EUR/GBP)
    publicTransportMonthly: 364, // 313.40 GBP Travelcard zones 1-6 × 1.16
    parkingMonthly: 348, // 300 GBP parking centre Londres × 1.16
    vehicleInsuranceYearly: 652, // 562 GBP/an × 1.16
  },
  // TODO: Ajouter les autres pays
};

// TODO: Compléter avec les règles d'échange de permis
// Source : Ambassades, sites gouvernementaux
export const driverLicenseRules: Record<string, Record<string, DriverLicenseInfo>> = {
  // Clé : pays de destination
  france: {
    // Clé : pays d'origine
    canada: {
      canExchange: true,
      requiresTest: false,
      requiresTheory: false,
      validityPeriod: 12, // 1 an pour échanger
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
    // TODO: Ajouter les autres pays d'origine
  },
  canada: {
    france: {
      canExchange: true,
      requiresTest: false,
      requiresTheory: true, // Selon la province
      validityPeriod: 6,
      internationalLicenseAccepted: true,
      processingTimeWeeks: 6,
      notes: "Varie selon les provinces",
    },
    // TODO: Ajouter les autres pays d'origine
  },
  // TODO: Ajouter les autres pays de destination
};

// Documents nécessaires pour l'achat d'un véhicule (générique)
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
