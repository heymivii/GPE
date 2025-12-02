export const switzerlandEmploiData = {
  country: "Switzerland",
  code: "CH",
  currency: "CHF",
  
  employment: {
    jobMarket: {
      averageSalary: {
        annual: 81600,
        monthlyGross: 6800,
        monthlyNet: 5780,
        currency: "CHF",
        note: "Salaire moyen mensuel (User provided)",
        source: "Données utilisateur"
      },
      minimumWage: {
        hourly: 21.50,
        monthlyGross: 3900,
        type: "Variable par canton (≈ 20–23 CHF/h)",
        lastUpdate: "Décembre 2025",
        source: "Données utilisateur"
      },
      unemploymentRate: {
        rate: 2.3,
        trend: "Stable",
        source: "Données utilisateur"
      },
      workingHours: {
        standard: 42,
        legalMax: 45,
        unit: "heures par semaine",
        note: "Semaine standard de 42h",
        source: "Données utilisateur"
      },
      paidLeave: {
        days: 20,
        unit: "jours par an",
        note: "Minimum légal",
        source: "Données utilisateur"
      }
    },
    
    salaryByExperience: {
      junior: {
        range: "65,000 - 85,000 CHF / an",
        note: "Entry level / Jeune diplômé"
      },
      confirmed: {
        range: "85,000 - 120,000 CHF / an",
        note: "Mid-level (3-5 ans)"
      },
      senior: {
        range: "120,000 - 160,000 CHF / an",
        note: "Senior / Lead (5-10 ans)"
      },
      expert: {
        range: "160,000+ CHF / an",
        note: "Expert / Management"
      }
    },
    
    inDemandSectors: [
      {
        sector: "Finance & assurance",
        jobs: ["Wealth Manager", "Compliance Officer", "Risk Manager"],
        avgSalary: "110,000 - 180,000 CHF",
        demand: "Élevée",
        note: "Zurich et Genève"
      },
      {
        sector: "Informatique & cybersécurité",
        jobs: ["Software Engineer", "Security Analyst", "DevOps"],
        avgSalary: "95,000 - 145,000 CHF",
        demand: "Très élevée",
        note: "Forte pénurie de talents"
      },
      {
        sector: "Santé (médecins, infirmiers)",
        jobs: ["Médecin", "Infirmier", "Spécialiste"],
        avgSalary: "80,000 - 150,000 CHF",
        demand: "Critique",
        note: "Dépendance à la main d'œuvre étrangère"
      },
      {
        sector: "Pharmaceutique",
        jobs: ["R&D", "Quality Control", "Regulatory Affairs"],
        avgSalary: "105,000 - 160,000 CHF",
        demand: "Très élevée",
        note: "Bâle est un hub mondial"
      },
      {
        sector: "Horlogerie",
        jobs: ["Horloger", "Microtechnicien", "Ingénieur qualité"],
        avgSalary: "70,000 - 110,000 CHF",
        demand: "Élevée",
        note: "Arc jurassien"
      },
      {
        sector: "Ingénierie",
        jobs: ["Civil", "Mécanique", "Électrique"],
        avgSalary: "95,000 - 135,000 CHF",
        demand: "Élevée",
        note: "Industrie de pointe"
      },
      {
        sector: "Hôtellerie-restauration",
        jobs: ["Chef", "Gérant", "Personnel de service"],
        avgSalary: "55,000 - 85,000 CHF",
        demand: "Moyenne",
        note: "Saisonnier (Alpes) et urbain"
      }
    ],
    
    contractTypes: [
      {
        type: "CDI (contrat illimité)",
        description: "Standard. Période d'essai 1-3 mois.",
        common: true
      },
      {
        type: "CDD",
        description: "Contrat à durée déterminée.",
        common: false
      },
      {
        type: "Contrat d'essai longue durée",
        description: "Spécifique à certains secteurs.",
        common: false
      },
      {
        type: "Freelance (indépendant)",
        description: "Statut d'indépendant, charges à payer soi-même.",
        common: true
      },
      {
        type: "Temporaire (via agence)",
        description: "Intérim, très courant.",
        common: true
      }
    ],
    
    expatRequirements: {
      visaTypes: [
        {
          name: "Permis L (court séjour)",
          target: "Contrats < 1 an",
          conditions: "Contrat de travail requis",
          validity: "3 à 12 mois"
        },
        {
          name: "Permis B (résidence annuelle)",
          target: "Contrats > 1 an ou indéterminée",
          conditions: "Contrat de travail requis",
          validity: "5 ans (UE/AELE), 1 an (Hors UE)"
        },
        {
          name: "Permis C (résidence permanente)",
          target: "Résidents longue durée",
          conditions: "Après 5 ou 10 ans de séjour",
          validity: "Illimitée"
        },
        {
          name: "Permis G (frontalier)",
          target: "Frontaliers",
          conditions: "Retour hebdomadaire au domicile",
          validity: "5 ans"
        }
      ],
      documents: [
        "Contrat de travail signé",
        "Passeport",
        "Casier judiciaire",
        "CV complet (style Suisse : photo + références)",
        "Attestation de logement",
        "Dossier d’assurance"
      ]
    },
    
    jobPlatforms: [
      { name: "JobUp", url: "https://www.jobup.ch", type: "Leader Romandie" },
      { name: "Indeed Suisse", url: "https://www.indeed.ch", type: "Agrégateur" },
      { name: "Jobs.ch", url: "https://www.jobs.ch", type: "Leader National" },
      { name: "LinkedIn Suisse", url: "https://www.linkedin.com/jobs", type: "Réseau pro" },
      { name: "Michael Page CH", url: "https://www.michaelpage.ch", type: "Recrutement spécialisé" }
    ]
  }
};
