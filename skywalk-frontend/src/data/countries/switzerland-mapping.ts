/**
 * MAPPING SUISSE (CHF → EUR)
 * 
 * Convertit les données suisses en CHF vers EUR pour compatibilité avec les outils.
 * Taux de conversion: 1 CHF = 1.05 EUR (approximatif, décembre 2025)
 * 
 * ⚠️ IMPORTANT: La Suisse a des coûts de santé TRÈS ÉLEVÉS comparé aux autres pays européens
 */

import { switzerlandData } from './switzerland-data';

// Taux de conversion CHF → EUR (approximatif)
export const CHF_TO_EUR = 1.05;

/**
 * TRANSPORT SIMPLIFIÉ (pour transport-data.ts)
 */
export const switzerlandTransportSimplified = {
  fuelPricePerLiter: +(switzerlandData.transport.fuel.averagePetrolPricePerLitre * CHF_TO_EUR).toFixed(2), // 1.69 CHF × 1.05 = 1.77 EUR
  publicTransportMonthly: +(switzerlandData.transport.publicTransport.monthlyPassPrice * CHF_TO_EUR).toFixed(2), // 100 CHF × 1.05 = 105 EUR
  parkingMonthly: +(switzerlandData.transport.parking.cityCentreParkingMonthlyAverageZurich * CHF_TO_EUR).toFixed(2), // 220 CHF × 1.05 = 231 EUR
  vehicleInsuranceYearly: +(switzerlandData.transport.carInsurance.averageAnnualPremium * CHF_TO_EUR).toFixed(0) // 700 CHF × 1.05 = 735 EUR
};

/**
 * SANTÉ SIMPLIFIÉE (pour health-data.ts)
 */
export const switzerlandHealthSimplified = {
  type: 'mixed' as const,
  hasUniversalCoverage: true,
  publicCostMonthly: +(switzerlandData.health.publicSystemCost.forResidents.averageMonthlyPremiumAdult * CHF_TO_EUR).toFixed(2), // 393.30 CHF × 1.05 = 413 EUR
  privateCostMonthly: +(switzerlandData.health.privateInsurance.averageMonthlyPremiumIndividual * CHF_TO_EUR).toFixed(2), // 450 CHF × 1.05 = 473 EUR
  coPaymentRate: 90, // Après franchise, 10% quote-part = 90% remboursé
  emergencyFree: false, // Franchise + quote-part s'appliquent
  note: "⚠️ Assurance maladie OBLIGATOIRE en Suisse. Primes parmi les plus élevées d'Europe. publicCostMonthly = prime moyenne LAMal obligatoire."
};

/**
 * BUDGETS SANTÉ EN EUR (pour health-data.ts)
 */
export const switzerlandHealthBudgetsEUR = {
  young_healthy: {
    insurance: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[0].insurancePerYear * CHF_TO_EUR).toFixed(0), // 4500 CHF × 1.05 = 4725 EUR
    consultations: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[0].consultationsAndGPPerYear * CHF_TO_EUR).toFixed(0), // 150 CHF × 1.05 = 158 EUR
    medications: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[0].medicationPerYear * CHF_TO_EUR).toFixed(0), // 250 CHF × 1.05 = 263 EUR
    dental: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[0].dentalPerYear * CHF_TO_EUR).toFixed(0), // 300 CHF × 1.05 = 315 EUR
    optical: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[0].opticalPerYear * CHF_TO_EUR).toFixed(0), // 150 CHF × 1.05 = 158 EUR
    emergency: 0 // Inclus dans consultations
  },
  adult_average: {
    insurance: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[1].insurancePerYear * CHF_TO_EUR).toFixed(0), // 6000 CHF × 1.05 = 6300 EUR
    consultations: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[1].consultationsAndGPPerYear * CHF_TO_EUR).toFixed(0), // 250 CHF × 1.05 = 263 EUR
    medications: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[1].medicationPerYear * CHF_TO_EUR).toFixed(0), // 400 CHF × 1.05 = 420 EUR
    dental: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[1].dentalPerYear * CHF_TO_EUR).toFixed(0), // 500 CHF × 1.05 = 525 EUR
    optical: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[1].opticalPerYear * CHF_TO_EUR).toFixed(0), // 200 CHF × 1.05 = 210 EUR
    emergency: 0
  },
  senior: {
    insurance: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[2].insurancePerYear * CHF_TO_EUR).toFixed(0), // 9000 CHF × 1.05 = 9450 EUR
    consultations: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[2].consultationsAndGPPerYear * CHF_TO_EUR).toFixed(0), // 400 CHF × 1.05 = 420 EUR
    medications: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[2].medicationPerYear * CHF_TO_EUR).toFixed(0), // 600 CHF × 1.05 = 630 EUR
    dental: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[2].dentalPerYear * CHF_TO_EUR).toFixed(0), // 700 CHF × 1.05 = 735 EUR
    optical: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[2].opticalPerYear * CHF_TO_EUR).toFixed(0), // 300 CHF × 1.05 = 315 EUR
    emergency: 0
  },
  chronic_condition: {
    insurance: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[3].insurancePerYear * CHF_TO_EUR).toFixed(0), // 8000 CHF × 1.05 = 8400 EUR
    consultations: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[3].consultationsAndGPPerYear * CHF_TO_EUR).toFixed(0), // 300 CHF × 1.05 = 315 EUR
    medications: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[3].medicationPerYear * CHF_TO_EUR).toFixed(0), // 800 CHF × 1.05 = 840 EUR
    dental: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[3].dentalPerYear * CHF_TO_EUR).toFixed(0), // 500 CHF × 1.05 = 525 EUR
    optical: +(switzerlandData.health.annualHealthBudgetEstimates.profiles[3].opticalPerYear * CHF_TO_EUR).toFixed(0), // 200 CHF × 1.05 = 210 EUR
    emergency: 0
  }
};

/**
 * NOTES IMPORTANTES SUISSE
 */
export const switzerlandNotes = {
  healthInsurance: "⚠️ ASSURANCE MALADIE OBLIGATOIRE (LAMal) pour TOUS les résidents suisses. Prime moyenne nationale ~413 EUR/mois (393 CHF). Affiliation dans les 3 mois après installation.",
  highCosts: "💰 La Suisse a les coûts de santé les plus élevés d'Europe. Budget santé annuel moyen adulte : 6300-7700 EUR/an (vs 1460 EUR en France).",
  cantonalDifferences: "🏛️ Primes d'assurance varient FORTEMENT selon canton (Genève/Zurich +30-50% vs cantons ruraux).",
  dentalOptical: "🦷👓 Soins dentaires et optiques NON couverts par assurance de base obligatoire (nécessitent complémentaires privées facultatives).",
  franchise: "💵 Système de franchise annuelle (300-2500 CHF au choix) + 10% quote-part (max 700 CHF/an) = reste à charge max ~1000 CHF/an (~1050 EUR).",
  transport: "🚗 Essence ~1.77 EUR/L (similaire à France). Transports publics excellents mais chers (pass mensuel Zurich ~105 EUR).",
  vehicleInspection: "🔧 Contrôle technique obligatoire selon canton, généralement tous les 2 ans après 4 ans d'âge véhicule.",
  drivingLicense: "🪪 Permis UE/EEE reconnus. Permis hors UE/EEE : échange obligatoire dans 12 mois avec test pratique possible selon pays d'origine."
};

export default {
  transport: switzerlandTransportSimplified,
  health: switzerlandHealthSimplified,
  healthBudgets: switzerlandHealthBudgetsEUR,
  notes: switzerlandNotes,
  CHF_TO_EUR
};
