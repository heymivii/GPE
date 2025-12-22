
export const franceData = {
  country: "France",
  code: "FR",
  currency: "EUR",
  
  transport: {
    fuel: {
      averagePetrolPricePerLitre: 1.78,
      currency: "EUR",
      note: "Prix moyen essence SP95-E10 en France au 27 novembre 2025",
      source: "https://carbu.com/france/prixmoyens"
    },
    
    publicTransport: {
      referenceCity: "Paris",
      monthlyPassName: "Navigo Mois (zones 1-5)",
      monthlyPassPrice: 88.40,
      currency: "EUR",
      note: "Forfait mensuel toutes zones Île-de-France",
      source: "https://www.iledefrance-mobilites.fr/titres-et-tarifs/detail/navigo-mois"
    },
    
    carInsurance: {
      averageAnnualPremium: 637,
      averageMonthlyPremium: 53.08,
      currency: "EUR",
      note: "Prix moyen assurance auto tous risques selon étude 2025",
      source: "https://goodassur.com/assurance-auto/tarif-moyen-assurance-auto"
    },
    
    maintenance: {
      averageMaintenanceAndRepairsPerYear: 540,
      averageMaintenanceAndRepairsPerMonth: 45,
      currency: "EUR",
      note: "Entretien + petites réparations (moyenne nationale)",
      source: "https://www.largus.fr/actualite-automobile/combien-coute-lentretien-dune-voiture-30043992.html"
    },
    
    parking: {
      residentPermitAverageAnnual: 120,
      residentPermitAverageMonthly: 10,
      cityCentreParkingMonthlyAverageParis: 250,
      currency: "EUR",
      note: "Estimation moyenne pour parking Paris intramuros",
      sources: [
        "https://parkopedia.com — estimations parkings Paris",
        "https://www.paris.fr/pages/stationnement-2025-19941"
      ]
    },
    
    drivingLicenceRules: {
      euEeaLicence: {
        exchangeRequired: false,
        canDriveOnExistingLicence: true,
        note: "Permis UE/EEE utilisable sans échange tant qu'il est valide.",
        source: "https://www.service-public.fr/particuliers/vosdroits/F1758"
      },
      nonEuLicence: {
        mustExchangeWithinMonths: 12,
        practicalTestRequired: false,
        internationalDrivingPermitAccepted: true,
        note: "Permis hors UE valable 1 an. Échange obligatoire si accord bilatéral, sinon repasser le permis français.",
        source: "https://www.service-public.fr/particuliers/vosdroits/F1460"
      }
    },
    
    vehiclePurchaseAndRegistration: {
      requiredDocuments: [
        "Justificatif d'identité",
        "Justificatif de domicile de moins de 6 mois",
        "Certificat de cession ou facture d'achat",
        "Ancienne carte grise (si occasion)",
        "Preuve contrôle technique (si > 4 ans)",
        "Preuve d'assurance",
        "Quitus fiscal (si véhicule acheté dans l'UE)"
      ],
      note: "Immatriculation obligatoire via l'ANTS.",
      sources: [
        "https://immatriculation.ants.gouv.fr",
        "https://www.service-public.fr/particuliers/vosdroits/N367"
      ]
    },
    
    vehicleInspection: {
      motRequiredFromAgeYears: 4,
      motFrequencyYears: 2,
      note: "Contrôle technique obligatoire à partir des 4 ans du véhicule puis tous les 2 ans.",
      source: "https://www.service-public.fr/particuliers/vosdroits/F328"
    }
  },
  
  health: {
    systemOverview: {
      type: "Public + privé complémentaire",
      universalCoverage: true,
      description: "Le système français repose sur la Sécurité sociale (70% remboursement en moyenne) + mutuelle privée (complémentaire).",
      sources: [
        "https://www.ameli.fr",
        "https://www.securite-sociale.fr"
      ]
    },
    
    publicSystemCost: {
      forResidents: {
        directMonthlyContribution: 0,
        currency: "EUR",
        note: "Financé par cotisations sociales, pas de paiement direct mensuel.",
        source: "https://www.securite-sociale.fr"
      },
      forLongTermVisaHolders: {
        annualCostEstimate: 0,
        currency: "EUR",
        note: "Les titulaires d'un visa long séjour doivent être affiliés à la Sécurité sociale après installation et doivent avoir une assurance privée les 3 premiers mois.",
        source: "https://france-visas.gouv.fr"
      }
    },
    
    privateInsurance: {
      averageMonthlyPremiumIndividual: 55,
      currency: "EUR",
      note: "Mutuelle santé adulte seule, formule intermédiaire",
      source: "https://www.magnolia.fr/mutuelle-sante/prix-moyen-mutuelle"
    },
    
    coverageDetails: {
      gpConsultationCost: {
        price: 30,
        currency: "EUR",
        note: "Tarif consultation médecin généraliste secteur 1",
        source: "https://www.info.gouv.fr/actualite/sante-consultation-a-30-euros"
      },
      emergencyCare: {
        aAndEVisitCost: 0,
        currency: "EUR",
        note: "Urgences gratuites sans avance pour cas graves, sinon ticket modérateur appliqué.",
        sources: [
          "https://www.ameli.fr/assure/remboursements",
          "https://sante.fr/urgences"
        ]
      },
      hospitalCareForResidents: {
        costPerDay: 20,
        currency: "EUR",
        note: "Forfait journalier hospitalier",
        source: "https://www.ameli.fr/assure/remboursements"
      }
    },
    
    reimbursementAndCharges: {
      publicReimbursementRate: {
        model: "Remboursement partiel (70% soins courants, 80% hospitalisation)",
        sources: [
          "https://www.ameli.fr/assure/remboursements"
        ]
      },
      typicalOutOfPocketExamples: {
        gpAfterReimbursement: 7.5,
        prescriptionsTypical: 2,
        opticalAnnual: 150,
        dentalAnnual: 300,
        currency: "EUR"
      }
    },
    
    vaccinations: {
      mandatoryForVisa: {
        vaccines: [
          "Aucun vaccin obligatoire pour entrer en France (hors fièvre jaune pour voyageurs provenant de zones à risque)"
        ],
        source: "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/sante/"
      },
      recommendedForExpat: {
        vaccines: [
          "Vaccins de base à jour (DTP, ROR)",
          "Hépatite B",
          "Grippe saisonnière",
          "COVID-19 (selon recommandations)"
        ],
        source: "https://www.santepubliquefrance.fr"
      }
    },
    
    medicalDocumentsForExpat: {
      recommendedDocuments: [
        "Résumé des antécédents médicaux",
        "Ordonnances récentes",
        "Carnet de vaccination",
        "Traductions certifiées des documents importants (si nécessaire)",
        "Liste des traitements en cours avec DCI"
      ],
      sources: [
        "https://france-visas.gouv.fr",
        "https://www.ameli.fr"
      ]
    },
    
    annualHealthBudgetEstimates: {
      currency: "EUR",
      isApproximation: true,
      note: "Estimations basées sur mutuelle moyenne + reste à charge typique selon profil",
      profiles: [
        {
          profile: "Jeune adulte 18-30, bonne santé",
          insurancePerYear: 450,
          consultationsAndGPPerYear: 80,
          medicationPerYear: 120,
          dentalPerYear: 200,
          opticalPerYear: 80,
          totalEstimatedPerYear: 930
        },
        {
          profile: "Adulte 30-60, santé moyenne",
          insurancePerYear: 660,
          consultationsAndGPPerYear: 120,
          medicationPerYear: 180,
          dentalPerYear: 350,
          opticalPerYear: 150,
          totalEstimatedPerYear: 1460
        },
        {
          profile: "Senior 60+",
          insurancePerYear: 1200,
          consultationsAndGPPerYear: 200,
          medicationPerYear: 300,
          dentalPerYear: 400,
          opticalPerYear: 200,
          totalEstimatedPerYear: 2300
        },
        {
          profile: "Adulte avec maladie chronique",
          insurancePerYear: 900,
          consultationsAndGPPerYear: 250,
          medicationPerYear: 400,
          dentalPerYear: 300,
          opticalPerYear: 100,
          totalEstimatedPerYear: 1950
        }
      ]
    },
    
    europeanHealthCardEquivalent: {
      name: "Carte Européenne d'Assurance Maladie (CEAM)",
      appliesTo: "Ressortissants UE/EEE voyageant temporairement dans un autre pays de l'UE/EEE",
      cost: 0,
      note: "Permet d'être soigné dans l'UE au même tarif que les résidents locaux.",
      sources: [
        "https://www.ameli.fr/assure/remboursements/soins-etranger/carte-europeenne-assurance-maladie"
      ]
    }
  }
};

export default franceData;
