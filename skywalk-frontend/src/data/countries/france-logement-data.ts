
export const franceLogementData = {
  country: "France",
  code: "FR",
  currency: "EUR",
  
  housing: {
    averageRent: {
      national: {
        studio: 750,
        oneBedroom: 900,
        twoBedroom: 1300,
        threeBedroom: 1600,
        currency: "EUR",
        note: "Prix moyens nationaux hors Paris et grandes métropoles",
        source: "SeLoger - Baromètre des loyers 2025"
      },
      byCity: {
        Paris: {
          studio: 1100,
          t2: 1600,
          t3: 2300,
          note: "Prix moyens Paris intra-muros, encadrement des loyers applicable",
          source: "https://www.seloger.com + CLAMEUR (Cadastre des Loyers)"
        },
        Lyon: {
          studio: 750,
          t2: 1100,
          t3: 1500,
          note: "Prix moyens Lyon centre, encadrement des loyers applicable",
          source: "https://www.seloger.com"
        },
        Marseille: {
          studio: 650,
          t2: 900,
          t3: 1300,
          note: "Prix moyens Marseille centre",
          source: "https://www.seloger.com"
        },
        Toulouse: {
          studio: 600,
          t2: 850,
          t3: 1200,
          note: "Prix moyens Toulouse centre",
          source: "https://www.seloger.com"
        },
        Bordeaux: {
          studio: 700,
          t2: 950,
          t3: 1400,
          note: "Prix moyens Bordeaux centre",
          source: "https://www.seloger.com"
        },
        Lille: {
          studio: 600,
          t2: 850,
          t3: 1150,
          note: "Prix moyens Lille centre, encadrement des loyers applicable",
          source: "https://www.seloger.com"
        }
      }
    },
    
    deposit: {
      furnished: {
        maxAmount: "2 mois de loyer maximum",
        note: "Pour un logement meublé",
        source: "https://www.service-public.fr/particuliers/vosdroits/F31269"
      },
      unfurnished: {
        maxAmount: "1 mois de loyer maximum",
        note: "Pour un logement non meublé",
        source: "https://www.service-public.fr/particuliers/vosdroits/F31269"
      },
      禁止: [
        "Frais de visite",
        "Frais de constitution de dossier",
        "Frais de rédaction du bail"
      ]
    },
    
    requiredDocuments: [
      {
        document: "Carte d'identité ou passeport",
        obligatoire: true,
        note: "Pièce d'identité en cours de validité"
      },
      {
        document: "Justificatif de revenus (3 dernières fiches de paie)",
        obligatoire: true,
        note: "Ou avis d'imposition pour les indépendants"
      },
      {
        document: "Contrat de travail ou attestation employeur",
        obligatoire: true,
        note: "CDI, CDD, promesse d'embauche"
      },
      {
        document: "Avis d'imposition N-1",
        obligatoire: true,
        note: "Dernier avis d'imposition sur le revenu"
      },
      {
        document: "Justificatif de domicile actuel",
        obligatoire: true,
        note: "Quittance de loyer, facture énergie de moins de 3 mois"
      },
      {
        document: "Garantie locative (garant ou Visale)",
        obligatoire: false,
        note: "Garant physique ou dispositif Visale (Action Logement)"
      },
      {
        document: "RIB (Relevé d'Identité Bancaire)",
        obligatoire: true,
        note: "Pour les prélèvements automatiques"
      }
    ],
    
    leaseRules: {
      leaseDuration: {
        unfurnished: "3 ans (6 ans pour personne morale)",
        furnished: "1 an (9 mois pour étudiant)",
        note: "Durée minimale de bail",
        source: "https://www.service-public.fr/particuliers/vosdroits/F920"
      },
      noticePeriod: {
        tenant: {
          zoneTendue: "1 mois de préavis",
          zoneNormale: "3 mois de préavis",
          furnished: "1 mois de préavis",
          note: "Zone tendue : Paris, Lyon, Lille, Marseille, Bordeaux, etc.",
          source: "https://www.service-public.fr/particuliers/vosdroits/F1168"
        },
        landlord: {
          duration: "6 mois de préavis minimum",
          validReasons: ["Vendre le logement", "Y habiter soi-même", "Motif légitime et sérieux"],
          source: "https://www.service-public.fr/particuliers/vosdroits/F929"
        }
      },
      rentControl: {
        applicable: true,
        cities: ["Paris", "Lyon", "Lille", "Plaine Commune (93)", "Est Ensemble (93)", "Hellemmes", "Lomme"],
        note: "Encadrement des loyers : loyer de référence, loyer de référence majoré et minoré par quartier",
        maxIncrease: "Loyer de référence majoré + 20% maximum",
        source: "https://www.service-public.fr/particuliers/vosdroits/F1310"
      },
      rentIncrease: {
        annual: "IRL (Indice de Référence des Loyers) publié par l'INSEE chaque trimestre",
        maxIncrease: "Variation de l'IRL sur 12 mois",
        source: "https://www.insee.fr/fr/statistiques/"
      }
    },
    
    utilities: {
      averageMonthly: {
        electricity: {
          studio: 50,
          t2: 70,
          t3: 90,
          note: "Chauffage électrique inclus, estimation moyenne",
          source: "EDF - estimation consommation moyenne"
        },
        water: {
          perPerson: 30,
          note: "Environ 30€/mois par personne",
          source: "Estimation moyenne France"
        },
        internet: {
          fiber: 30,
          adsl: 25,
          note: "Box internet standard",
          source: "Comparateurs internet (Free, Orange, SFR, Bouygues)"
        },
        heatingGas: {
          studio: 60,
          t2: 90,
          t3: 120,
          note: "Chauffage au gaz naturel, estimation hiver",
          source: "Engie - estimation consommation moyenne"
        }
      },
      totalEstimate: {
        studio: 150,
        t2: 200,
        t3: 250,
        note: "Total charges mensuelles moyennes (électricité + eau + internet)",
        currency: "EUR"
      }
    },
    
    tenantInsurance: {
      mandatory: true,
      averageCost: 15,
      currency: "EUR",
      frequency: "par mois",
      coverage: "Risques locatifs (incendie, dégâts des eaux, responsabilité civile)",
      note: "Assurance habitation obligatoire pour tous les locataires",
      source: "https://www.service-public.fr/particuliers/vosdroits/F2129"
    },
    
    housingBenefits: {
      APL: {
        name: "Aide Personnalisée au Logement",
        eligibility: "Selon revenus, composition du foyer, loyer, zone géographique",
        averageAmount: "Variable de 50€ à 300€/mois",
        application: "https://www.caf.fr/",
        source: "CAF - Caisse d'Allocations Familiales"
      },
      ActionLogement: {
        name: "Action Logement (ex-1% logement)",
        services: [
          "Garantie Visale (caution gratuite pour -30 ans et salariés)",
          "Avance Loca-Pass (prêt pour dépôt de garantie)",
          "Mobili-Pass (aide à la mobilité professionnelle)"
        ],
        source: "https://www.actionlogement.fr/"
      }
    },
    
    platforms: [
      {
        name: "SeLoger",
        url: "https://www.seloger.com",
        type: "Agences + Particuliers",
        note: "Leader des annonces immobilières en France"
      },
      {
        name: "PAP (De Particulier à Particulier)",
        url: "https://www.pap.fr",
        type: "Particuliers uniquement",
        note: "Pas de frais d'agence"
      },
      {
        name: "Leboncoin",
        url: "https://www.leboncoin.fr/recherche/locations",
        type: "Particuliers + Agences",
        note: "Grande variété d'annonces"
      },
      {
        name: "Spotahome",
        url: "https://www.spotahome.com/fr/paris",
        type: "Plateforme internationale",
        note: "Visites virtuelles, idéal pour expatriés"
      },
      {
        name: "Appartager",
        url: "https://www.appartager.com",
        type: "Colocations",
        note: "Spécialisé en colocation"
      },
      {
        name: "La Carte des Colocs",
        url: "https://www.lacartedescolocs.fr",
        type: "Colocations",
        note: "Communauté colocation France"
      }
    ],
    
    importantNotes: {
      discrimination: "La discrimination dans l'accès au logement est interdite (origine, religion, situation familiale, etc.)",
      visale: "Le dispositif Visale remplace gratuitement un garant physique pour les -30 ans et les salariés en mobilité",
      rentToIncomeRatio: "Les propriétaires exigent généralement un revenu ≥ 3× le loyer charges comprises",
      competitiveMarket: "Marché très tendu à Paris, Lyon, Bordeaux : préparer un dossier complet en avance",
      encadrementLoyers: "Encadrement des loyers à Paris, Lyon, Lille : vérifier le loyer de référence de votre quartier"
    }
  }
};

export default franceLogementData;
