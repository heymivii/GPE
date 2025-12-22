
export const ukData = {
  country: "Royaume-Uni",
  code: "GB",
  currency: "GBP",
  
  transport: {
    fuel: {
      averagePetrolPricePerLitre: 1.36,
      currency: "GBP",
      note: "Prix moyen essence sans plomb au Royaume-Uni fin 2025",
      source: "GlobalPetrolPrices UK – environ 1.36 £/L au 24/11/2025"
    },
    
    publicTransport: {
      referenceCity: "Londres",
      monthlyPassName: "Travelcard Zones 1-6",
      monthlyPassPrice: 313.40,
      currency: "GBP",
      note: "Abonnement mensuel Travelcard zones 1 à 6 (adulte)",
      source: "Transport for London – grille tarifs Travelcards 2025"
    },
    
    carInsurance: {
      averageAnnualPremium: 562,
      averageMonthlyPremium: 46.83,
      currency: "GBP",
      note: "Prime annuelle moyenne auto au UK (tous profils confondus)",
      source: "MoneyHelper / Money Advice Service – coût moyen ~£562/an"
    },
    
    maintenance: {
      averageMaintenanceAndRepairsPerYear: 600,
      averageMaintenanceAndRepairsPerMonth: 50,
      currency: "GBP",
      note: "Approx : MOT, révisions et petites réparations",
      source: "Estimation basée sur analyses Nimblefins + MoneyHelper (MOT/service/réparations autour de 500–600 £/an)"
    },
    
    parking: {
      residentPermitAverageAnnual: 128,
      residentPermitAverageMonthly: 10.67,
      cityCentreParkingMonthlyAverageLondon: 300,
      currency: "GBP",
      note: "Permis résident moyen UK ~£128/an ; parking mensuel centre de Londres ~£300 en moyenne",
      sources: [
        "Direct Line Group – coût moyen permis résident UK ~£128/an",
        "YourParkingSpace – parking mensuel Londres : moyenne ~£299.22/mois"
      ]
    },
    
    drivingLicenceRules: {
      euEeaLicence: {
        exchangeRequired: false,
        canDriveOnExistingLicence: true,
        note: "Les règles exactes dépendent du type de permis et de la durée de séjour ; les titulaires d'un permis UE/EEE peuvent généralement conduire sans échange, certains devront échanger après installation longue durée",
        source: "GOV.UK – Exchange a foreign driving licence"
      },
      nonEuLicence: {
        mustExchangeWithinMonths: 12,
        practicalTestRequired: true,
        internationalDrivingPermitAccepted: true,
        note: "Permis hors UE/EEE généralement valable 12 mois ; ensuite échange + souvent test théorique/pratique requis. Le permis international sert surtout comme traduction, pas comme droit permanent.",
        source: "GOV.UK – Non-GB driving licences"
      }
    },
    
    vehiclePurchaseAndRegistration: {
      requiredDocuments: [
        "Permis de conduire valide",
        "Preuve d'identité et d'adresse (facture, relevé bancaire, etc.)",
        "V5C (logbook) ou formulaire V62 si absence de V5C",
        "Preuve d'assurance",
        "Preuve de paiement de la taxe de circulation (Vehicle tax)"
      ],
      note: "Le V5C est le certificat d'immatriculation émis par la DVLA",
      sources: [
        "GOV.UK – Vehicle registration (new and used vehicles)",
        "DVLA / AutoTrader guides V5C logbook"
      ]
    },
    
    vehicleInspection: {
      motRequiredFromAgeYears: 3,
      motFrequencyYears: 1,
      note: "Premier MOT à partir du 3e anniversaire du véhicule puis chaque année",
      source: "GOV.UK – Getting an MOT"
    }
  },
  
  health: {
    systemOverview: {
      type: "Public (NHS) + secteur privé complémentaire",
      universalCoverage: true,
      description: "Le NHS offre des soins financés par l'impôt, gratuits au point d'usage pour les résidents ordinaires. Possibilité de souscrire une assurance privée pour réduire les délais ou accéder à des cliniques privées.",
      sources: [
        "NHS England / GOV.UK – NHS entitlements & overview",
        "The King's Fund – key facts about the NHS"
      ]
    },
    
    publicSystemCost: {
      forResidents: {
        directMonthlyContribution: 0,
        currency: "GBP",
        note: "Pas de cotisation mensuelle dédiée : financement via impôts et National Insurance"
      },
      forLongTermVisaHolders: {
        immigrationHealthSurchargeAnnualAdult: 1035,
        currency: "GBP",
        note: "IHS payé lors de la demande de visa pour accéder au NHS pendant la durée du visa",
        source: "GOV.UK – Pay for UK healthcare as part of your immigration application"
      }
    },
    
    privateInsurance: {
      averageMonthlyPremiumIndividual: 80,
      currency: "GBP",
      note: "Ordre de grandeur : analyses 2024–2025 sur le marché UK (adult seul, couverture moyenne)",
      sources: [
        "MyTribeInsurance – average cost ~£79.59/mois",
        "Nimblefins – moyenne ~£85/mois pour une police individuelle"
      ]
    },
    
    coverageDetails: {
      gpConsultationCost: {
        price: 0,
        currency: "GBP",
        note: "Consultations avec un GP (médecin généraliste) gratuites pour les patients NHS",
        sources: [
          "NHS England – GP services / registration",
          "NHS England – \"You and your general practice\": GP services are free"
        ]
      },
      emergencyCareAandE: {
        aAndEVisitCost: 0,
        currency: "GBP",
        note: "Accès A&E (urgences) gratuit au point d'entrée ; facturation possible ensuite pour les non-résidents une fois admis en service",
        sources: [
          "NHS.uk – Services free to everyone (A&E, etc.)",
          "NHS hospital guidance – A&E treatment free up to admission"
        ]
      },
      hospitalCareForResidents: {
        costAtPointOfUse: 0,
        currency: "GBP",
        note: "Hospitalisation et soins spécialisés gratuits pour les résidents ordinaires (hors dentaire, optique, prescriptions payantes, etc.)",
        source: "NHS (England) – majority of services free at point of use"
      }
    },
    
    reimbursementAndCharges: {
      publicReimbursementRate: {
        model: "Gratuit au point d'usage plutôt que remboursement partiel",
        note: "Pas de % de remboursement comme en France ; les services NHS sont financés par l'impôt, certains actes (dentaire, optique, prescriptions) restent payants."
      },
      typicalOutOfPocketExamples: {
        nhsPrescriptionEngland: {
          flatFeePerItemApprox: 9.90,
          currency: "GBP",
          note: "Montant indicatif pour une ordonnance standard en Angleterre (exemptions pour certains profils)"
        },
        nhsDentistry: {
          comment: "Soins dentaires NHS payants, avec barèmes par bande ; beaucoup de patients se tournent vers le privé."
        }
      }
    },
    
    vaccinations: {
      mandatoryForVisa: {
        note: "Pas de liste unique publique type \"vaccins obligatoires\" : dépend du type de visa et de l'origine (ex : test tuberculose pour certains pays).",
        source: "GOV.UK – Immigration rules & visa health requirements"
      },
      recommendedForTravel: {
        note: "Pour les résidents UK voyageant à l'étranger, certains vaccins voyage sont gratuits (polio/diphtérie/tétanos, hépatite A, typhoïde, choléra) ; d'autres sont payants.",
        sources: [
          "NHS – Travel vaccinations (liste des vaccins gratuits et payants)",
          "TravelHealthPro – conseils par pays"
        ]
      }
    },
    
    medicalDocumentsForExpat: {
      recommendedDocuments: [
        "Résumé médical en anglais (pathologies chroniques, antécédents)",
        "Liste des traitements en cours + ordonnances (si possible en anglais)",
        "Carnet de vaccination à jour",
        "Traduction certifiée de documents importants si pathologies lourdes",
        "Preuve d'assurance (NHS via IHS, assurance privée, ou couverture de l'employeur)"
      ],
      sources: [
        "NHS – guidance visiteurs et nouveaux arrivants",
        "TravelHealthPro / NHS travel health advice"
      ]
    },
    
    annualHealthBudgetEstimates: {
      currency: "GBP",
      isApproximation: true,
      note: "Estimations pour ton simulateur, basées sur primes moyennes d'assurance privée + dépenses de santé usuelles (hors cas lourd). À afficher comme ordre de grandeur, pas comme valeur officielle.",
      profiles: [
        {
          profile: "Jeune adulte 18-30, bonne santé",
          insurancePerYear: 500,
          consultationsAndGPPerYear: 50,
          medicationPerYear: 100,
          dentalPerYear: 150,
          opticalPerYear: 50,
          totalEstimatedPerYear: 850
        },
        {
          profile: "Adulte 30-60, santé moyenne",
          insurancePerYear: 800,
          consultationsAndGPPerYear: 100,
          medicationPerYear: 200,
          dentalPerYear: 250,
          opticalPerYear: 100,
          totalEstimatedPerYear: 1450
        },
        {
          profile: "Senior 60+",
          insurancePerYear: 1200,
          consultationsAndGPPerYear: 200,
          medicationPerYear: 300,
          dentalPerYear: 300,
          opticalPerYear: 150,
          totalEstimatedPerYear: 2150
        },
        {
          profile: "Adulte avec maladie chronique",
          insurancePerYear: 1200,
          consultationsAndGPPerYear: 250,
          medicationPerYear: 400,
          dentalPerYear: 250,
          opticalPerYear: 100,
          totalEstimatedPerYear: 2200
        }
      ]
    },
    
    europeanHealthCardEquivalent: {
      name: "GHIC (Global Health Insurance Card)",
      appliesTo: "Résidents UK voyageant dans l'EEE + quelques autres pays",
      cost: 0,
      note: "Remplace la carte européenne EHIC pour les résidents UK. Permet l'accès aux soins publics dans l'UE au même tarif que les résidents locaux.",
      sources: [
        "NHS – Apply for a free UK Global Health Insurance Card (GHIC)",
        "UK Government – lancement de la GHIC"
      ]
    }
  }
};

export default ukData;
