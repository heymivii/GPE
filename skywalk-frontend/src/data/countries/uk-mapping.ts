/**
 * MAPPING DES DONNÉES UK VERS FORMAT OUTILS
 * 
 * Ce fichier convertit les données détaillées de uk-data.ts
 * vers le format simplifié utilisé par les outils React
 */

import { ukData } from './uk-data';

// Taux de conversion GBP -> EUR (à mettre à jour régulièrement)
const GBP_TO_EUR = 1.16;

/**
 * Convertit les données UK en format transport-data.ts
 */
export const ukTransportSimplified = {
  'royaume-uni': {
    fuelPricePerLiter: ukData.transport.fuel.averagePetrolPricePerLitre * GBP_TO_EUR, // 1.58 EUR
    publicTransportMonthly: ukData.transport.publicTransport.monthlyPassPrice * GBP_TO_EUR, // 364 EUR
    parkingMonthly: ukData.transport.parking.cityCentreParkingMonthlyAverageLondon * GBP_TO_EUR, // 348 EUR
    vehicleInsuranceYearly: ukData.transport.carInsurance.averageAnnualPremium * GBP_TO_EUR, // 652 EUR
  }
};

/**
 * Convertit les données UK en format health-data.ts
 */
export const ukHealthSimplified = {
  'royaume-uni': {
    type: 'public' as const,
    hasUniversalCoverage: true,
    publicCostMonthly: 0, // NHS gratuit via impôts + IHS pour visas
    privateCostMonthly: Math.round(ukData.health.privateInsurance.averageMonthlyPremiumIndividual * GBP_TO_EUR), // 93 EUR
    coPaymentRate: 80, // NHS couvre ~80% en moyenne
    emergencyFree: true,
    prescriptionSubsidized: true, // ~£9.90 par prescription
  }
};

/**
 * Convertit les budgets santé UK (GBP) en EUR pour les outils
 */
export const ukHealthBudgetsEUR = {
  young_healthy: {
    insurance: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[0].insurancePerYear * GBP_TO_EUR), // 580 EUR
    consultations: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[0].consultationsAndGPPerYear * GBP_TO_EUR), // 58 EUR
    medications: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[0].medicationPerYear * GBP_TO_EUR), // 116 EUR
    dental: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[0].dentalPerYear * GBP_TO_EUR), // 174 EUR
    optical: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[0].opticalPerYear * GBP_TO_EUR), // 58 EUR
    emergency: 50,
    total: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[0].totalEstimatedPerYear * GBP_TO_EUR), // 986 EUR
  },
  adult_average: {
    insurance: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[1].insurancePerYear * GBP_TO_EUR), // 928 EUR
    consultations: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[1].consultationsAndGPPerYear * GBP_TO_EUR), // 116 EUR
    medications: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[1].medicationPerYear * GBP_TO_EUR), // 232 EUR
    dental: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[1].dentalPerYear * GBP_TO_EUR), // 290 EUR
    optical: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[1].opticalPerYear * GBP_TO_EUR), // 116 EUR
    emergency: 100,
    total: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[1].totalEstimatedPerYear * GBP_TO_EUR), // 1682 EUR
  },
  senior: {
    insurance: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[2].insurancePerYear * GBP_TO_EUR), // 1392 EUR
    consultations: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[2].consultationsAndGPPerYear * GBP_TO_EUR), // 232 EUR
    medications: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[2].medicationPerYear * GBP_TO_EUR), // 348 EUR
    dental: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[2].dentalPerYear * GBP_TO_EUR), // 348 EUR
    optical: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[2].opticalPerYear * GBP_TO_EUR), // 174 EUR
    emergency: 200,
    total: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[2].totalEstimatedPerYear * GBP_TO_EUR), // 2494 EUR
  },
  chronic_condition: {
    insurance: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[3].insurancePerYear * GBP_TO_EUR), // 1392 EUR
    consultations: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[3].consultationsAndGPPerYear * GBP_TO_EUR), // 290 EUR
    medications: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[3].medicationPerYear * GBP_TO_EUR), // 464 EUR
    dental: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[3].dentalPerYear * GBP_TO_EUR), // 290 EUR
    optical: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[3].opticalPerYear * GBP_TO_EUR), // 116 EUR
    emergency: 100,
    total: Math.round(ukData.health.annualHealthBudgetEstimates.profiles[3].totalEstimatedPerYear * GBP_TO_EUR), // 2552 EUR
  }
};

/**
 * Notes importantes UK
 */
export const ukNotes = {
  transport: {
    drivingOnLeft: "⚠️ Conduite à gauche au Royaume-Uni",
    congestionCharge: "Londres : Congestion Charge £15/jour en zone centrale (non inclus dans calculs)",
    mot: "MOT obligatoire chaque année à partir de 3 ans d'âge du véhicule",
    v5c: "Le V5C (logbook) sert de certificat d'immatriculation"
  },
  health: {
    nhs: "NHS gratuit au point d'usage pour résidents",
    ihs: "IHS (Immigration Health Surcharge) : £1,035/an pour visas long séjour",
    prescriptions: "Prescriptions NHS : £9.90 par item en Angleterre",
    ghic: "GHIC (Global Health Insurance Card) remplace l'EHIC pour voyages UE",
    waitingTimes: "Délais d'attente NHS possibles - assurance privée recommandée pour rapidité"
  }
};

export default {
  transport: ukTransportSimplified,
  health: ukHealthSimplified,
  healthBudgets: ukHealthBudgetsEUR,
  notes: ukNotes
};
