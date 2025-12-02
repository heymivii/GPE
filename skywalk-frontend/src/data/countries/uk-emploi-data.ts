export const ukEmploiData = {
  country: "United Kingdom",
  code: "GB",
  currency: "GBP",
  
  employment: {
    jobMarket: {
      averageSalary: {
        annual: 32000,
        monthlyGross: 2666,
        monthlyNet: 2150,
        currency: "GBP",
        note: "Salaire médian annuel brut (temps plein)",
        source: "ONS - Annual Survey of Hours and Earnings 2025"
      },
      minimumWage: {
        hourly: 11.44,
        monthlyGross: 1982,
        type: "National Living Wage (21 ans et +)",
        lastUpdate: "Avril 2025",
        source: "https://www.gov.uk/national-minimum-wage-rates"
      },
      unemploymentRate: {
        rate: 4.4,
        trend: "Stable",
        source: "ONS Labour Market Overview 2025"
      },
      workingHours: {
        standard: 37.5,
        legalMax: 48,
        unit: "heures par semaine",
        note: "Semaine standard de 37.5h ou 40h. Opt-out possible des 48h max.",
        source: "Gov.uk - Working Time Regulations"
      },
      paidLeave: {
        days: 28,
        unit: "jours par an",
        note: "Inclut généralement les 8 jours fériés (Bank Holidays)",
        source: "Gov.uk - Holiday Entitlement"
      }
    },
    
    salaryByExperience: {
      junior: {
        range: "£22,000 - £30,000 / an",
        note: "Graduate / Entry level"
      },
      confirmed: {
        range: "£30,000 - £45,000 / an",
        note: "Mid-level (3-5 ans)"
      },
      senior: {
        range: "£45,000 - £70,000 / an",
        note: "Senior / Lead (5-10 ans)"
      },
      expert: {
        range: "£70,000+ / an",
        note: "Head of / Director / Expert technique"
      }
    },
    
    inDemandSectors: [
      {
        sector: "Tech & Ingénierie",
        jobs: ["Software Engineer", "Data Analyst", "Civil Engineer", "Cybersecurity"],
        avgSalary: "£45,000 - £80,000",
        demand: "Très élevée",
        note: "Hubs majeurs à Londres, Manchester, Cambridge"
      },
      {
        sector: "Finance & Banque",
        jobs: ["Financial Analyst", "Accountant", "Investment Banker", "Risk Manager"],
        avgSalary: "£50,000 - £100,000+",
        demand: "Élevée",
        note: "Londres est un centre financier mondial"
      },
      {
        sector: "Healthcare (NHS)",
        jobs: ["Nurse", "Doctor", "Care Worker", "Allied Health Professionals"],
        avgSalary: "£28,000 - £60,000",
        demand: "Critique",
        note: "Pénurie chronique, visas facilités (Health and Care Worker Visa)"
      },
      {
        sector: "Marketing & Communication",
        jobs: ["Digital Marketing Manager", "SEO Specialist", "Content Manager"],
        avgSalary: "£30,000 - £50,000",
        demand: "Moyenne",
        note: "Forte concentration à Londres et Manchester"
      },
      {
        sector: "Construction",
        jobs: ["Site Manager", "Quantity Surveyor", "Electrician", "Plumber"],
        avgSalary: "£35,000 - £55,000",
        demand: "Élevée",
        note: "Besoin constant pour projets d'infrastructure et logement"
      },
      {
        sector: "Hospitality",
        jobs: ["Chef", "Hotel Manager", "Restaurant Manager"],
        avgSalary: "£25,000 - £40,000",
        demand: "Élevée",
        note: "Secteur en tension post-Brexit"
      },
      {
        sector: "Éducation",
        jobs: ["Teacher", "University Lecturer", "Tutor"],
        avgSalary: "£30,000 - £45,000",
        demand: "Moyenne",
        note: "Pénurie d'enseignants dans certaines matières (Maths, Sciences)"
      }
    ],
    
    popularCitiesForWork: [
      {
        city: "London",
        region: "Greater London",
        salaryIndex: "Très élevé (+30% vs national)",
        avgSalary: "£42,000",
        sectors: ["Finance", "Tech", "Media", "Law"],
        costOfLivingIndex: "Très élevé",
        note: "Capitale économique, opportunités infinies mais coût de la vie extrême"
      },
      {
        city: "Manchester",
        region: "North West",
        salaryIndex: "Moyen (+Tech premium)",
        avgSalary: "£31,000",
        sectors: ["Tech", "Media (MediaCityUK)", "Startups"],
        costOfLivingIndex: "Moyen",
        note: "2ème hub tech du UK, coût de la vie plus abordable que Londres"
      },
      {
        city: "Birmingham",
        region: "West Midlands",
        salaryIndex: "Moyen",
        avgSalary: "£30,000",
        sectors: ["Industrie", "Services financiers", "Construction"],
        costOfLivingIndex: "Moyen",
        note: "Grande ville industrielle en pleine régénération"
      },
      {
        city: "Edinburgh",
        region: "Scotland",
        salaryIndex: "Élevé",
        avgSalary: "£33,000",
        sectors: ["Finance", "Tech", "Tourisme"],
        costOfLivingIndex: "Élevé",
        note: "Centre financier important (RBS, Lloyds), qualité de vie élevée"
      }
    ],
    
    contractTypes: [
      {
        type: "Full-time employment",
        description: "Contrat à temps plein standard (Permanent)",
        hours: "35-40h / semaine",
        rights: "Congés payés, pension, protection contre licenciement abusif (après 2 ans)"
      },
      {
        type: "Part-time",
        description: "Temps partiel",
        rights: "Mêmes droits que temps plein au prorata"
      },
      {
        type: "Zero-hour contracts",
        description: "Pas d'heures garanties",
        note: "L'employeur n'est pas obligé de donner du travail, l'employé n'est pas obligé d'accepter. Congés payés accumulés.",
        controversy: "Souvent critiqué pour la précarité"
      },
      {
        type: "Temporary / Fixed-term",
        description: "Contrat à durée déterminée",
        usage: "Projets spécifiques, remplacements congé maternité"
      },
      {
        type: "Freelance / Self-employed",
        description: "Travailleur indépendant (Sole Trader ou Limited Company)",
        taxes: "Self Assessment tax return annuel",
        note: "IR35 rules s'appliquent pour les contractants (déguisement de salariat)"
      }
    ],
    
    socialContributions: {
      employee: {
        name: "National Insurance (NI)",
        rate: "8% (variable selon budget)",
        threshold: "À partir de £12,570/an",
        note: "Finance le NHS et la State Pension",
        source: "Gov.uk - National Insurance rates"
      },
      tax: {
        name: "Income Tax (PAYE)",
        bands: [
          { name: "Personal Allowance", rate: "0%", limit: "£12,570" },
          { name: "Basic Rate", rate: "20%", limit: "£12,571 - £50,270" },
          { name: "Higher Rate", rate: "40%", limit: "£50,271 - £125,140" },
          { name: "Additional Rate", rate: "45%", limit: "£125,140+" }
        ]
      }
    },
    
    expatRequirements: {
      workPermit: {
        status: "OBLIGATOIRE pour les citoyens hors UK/Irlande (y compris UE post-Brexit)",
        system: "Points-based immigration system"
      },
      visaTypes: [
        {
          name: "Skilled Worker Visa",
          description: "Visa de travail standard",
          conditions: [
            "Offre d'emploi d'un sponsor agréé (Home Office)",
            "Salaire minimum £38,700 (ou taux du marché si plus élevé)",
            "Niveau d'anglais B1 minimum"
          ],
          duration: "Jusqu'à 5 ans avant renouvellement ou ILR"
        },
        {
          name: "Health and Care Worker Visa",
          description: "Pour le personnel médical et de soin",
          advantages: "Frais de visa réduits, exemption de l'Immigration Health Surcharge",
          conditions: "Offre d'emploi éligible dans le secteur santé/social"
        },
        {
          name: "Graduate Visa",
          description: "Pour les diplômés d'universités UK",
          duration: "2 ans (3 ans pour PhD)",
          conditions: "Avoir terminé un diplôme éligible au UK. Pas besoin d'offre d'emploi.",
          note: "Permet de travailler à tout poste ou chercher du travail"
        },
        {
          name: "Global Talent Visa",
          description: "Pour les leaders ou potentiels leaders",
          sectors: ["Academia", "Research", "Arts & Culture", "Digital Technology"],
          conditions: "Endorsement par un organisme reconnu (ex: Tech Nation, Arts Council)"
        }
      ],
      documentsRequired: [
        "Certificat de parrainage (CoS - Certificate of Sponsorship) fourni par l'employeur",
        "Passeport valide",
        "Preuve de connaissance de l'anglais (Test IELTS UKVI ou diplôme)",
        "Relevés bancaires (preuve de fonds pour subsistance initiale)",
        "Casier judiciaire (Criminal Record Certificate) pour certains métiers (santé, éducation)",
        "Résultats test tuberculose (selon pays d'origine)"
      ]
    },
    
    jobPlatforms: [
      {
        name: "Indeed UK",
        url: "https://www.indeed.co.uk",
        type: "Généraliste",
        note: "Leader du marché, agrégateur massif"
      },
      {
        name: "NHS Jobs",
        url: "https://www.jobs.nhs.uk",
        type: "Santé public",
        note: "Site officiel pour tous les emplois du National Health Service"
      },
      {
        name: "Reed",
        url: "https://www.reed.co.uk",
        type: "Agence & Jobboard",
        note: "Très populaire, guides de salaires utiles"
      },
      {
        name: "Totaljobs",
        url: "https://www.totaljobs.com",
        type: "Généraliste",
        note: "Large volume d'offres"
      },
      {
        name: "LinkedIn UK",
        url: "https://www.linkedin.com/jobs",
        type: "Réseau pro",
        note: "Indispensable pour le secteur privé et le networking"
      },
      {
        name: "Gov.uk Find a Job",
        url: "https://www.gov.uk/find-a-job",
        type: "Service public",
        note: "Service officiel du gouvernement (anciennement Universal Jobmatch)"
      },
      {
        name: "CV-Library",
        url: "https://www.cv-library.co.uk",
        type: "CV Database",
        note: "Les recruteurs cherchent activement dans la CV thèque"
      }
    ],
    
    importantNotes: {
      noticePeriod: "Préavis (Notice period) : souvent 1 mois, mais peut être 3 mois pour les cadres. Vérifier le contrat.",
      probation: "Période d'essai (Probation) : généralement 3 à 6 mois.",
      pension: "Workplace Pension : employeur obligé d'inscrire les employés éligibles (Auto-enrolment). Contribution employeur min 3%.",
      taxes: "PAYE (Pay As You Earn) : impôts prélevés à la source. Vérifier son Tax Code sur la fiche de paie.",
      culture: "Culture : ponctualité stricte, communication polie mais directe, 'After work drinks' fréquents le jeudi/vendredi.",
      cv: "CV UK : Pas de photo, pas de date de naissance, pas d'état civil. Focus sur compétences et réalisations."
    }
  }
};

export default ukEmploiData;
