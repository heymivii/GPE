
export const switzerlandData = {
  country: "Suisse",
  code: "CH",
  currency: "CHF",
  
  transport: {
    fuel: {
      averagePetrolPricePerLitre: 1.69,
      currency: "CHF",
      note: "Prix moyen essence sans plomb 95 en Suisse au 10-Nov-2025",
      source: "https://www.globalpetrolprices.com/Switzerland/gasoline_prices/ (CHF 1.69/L)"
    },
    
    publicTransport: {
      referenceCity: "Zurich",
      monthlyPassName: "Zurich Monatskarte (Zone centrale)",
      monthlyPassPrice: 100,
      currency: "CHF",
      note: "Estimation pour grand centre urbain (Zurich). À vérifier selon zone exacte.",
      source: "https://www.expatistan.com/price/gas/zurich (tarif transport ~3.83 CHF un trajet simple)"
    },
    
    carInsurance: {
      averageAnnualPremium: 700,
      averageMonthlyPremium: 58.33,
      currency: "CHF",
      note: "Estimation – primes assurance auto très variables selon canton, profil conducteur et type de véhicule.",
      source: "Estimation basée sur informations comparatives suisses (Comparis, etc.)"
    },
    
    maintenance: {
      averageMaintenanceAndRepairsPerYear: 600,
      averageMaintenanceAndRepairsPerMonth: 50,
      currency: "CHF",
      note: "Entretien + petites réparations – estimation pour véhicule standard en Suisse.",
      source: "https://www.schwiizerfranke.com/en/benzinkosten-berechnen-schweiz (calculateur essence CHF 1.76/L)"
    },
    
    parking: {
      residentPermitAverageAnnual: 150,
      residentPermitAverageMonthly: 12.5,
      cityCentreParkingMonthlyAverageZurich: 220,
      currency: "CHF",
      note: "Estimations : stationnement centre ville Zurich ~CHF 220/mois approximatif. Varie fortement selon ville/canton.",
      sources: [
        "Données stationnement estimatives pour Suisse urbaine",
        "Parkopedia & sources locales"
      ]
    },
    
    drivingLicenceRules: {
      euEeaLicence: {
        exchangeRequired: false,
        canDriveOnExistingLicence: true,
        note: "Permis UE/EEE reconnus en Suisse pour résidence temporaire. Pour résidence permanente, vérifications selon canton (échange possible après 12 mois).",
        source: "Expat guides Suisse – reconnaissance permis UE/EEE"
      },
      nonEuLicence: {
        mustExchangeWithinMonths: 12,
        practicalTestRequired: true,
        internationalDrivingPermitAccepted: true,
        note: "Permis hors UE/EEE : obligation d'échanger dans les 12 mois de résidence. Test pratique souvent requis selon pays d'origine.",
        source: "https://www.expatica.com/ch/healthcare/healthcare-basics/a-guide-to-swiss-health-insurance-693473/"
      },
      additionalNote: "Les règles varient selon canton. Toujours vérifier avec l'office cantonal des véhicules."
    },
    
    vehiclePurchaseAndRegistration: {
      requiredDocuments: [
        "Certificat d'identité/passeport",
        "Preuve de résidence (inscription dans commune)",
        "Facture ou contrat d'achat du véhicule",
        "Preuve d'assurance responsabilité civile",
        "Contrôle technique (si applicable selon canton et âge véhicule)"
      ],
      note: "Immatriculation cantonale requise – les règles et tarifs varient selon canton.",
      sources: [
        "Comparis – guide assurance & résidents suisse",
        "Offices cantonaux des automobiles"
      ]
    },
    
    vehicleInspection: {
      motRequiredFromAgeYears: 4,
      motFrequencyYears: 2,
      note: "Contrôle technique obligatoire selon canton – fréquence typique tous les 2 ans après 4 ans d'âge du véhicule.",
      source: "Réglementation cantonale suisse – contrôle technique standard"
    }
  },
  
  health: {
    systemOverview: {
      type: "Assurance maladie de base OBLIGATOIRE (fournie par assureurs privés régulés) + compléments privés optionnels",
      universalCoverage: true,
      description: "En Suisse, l'assurance maladie de base (LAMal) est OBLIGATOIRE pour tous les résidents, fournie par des assureurs privés mais régulée par l'État fédéral. Système unique au monde.",
      sources: [
        "https://www.bag.admin.ch/en/health-insurance (Federal Office of Public Health)",
        "https://www.internationalinsurance.com/health/systems/switzerland.php",
        "https://en.wikipedia.org/wiki/Healthcare_in_Switzerland"
      ]
    },
    
    publicSystemCost: {
      forResidents: {
        averageMonthlyPremiumAdult: 393.30,
        currency: "CHF",
        note: "Prime moyenne nationale CHF 393.30/mois annoncée pour 2026 par l'Office fédéral de la santé publique (OFSP). Varie fortement selon canton, âge, franchise choisie.",
        source: "https://www.bag.admin.ch/en/premiums-and-costs-answers-to-frequently-asked-questions (FOPH primes 2026)"
      },
      forLongTermVisaHolders: {
        annualCostEstimate: 4720,
        currency: "CHF",
        note: "Estimation approximative basée sur prime mensuelle moyenne ×12. Les expatriés doivent s'affilier à l'assurance obligatoire dans les 3 mois.",
        source: "https://en.comparis.ch/krankenkassen/default (Comparis premium overview)"
      }
    },
    
    privateInsurance: {
      averageMonthlyPremiumIndividual: 450,
      currency: "CHF",
      note: "Assurances complémentaires privées (non obligatoires) : ~CHF 450/mois en moyenne. Canton Genève : primes > CHF 500/mois fréquentes pour adulte.",
      source: "https://assurance-genevoise.ch/en/blog/combien-coute-lassurance-maladie-en-suisse (primes Genève > CHF 500/mois)"
    },
    
    coverageDetails: {
      gpConsultationCost: {
        price: 0,
        currency: "CHF",
        note: "Consultation chez médecin généraliste remboursée via assurance de base après franchise et quote-part (10%). Pas gratuit au sens strict.",
        source: "https://www.internations.org/switzerland-expats/guide/healthcare (InterNations Swiss healthcare)"
      },
      emergencyCare: {
        aAndEVisitCost: 0,
        currency: "CHF",
        note: "Hospitalisation d'urgence couverte par assurance de base, mais franchises (CHF 300-2500) et quote-parts (10%) s'appliquent.",
        source: "https://www.moneyland.ch/en/basic-swiss-health-insurance-costs-covered-overview"
      },
      hospitalCareForResidents: {
        costPerDay: 15,
        currency: "CHF",
        note: "Contribution hospitalière journalière limitée (ex. max CHF 15/jour en division commune) selon canton et type de chambre.",
        source: "https://www.moneyland.ch/en/basic-swiss-health-insurance-costs-covered-overview (Moneyland healthcare costs)"
      }
    },
    
    reimbursementAndCharges: {
      publicReimbursementRate: {
        model: "Assurance de base LAMal : franchise annuelle (CHF 300-2500 au choix) + 10% quote-part jusqu'à maximum CHF 700/an",
        note: "Exemple : avec franchise CHF 300, vous payez les premiers CHF 300 puis 10% jusqu'à max CHF 700 de quote-part = max CHF 1000 reste à charge/an.",
        source: "https://en.wikipedia.org/wiki/Healthcare_in_Switzerland (système franchise + quote-part)"
      },
      typicalOutOfPocketExamples: {
        gpAfterReimbursement: 30,
        prescriptionsTypical: 10,
        opticalAnnual: 300,
        dentalAnnual: 500,
        currency: "CHF",
        note: "Valeurs estimatives. Optique et dentaire PAS couverts par assurance de base (nécessitent complémentaires)."
      }
    },
    
    vaccinations: {
      mandatoryForVisa: {
        vaccines: [
          "Aucune vaccination générale obligatoire pour tous les visiteurs/résidents (sauf provenance zones à risque comme fièvre jaune)."
        ],
        source: "https://www.bag.admin.ch/en/ (Federal Office of Public Health Switzerland – vaccinations)"
      },
      recommendedForExpat: {
        vaccines: [
          "Tétanos-Diphtérie-Polio (DTP) à jour",
          "Hépatite A/B selon profil d'exposition",
          "Grippe annuelle (recommandée pour seniors)",
          "COVID-19 selon recommandations actuelles"
        ],
        source: "Guides expats Suisse santé & recommandations FOPH"
      }
    },
    
    medicalDocumentsForExpat: {
      recommendedDocuments: [
        "Résumé des antécédents médicaux en anglais, allemand, français ou italien",
        "Ordonnances en cours avec noms génériques (DCI) + traduction si nécessaire",
        "Carnet de vaccination à jour",
        "Preuves d'assurance maladie LAMal (obligatoire dans les 3 mois)",
        "Rapports médicaux récents si pathologies chroniques"
      ],
      sources: [
        "Expat-guide Suisse santé & assurances",
        "https://www.ch.ch/en/health-insurance/"
      ]
    },
    
    annualHealthBudgetEstimates: {
      currency: "CHF",
      isApproximation: true,
      note: "⚠️ ATTENTION: Primes d'assurance maladie TRÈS ÉLEVÉES en Suisse (système unique obligatoire). Budgets à titre indicatif, peuvent varier fortement selon canton et franchise choisie.",
      profiles: [
        {
          profile: "Jeune adulte 18-30, bonne santé",
          insurancePerYear: 4500,
          consultationsAndGPPerYear: 150,
          medicationPerYear: 250,
          dentalPerYear: 300,
          opticalPerYear: 150,
          totalEstimatedPerYear: 5350
        },
        {
          profile: "Adulte 30-60, santé moyenne",
          insurancePerYear: 6000,
          consultationsAndGPPerYear: 250,
          medicationPerYear: 400,
          dentalPerYear: 500,
          opticalPerYear: 200,
          totalEstimatedPerYear: 7350
        },
        {
          profile: "Senior 60+",
          insurancePerYear: 9000,
          consultationsAndGPPerYear: 400,
          medicationPerYear: 600,
          dentalPerYear: 700,
          opticalPerYear: 300,
          totalEstimatedPerYear: 11000
        },
        {
          profile: "Adulte avec maladie chronique",
          insurancePerYear: 8000,
          consultationsAndGPPerYear: 300,
          medicationPerYear: 800,
          dentalPerYear: 500,
          opticalPerYear: 200,
          totalEstimatedPerYear: 9800
        }
      ]
    },
    
    europeanHealthCardEquivalent: {
      name: "Carte européenne d'assurance maladie (CEAM) / EHIC",
      appliesTo: "Ressortissants UE/EEE ou titulaires permis de séjour suisse voyageant temporairement dans l'UE/EEE",
      cost: 0,
      note: "Permet d'être soigné dans l'UE au même tarif que les résidents locaux (sous conditions). La Suisse participe au système CEAM malgré non-adhésion à l'UE.",
      sources: [
        "https://employment-social-affairs.ec.europa.eu/policies-and-activities/moving-working-europe/eu-social-security-coordination/european-health-insurance-card/how-use-card/switzerland-european-health-insurance-card_en",
        "https://www.bag.admin.ch/en/ (FOPH EHIC info)"
      ]
    },
    
    importantNotes: {
      obligatoryInsurance: "⚠️ L'assurance maladie de base (LAMal) est OBLIGATOIRE pour TOUS les résidents suisses. Affiliation requise dans les 3 mois après installation.",
      highCosts: "💰 Les primes d'assurance santé suisses sont parmi les plus élevées au monde (moyenne nationale ~CHF 393-450/mois en 2026).",
      cantonalDifferences: "🏛️ Primes et règles varient FORTEMENT selon canton (Genève/Zurich plus chers que cantons ruraux).",
      dentalOptical: "🦷👓 Soins dentaires et optiques NON couverts par assurance de base (nécessitent complémentaires privées).",
      franchise: "💵 Système de franchise annuelle (CHF 300-2500 au choix) + 10% quote-part = max CHF 700/an."
    }
  }
};

export default switzerlandData;
