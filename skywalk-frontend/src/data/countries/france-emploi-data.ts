
export const franceEmploiData = {
  country: "France",
  code: "FR",
  currency: "EUR",
  
  employment: {
    jobMarket: {
      averageSalary: {
        net: 2550,
        gross: 3290,
        note: "Salaire médian net mensuel tous secteurs confondus",
        source: "INSEE - Enquête Emploi 2025"
      },
      minimumWage: {
        net: 1766.92,
        gross: 2004.55,
        hourly: 11.88,
        type: "SMIC mensuel (Salaire Minimum Interprofessionnel de Croissance)",
        basedOn: "35 heures par semaine (151.67h/mois)",
        lastUpdate: "1er janvier 2025",
        source: "https://www.service-public.fr/particuliers/vosdroits/F2300"
      },
      unemploymentRate: {
        rate: 7.2,
        quarter: "Q3 2025",
        trend: "Stable par rapport à Q2 2025",
        source: "INSEE - Enquête Emploi Trimestrielle"
      },
      workingHours: {
        legal: 35,
        unit: "heures par semaine",
        note: "Durée légale du travail en France depuis 2002 (loi Aubry)",
        overtime: "Heures supplémentaires majorées : +25% (8 premières), +50% (suivantes)",
        source: "Code du travail - Article L3121-27"
      },
      paidLeave: {
        days: 25,
        unit: "jours ouvrés par an",
        note: "5 semaines de congés payés (2.5 jours par mois travaillé)",
        acquisition: "Acquis du 1er juin N-1 au 31 mai N",
        publicHolidays: 11,
        source: "Code du travail - Articles L3141-1 et suivants"
      }
    },
    
    salaryByExperience: {
      junior: {
        range: "1800-2400 EUR net/mois",
        note: "0-3 ans d'expérience"
      },
      confirmed: {
        range: "2500-3500 EUR net/mois",
        note: "3-7 ans d'expérience"
      },
      senior: {
        range: "3500-5500 EUR net/mois",
        note: "7-15 ans d'expérience"
      },
      expert: {
        range: "5500+ EUR net/mois",
        note: "Plus de 15 ans d'expérience"
      }
    },
    
    inDemandSectors: [
      {
        sector: "Tech & Développement",
        jobs: ["Développeur Full Stack", "Data Scientist", "DevOps Engineer", "Cybersécurité", "Cloud Architect"],
        avgSalary: "3200-4500 EUR net/mois",
        demand: "Très élevée",
        note: "Pénurie de talents dans le numérique"
      },
      {
        sector: "Santé",
        jobs: ["Infirmier.e", "Aide-soignant.e", "Médecin généraliste", "Pharmacien.ne", "Kinésithérapeute"],
        avgSalary: "2000-4500 EUR net/mois",
        demand: "Très élevée",
        note: "Forte demande post-Covid, vieillissement de la population"
      },
      {
        sector: "Logistique & Transport",
        jobs: ["Chauffeur-livreur", "Cariste", "Magasinier", "Responsable supply chain", "Conducteur de transport en commun"],
        avgSalary: "1900-3000 EUR net/mois",
        demand: "Élevée",
        note: "Boom e-commerce et logistique urbaine"
      },
      {
        sector: "BTP (Bâtiment & Travaux Publics)",
        jobs: ["Maçon", "Électricien", "Plombier", "Conducteur d'engins", "Chef de chantier"],
        avgSalary: "2000-3500 EUR net/mois",
        demand: "Élevée",
        note: "Rénovation énergétique, JO 2024, Grand Paris Express"
      },
      {
        sector: "Hôtellerie-Restauration",
        jobs: ["Cuisinier", "Serveur", "Réceptionniste", "Chef de rang", "Gouvernant.e"],
        avgSalary: "1800-2500 EUR net/mois",
        demand: "Très élevée",
        note: "Difficulté de recrutement chronique, conditions de travail difficiles"
      },
      {
        sector: "Éducation",
        jobs: ["Professeur des écoles", "Professeur collège/lycée", "Formateur", "Assistant d'éducation"],
        avgSalary: "2000-3000 EUR net/mois",
        demand: "Élevée",
        note: "Revalorisation des salaires enseignants en cours"
      },
      {
        sector: "Commerce & Vente",
        jobs: ["Vendeur conseil", "Commercial B2B", "Responsable de magasin", "Category manager"],
        avgSalary: "1900-3500 EUR net/mois",
        demand: "Moyenne",
        note: "Transformation digitale du commerce"
      }
    ],
    
    popularCitiesForWork: [
      {
        city: "Paris",
        region: "Île-de-France",
        salaryIndex: "Très élevé (+20-30% vs moyenne nationale)",
        avgSalary: "3200 EUR net/mois",
        sectors: ["Finance", "Tech", "Luxe", "Conseil", "Média"],
        costOfLivingIndex: "Très élevé",
        note: "Hub économique français, 1er bassin d'emploi européen"
      },
      {
        city: "Lyon",
        region: "Auvergne-Rhône-Alpes",
        salaryIndex: "Élevé (+10-15% vs moyenne)",
        avgSalary: "2700 EUR net/mois",
        sectors: ["Santé-Biotech", "Chimie", "Tech", "Finance"],
        costOfLivingIndex: "Élevé",
        note: "2ème ville économique, capitale de la gastronomie"
      },
      {
        city: "Toulouse",
        region: "Occitanie",
        salaryIndex: "Tech & Aérospatial (élevé dans ces secteurs)",
        avgSalary: "2600 EUR net/mois",
        sectors: ["Aérospatiale (Airbus)", "Tech", "Défense", "Santé"],
        costOfLivingIndex: "Moyen",
        note: "Capitale européenne de l'aéronautique et du spatial"
      },
      {
        city: "Nantes",
        region: "Pays de la Loire",
        salaryIndex: "Bon rapport qualité/prix",
        avgSalary: "2450 EUR net/mois",
        sectors: ["Tech (Web Island)", "Agroalimentaire", "Naval", "Créatif"],
        costOfLivingIndex: "Moyen",
        note: "Ville attractive, dynamisme startup et qualité de vie"
      },
      {
        city: "Bordeaux",
        region: "Nouvelle-Aquitaine",
        salaryIndex: "Moyen à élevé",
        avgSalary: "2500 EUR net/mois",
        sectors: ["Vin et spiritueux", "Aéronautique", "Tech", "Tourisme"],
        costOfLivingIndex: "Élevé (loyers)",
        note: "Forte croissance démographique, attractivité résidentielle"
      },
      {
        city: "Lille",
        region: "Hauts-de-France",
        salaryIndex: "Moyen",
        avgSalary: "2400 EUR net/mois",
        sectors: ["Distribution", "Textile", "Services", "E-commerce"],
        costOfLivingIndex: "Moyen",
        note: "Hub logistique européen (proximité Belgique, UK)"
      }
    ],
    
    contractTypes: [
      {
        type: "CDI (Contrat à Durée Indéterminée)",
        description: "Contrat standard sans date de fin, temps plein ou partiel",
        trialPeriod: "2 à 4 mois selon qualification (renouvelable une fois)",
        noticePeriod: "1 à 3 mois selon ancienneté",
        advantages: "Stabilité, accès crédit immobilier, protection maximale",
        source: "Code du travail - Article L1221-1"
      },
      {
        type: "CDD (Contrat à Durée Déterminée)",
        description: "Contrat temporaire avec date de fin précise",
        maxDuration: "18 mois maximum (renouvellements inclus)",
        validReasons: ["Remplacement salarié absent", "Accroissement temporaire d'activité", "Travaux saisonniers"],
        endBonus: "Prime de précarité de 10% du salaire brut total",
        note: "Ne peut remplacer un CDI pour un poste permanent",
        source: "Code du travail - Article L1242-1"
      },
      {
        type: "Intérim (Travail temporaire)",
        description: "Missions courtes via agence d'intérim",
        duration: "De quelques jours à 18 mois",
        endBonus: "Prime de précarité de 10% + indemnités de congés payés (10%)",
        sectors: ["Industrie", "Logistique", "BTP", "Événementiel"],
        note: "Bonne porte d'entrée vers CDI (30% des intérimaires embauchés en CDI)"
      },
      {
        type: "Freelance / Auto-entrepreneur",
        description: "Travailleur indépendant, statut simplifié",
        revenueLimit: "77,700 EUR/an pour prestations de services",
        socialCharges: "21.2% à 22% du chiffre d'affaires",
        advantages: "Liberté, flexibilité, régime fiscal simplifié",
        disadvantages: "Pas de congés payés, pas d'assurance chômage, recherche clients",
        source: "https://www.autoentrepreneur.urssaf.fr/"
      },
      {
        type: "Alternance (Apprentissage / Professionnalisation)",
        description: "Contrat formation en alternance études/entreprise",
        age: "16-29 ans (pas de limite si handicap)",
        salary: "27% à 100% du SMIC selon âge et niveau",
        advantages: "Formation + expérience + diplôme, exonérations sociales",
        source: "Code du travail - Article L6221-1"
      }
    ],
    
    socialContributions: {
      employee: {
        rate: "~22%",
        breakdown: [
          { name: "CSG (Contribution Sociale Généralisée)", rate: "9.2%" },
          { name: "CRDS (Contribution Remboursement Dette Sociale)", rate: "0.5%" },
          { name: "Assurance maladie", rate: "0%" },
          { name: "Assurance vieillesse", rate: "6.9%" },
          { name: "Assurance chômage", rate: "0%" },
          { name: "Retraite complémentaire", rate: "~3-4%" }
        ],
        note: "Environ 22% de différence entre salaire brut et net",
        source: "URSSAF 2025"
      },
      employer: {
        rate: "~42%",
        note: "Charges patronales en plus du salaire brut",
        source: "URSSAF 2025"
      }
    },
    
    expatRequirements: {
      euCitizens: {
        workPermit: "Pas de permis de travail nécessaire",
        residenceCard: "Carte de séjour UE recommandée après 3 mois (pas obligatoire)",
        rights: "Libre circulation et établissement dans l'UE",
        source: "https://www.service-public.fr/particuliers/vosdroits/F2651"
      },
      nonEuCitizens: {
        workPermit: "Autorisation de travail OBLIGATOIRE",
        processedBy: "DIRECCTE (Direction Régionale des Entreprises)",
        timeline: "2 à 4 mois de délai",
        employerRole: "L'employeur doit faire la demande et prouver qu'aucun candidat UE n'est disponible",
        source: "https://www.service-public.fr/particuliers/vosdroits/F2728"
      },
      visaTypes: [
        {
          name: "Passeport Talent",
          description: "Visa pour profils qualifiés et talents internationaux",
          duration: "4 ans maximum",
          categories: [
            "Salarié qualifié (diplôme master + contrat ≥ 53,836 EUR/an)",
            "Créateur d'entreprise",
            "Investisseur",
            "Chercheur",
            "Artiste"
          ],
          advantages: "Famille accompagnante peut travailler, renouvellement facilité",
          source: "https://www.service-public.fr/particuliers/vosdroits/F16922"
        },
        {
          name: "Salarié détaché",
          description: "Pour salariés envoyés temporairement en France par employeur étranger",
          duration: "Mission temporaire (généralement 1-2 ans)",
          conditions: "Contrat de travail avec entreprise étrangère, mission précise",
          source: "https://www.service-public.fr/particuliers/vosdroits/F31132"
        },
        {
          name: "Visa long séjour travail",
          description: "Visa standard pour travailler en France",
          duration: "1 an, renouvelable",
          conditions: "Contrat de travail + autorisation de travail validée",
          source: "https://france-visas.gouv.fr/"
        },
        {
          name: "Vacances-Travail (PVT/WHV)",
          description: "Pour jeunes de 18-30 ans de pays partenaires",
          duration: "1 an (2 ans pour Canada)",
          countries: "Canada, Australie, Nouvelle-Zélande, Japon, Corée du Sud, Argentine, etc.",
          source: "https://www.service-public.fr/particuliers/vosdroits/F13517"
        }
      ],
      documentsRequired: [
        {
          document: "Contrat de travail signé",
          obligatoire: true,
          note: "Contrat détaillant fonction, salaire, durée, lieu"
        },
        {
          document: "Justificatifs de qualifications",
          obligatoire: true,
          note: "Diplômes, certificats de travail, CV détaillé"
        },
        {
          document: "Passeport valide",
          obligatoire: true,
          note: "Valide au moins 3 mois après fin du séjour"
        },
        {
          document: "Justificatif de logement en France",
          obligatoire: true,
          note: "Bail, attestation d'hébergement, réservation hôtel"
        },
        {
          document: "Assurance santé",
          obligatoire: true,
          note: "Couverture maladie/rapatriement pour la durée du séjour"
        },
        {
          document: "Certificat médical",
          obligatoire: false,
          note: "Selon type de visa et pays d'origine (visite médicale OFII)"
        },
        {
          document: "Casier judiciaire",
          obligatoire: false,
          note: "Extrait de casier judiciaire du pays d'origine (selon visa)"
        }
      ]
    },
    
    jobPlatforms: [
      {
        name: "Pôle Emploi",
        url: "https://www.pole-emploi.fr",
        type: "Service public",
        note: "Service public de l'emploi, OBLIGATOIRE pour inscription chômage, offres tous secteurs"
      },
      {
        name: "Indeed France",
        url: "https://www.indeed.fr",
        type: "Généraliste",
        note: "Agrégateur d'offres, plus grand site emploi mondial"
      },
      {
        name: "APEC",
        url: "https://www.apec.fr",
        type: "Cadres",
        note: "Spécialisé cadres et jeunes diplômés Bac+4/5, conseils carrière"
      },
      {
        name: "Welcome to the Jungle",
        url: "https://www.welcometothejungle.com/fr",
        type: "Tech & Startups",
        note: "Focus startups, scale-ups, culture d'entreprise, vidéos immersives"
      },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/jobs",
        type: "Réseau professionnel",
        note: "Indispensable pour networking, approche directe recruteurs"
      },
      {
        name: "Monster",
        url: "https://www.monster.fr",
        type: "Généraliste",
        note: "Site historique, offres variées tous secteurs"
      },
      {
        name: "LesJeudis",
        url: "https://www.lesjeudis.com",
        type: "Tech & Digital",
        note: "Spécialisé IT, digital, e-commerce"
      },
      {
        name: "Cadremploi",
        url: "https://www.cadremploi.fr",
        type: "Cadres",
        note: "Offres cadres expérimentés, conseils carrière"
      }
    ],
    
    importantNotes: {
      workingCulture: "Culture du travail française : hiérarchie respectée mais accessible, importance de la vie privée (35h), longues pauses déjeuner (1-2h), formalisme relatif (vouvoiement en entreprise)",
      languageRequirement: "Français INDISPENSABLE dans la majorité des secteurs (niveau B2 minimum). Anglais seul suffisant dans certaines startups tech et multinationales",
      cvFormat: "CV français : 1-2 pages, photo professionnelle recommandée mais non obligatoire, état civil complet, lettre de motivation OBLIGATOIRE (personnalisée)",
      negotiation: "Salaire négociable : primes, RTT (jours de repos compensatoire pour 35h), télétravail, mutuelle, tickets restaurant, participation/intéressement",
      trialPeriod: "Période d'essai : employeur ou salarié peut rompre sans préavis ni indemnités. Bien négocier avant de signer !",
      unemployment: "Assurance chômage (ARE) : 57% du salaire brut pendant 18-24 mois si cotisations suffisantes. Inscription Pôle Emploi obligatoire",
      retirement: "Retraite : système par répartition, âge légal 64 ans (réforme 2023), besoin de 43 annuités de cotisation pour retraite pleine"
    }
  }
};

export default franceEmploiData;
