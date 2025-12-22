
export const ukLogementData = {
  country: "United Kingdom",
  code: "GB",
  currency: "GBP",
  
  housing: {
    averageRent: {
      national: {
        studio: 1400,
        oneBedroom: 1800,
        twoBedroom: 2400,
        threeBedroom: 3000,
        currency: "GBP",
        note: "Prix moyens nationaux, fortement tirés vers le haut par Londres",
        source: "Rightmove - Rental Price Tracker 2025"
      },
      byCity: {
        London: {
          studio: 1500,
          t2: 2300,
          t3: 3000,
          note: "Prix moyens Londres (zones 1-3), très variable selon quartier",
          source: "https://www.rightmove.co.uk + Zoopla"
        },
        Manchester: {
          studio: 900,
          t2: 1300,
          t3: 1800,
          note: "Prix moyens Manchester centre",
          source: "https://www.rightmove.co.uk"
        },
        Birmingham: {
          studio: 800,
          t2: 1200,
          t3: 1700,
          note: "Prix moyens Birmingham centre",
          source: "https://www.rightmove.co.uk"
        },
        Edinburgh: {
          studio: 950,
          t2: 1400,
          t3: 1900,
          note: "Prix moyens Édimbourg centre",
          source: "https://www.rightmove.co.uk"
        },
        Bristol: {
          studio: 950,
          t2: 1350,
          t3: 1850,
          note: "Prix moyens Bristol centre",
          source: "https://www.rightmove.co.uk"
        },
        Leeds: {
          studio: 750,
          t2: 1100,
          t3: 1500,
          note: "Prix moyens Leeds centre",
          source: "https://www.rightmove.co.uk"
        }
      }
    },
    
    deposit: {
      maxDeposit: {
        amount: "5 weeks of rent maximum",
        note: "Pour un loyer annuel < £50,000. Si ≥ £50,000 : max 6 semaines",
        source: "https://www.gov.uk/tenancy-deposit-protection/overview"
      },
      holdingDeposit: {
        amount: "1 week of rent maximum",
        note: "Réservation du logement pendant la constitution du dossier",
        deadlines: "Propriétaire a 15 jours pour décision, dépôt remboursable si refus"
      },
      protection: {
        mandatory: true,
        schemes: [
          "Deposit Protection Service (DPS)",
          "MyDeposits",
          "Tenancy Deposit Scheme (TDS)"
        ],
        note: "Le propriétaire DOIT protéger le dépôt dans un scheme agréé sous 30 jours",
        source: "https://www.gov.uk/tenancy-deposit-protection"
      },
      prohibitedFees: [
        "Frais d'agence pour le locataire (interdits depuis Tenant Fees Act 2019)",
        "Frais de visite",
        "Frais de constitution de dossier",
        "Frais de check-out (état des lieux sortie)"
      ]
    },
    
    requiredDocuments: [
      {
        document: "Passport or photo ID",
        obligatoire: true,
        note: "Pièce d'identité en cours de validité"
      },
      {
        document: "Right to Rent documents",
        obligatoire: true,
        note: "Passeport + visa/BRP/settled status. Vérification OBLIGATOIRE par le propriétaire"
      },
      {
        document: "Proof of address (bank statement, utility bill)",
        obligatoire: true,
        note: "Justificatif de domicile actuel de moins de 3 mois"
      },
      {
        document: "Last 3 months bank statements",
        obligatoire: true,
        note: "Relevés bancaires pour vérifier les revenus"
      },
      {
        document: "Employment contract or offer letter",
        obligatoire: true,
        note: "Contrat de travail ou lettre d'embauche"
      },
      {
        document: "Employer reference",
        obligatoire: false,
        note: "Référence de l'employeur (coordonnées RH)"
      },
      {
        document: "Previous landlord reference",
        obligatoire: false,
        note: "Référence du précédent propriétaire (fortement recommandé)"
      },
      {
        document: "Guarantor (if income insufficient)",
        obligatoire: false,
        note: "Garant UK-based si revenus < 2.5× le loyer annuel"
      }
    ],
    
    leaseRules: {
      leaseDuration: {
        standard: "6 à 12 mois (Assured Shorthold Tenancy - AST)",
        note: "Le contrat AST est le type standard au UK. Renouvellement tacite ou périodique après.",
        source: "https://www.gov.uk/private-renting/your-rights-and-responsibilities"
      },
      noticePeriod: {
        tenant: {
          duration: "1 à 2 mois selon le contrat",
          note: "Généralement 1 mois pour contrats périodiques, 2 mois pour fixed-term",
          source: "https://www.gov.uk/private-renting/ending-your-tenancy"
        },
        landlord: {
          duration: "2 mois minimum (Section 21 notice)",
          note: "Le propriétaire peut reprendre le logement avec 2 mois de préavis après la période initiale",
          validReasons: "Pas besoin de justification avec Section 21",
          source: "https://www.gov.uk/evicting-tenants/section-21-and-section-8-notices"
        }
      },
      rentIncrease: {
        frequency: "1 fois par an maximum",
        process: "Préavis obligatoire (généralement 1 mois). Tenant peut contester auprès du Tribunal",
        note: "Le loyer ne peut être augmenté qu'après la première année et avec préavis",
        source: "https://www.gov.uk/private-renting/rent-increases"
      },
      rightToRent: {
        mandatory: true,
        description: "Le propriétaire DOIT vérifier que le locataire a le droit légal de résider au UK",
        documents: "Passeport UK, visa valide, BRP (Biometric Residence Permit), settled/pre-settled status",
        penalty: "Amende jusqu'à £3,000 pour le propriétaire si non-respect",
        source: "https://www.gov.uk/check-tenant-right-to-rent-documents"
      }
    },
    
    utilities: {
      averageMonthly: {
        electricity: {
          studio: 60,
          t2: 90,
          t3: 120,
          note: "Électricité + chauffage (gas ou electric heating)",
          source: "Ofgem - estimation moyenne UK 2025"
        },
        water: {
          studio: 35,
          t2: 45,
          t3: 55,
          note: "Facture eau moyenne selon taille du logement",
          source: "Water UK - average bills"
        },
        internet: {
          standard: 30,
          fiber: 40,
          note: "Broadband standard ou fiber",
          source: "Ofcom - broadband prices 2025"
        },
        councilTax: {
          london: 120,
          outside: 100,
          note: "Council Tax OBLIGATOIRE (taxe locale). Varie énormément selon zone et band de la propriété",
          exemptions: "Exemption pour étudiants à temps plein",
          source: "https://www.gov.uk/council-tax"
        }
      },
      totalEstimate: {
        studio: 245,
        t2: 305,
        t3: 345,
        note: "Total charges mensuelles moyennes (électricité + eau + internet + Council Tax Londres)",
        currency: "GBP"
      }
    },
    
    tenantInsurance: {
      mandatory: false,
      recommended: true,
      averageCost: 20,
      currency: "GBP",
      frequency: "par mois",
      coverage: "Contents insurance (biens personnels, responsabilité civile)",
      note: "L'assurance n'est PAS obligatoire au UK mais fortement recommandée",
      source: "Money Saving Expert - contents insurance"
    },
    
    housingBenefits: {
      UniversalCredit: {
        name: "Universal Credit (housing element)",
        eligibility: "Selon revenus, composition du foyer, loyer, zone géographique",
        averageAmount: "Variable selon situation (£100-500/mois)",
        application: "https://www.gov.uk/universal-credit",
        note: "Remplace Housing Benefit pour les nouvelles demandes",
        source: "Gov.uk - Universal Credit"
      },
      LocalHousingAllowance: {
        name: "Local Housing Allowance (LHA)",
        description: "Plafond d'aide au loyer selon la zone géographique",
        note: "Montant maximum du loyer couvert par Universal Credit",
        source: "https://www.gov.uk/housing-benefit"
      },
      DiscrétionaryHousingPayment: {
        name: "Discretionary Housing Payment (DHP)",
        description: "Aide supplémentaire en cas de difficultés exceptionnelles",
        application: "Via le conseil local (local council)",
        source: "https://www.gov.uk/government/publications/discretionary-housing-payments-guidance-manual"
      }
    },
    
    platforms: [
      {
        name: "Rightmove",
        url: "https://www.rightmove.co.uk",
        type: "Market leader",
        note: "Plus grand site immobilier UK, 90% des annonces"
      },
      {
        name: "Zoopla",
        url: "https://www.zoopla.co.uk",
        type: "Comprehensive",
        note: "2ème plus grand site, outils de comparaison de quartiers"
      },
      {
        name: "SpareRoom",
        url: "https://www.spareroom.co.uk",
        type: "Flatshares & rooms",
        note: "Spécialisé en colocations et chambres individuelles"
      },
      {
        name: "OpenRent",
        url: "https://www.openrent.com",
        type: "Landlord direct",
        note: "Location directe propriétaire-locataire, pas de frais d'agence"
      },
      {
        name: "OnTheMarket",
        url: "https://www.onthemarket.com",
        type: "Estate agents",
        note: "Regroupement d'agences immobilières"
      }
    ],
    
    importantNotes: {
      tenantFeesAct: "Tenant Fees Act 2019 : AUCUN frais d'agence pour le locataire. Seuls autorisés : loyer, dépôt (max 5 semaines), holding deposit (max 1 semaine)",
      rightToRent: "Right to Rent check OBLIGATOIRE : le propriétaire DOIT vérifier votre droit de résider au UK (visa, BRP, settled status). Amende £3,000 si non-respect",
      deposit: "Dépôt de garantie DOIT être protégé dans un scheme gouvernemental (DPS, MyDeposits, TDS) sous 30 jours. Certificat remis au locataire",
      councilTax: "Council Tax OBLIGATOIRE en plus du loyer (£100-150/mois selon zone). Exemption étudiants à temps plein. À budgéter impérativement",
      competitiveMarket: "Marché TRÈS compétitif à Londres, Manchester, Bristol : visites groupées, décisions rapides (24-48h), dossier complet indispensable",
      guarantor: "Si revenus < 2.5× le loyer annuel : garant UK-based souvent exigé (ou 6-12 mois de loyer d'avance)",
      inventory: "Inventory (état des lieux) crucial : photos, vidéos, liste détaillée. Check-in et check-out reports à conserver absolument"
    }
  }
};

export default ukLogementData;
