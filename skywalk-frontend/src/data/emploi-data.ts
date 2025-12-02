export interface EmploiData {
  unemploymentRate: number;
  avgSalaryNet: number;
  minWageNet: number;
  workingHours: number;
  paidLeaveDays: number;
  socialChargesEmployee: number;
}

export interface JobSector {
  name: string;
  demand: 'Très élevée' | 'Élevée' | 'Moyenne' | 'Faible';
  avgSalary: string;
}

export const emploiDataByCountry: Record<string, EmploiData> = {
  france: {
    unemploymentRate: 7.2,
    avgSalaryNet: 2550,
    minWageNet: 1767,
    workingHours: 35,
    paidLeaveDays: 25,
    socialChargesEmployee: 22,
  },
  'royaume-uni': {
    unemploymentRate: 4.4,
    avgSalaryNet: 2580,
    minWageNet: 1920,
    workingHours: 37.5,
    paidLeaveDays: 28,
    socialChargesEmployee: 12,
  },
  suisse: {
    unemploymentRate: 2.3,
    avgSalaryNet: 6125,
    minWageNet: 3500,
    workingHours: 42,
    paidLeaveDays: 20,
    socialChargesEmployee: 15,
  },
};

export const inDemandSectorsByCountry: Record<string, JobSector[]> = {
  france: [
    { name: 'Tech & Développement', demand: 'Très élevée', avgSalary: '3200-4500€' },
    { name: 'Santé', demand: 'Très élevée', avgSalary: '2000-4500€' },
    { name: 'Logistique & Transport', demand: 'Élevée', avgSalary: '1900-3000€' },
    { name: 'BTP', demand: 'Élevée', avgSalary: '2000-3500€' },
    { name: 'Hôtellerie-Restauration', demand: 'Très élevée', avgSalary: '1800-2500€' },
  ],
  'royaume-uni': [
    { name: 'Tech & Ingénierie', demand: 'Très élevée', avgSalary: '£45,000-80,000' },
    { name: 'Finance & Banque', demand: 'Élevée', avgSalary: '£50,000-100,000+' },
    { name: 'Healthcare (NHS)', demand: 'Très élevée', avgSalary: '£28,000-60,000' },
    { name: 'Marketing & Com', demand: 'Moyenne', avgSalary: '£30,000-50,000' },
    { name: 'Construction', demand: 'Élevée', avgSalary: '£35,000-65,000' },
  ],
  suisse: [
    { name: 'Finance & assurance', demand: 'Élevée', avgSalary: '110,000-180,000 CHF' },
    { name: 'Informatique & cybersécurité', demand: 'Très élevée', avgSalary: '95,000-145,000 CHF' },
    { name: 'Santé (médecins, infirmiers)', demand: 'Très élevée', avgSalary: '80,000-150,000 CHF' },
    { name: 'Pharmaceutique', demand: 'Très élevée', avgSalary: '105,000-160,000 CHF' },
    { name: 'Horlogerie', demand: 'Élevée', avgSalary: '70,000-110,000 CHF' },
  ],
};

export const contractTypesByCountry: Record<string, string[]> = {
  france: [
    'CDI (Contrat à Durée Indéterminée)',
    'CDD (Contrat à Durée Déterminée)',
    'Intérim (Travail temporaire)',
    'Freelance / Auto-entrepreneur',
    'Alternance (Apprentissage / Professionnalisation)',
  ],
  'royaume-uni': [
    'Permanent contract (CDI équivalent)',
    'Fixed-term contract (CDD équivalent)',
    'Temporary contract (Intérim)',
    'Zero-hours contract (Heures flexibles)',
    'Self-employed / Contractor',
  ],
  suisse: [
    'CDI (contrat illimité)',
    'CDD',
    'Contrat d\'essai longue durée',
    'Freelance (indépendant)',
    'Temporaire (via agence)',
  ],
};

export const jobPlatformsByCountry: Record<string, Array<{ name: string; url: string; type: string }>> = {
  france: [
    { name: 'Pôle Emploi', url: 'https://www.pole-emploi.fr', type: 'Service public' },
    { name: 'Indeed France', url: 'https://www.indeed.fr', type: 'Généraliste' },
    { name: 'APEC', url: 'https://www.apec.fr', type: 'Cadres' },
    { name: 'Welcome to the Jungle', url: 'https://www.welcometothejungle.com/fr', type: 'Tech & Startups' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs', type: 'Réseau professionnel' },
  ],
  'royaume-uni': [
    { name: 'Indeed UK', url: 'https://uk.indeed.com', type: 'Market leader' },
    { name: 'NHS Jobs', url: 'https://www.jobs.nhs.uk', type: 'Public Sector' },
    { name: 'Reed', url: 'https://www.reed.co.uk', type: 'Comprehensive' },
    { name: 'Totaljobs', url: 'https://www.totaljobs.com', type: 'Généraliste' },
    { name: 'LinkedIn UK', url: 'https://www.linkedin.com/jobs', type: 'Professional network' },
    { name: 'Gov.uk Jobs', url: 'https://www.gov.uk/find-a-job', type: 'Government' },
  ],
  suisse: [
    { name: 'JobUp', url: 'https://www.jobup.ch', type: 'Leader Romandie' },
    { name: 'Indeed Suisse', url: 'https://www.indeed.ch', type: 'Agrégateur' },
    { name: 'Jobs.ch', url: 'https://www.jobs.ch', type: 'Leader National' },
    { name: 'LinkedIn Suisse', url: 'https://www.linkedin.com/jobs', type: 'Réseau pro' },
    { name: 'Michael Page CH', url: 'https://www.michaelpage.ch', type: 'Recrutement spécialisé' },
  ],
};

export const workPermitRequirements: Record<string, string[]> = {
  france: [
    'Citoyens UE : pas de permis de travail nécessaire',
    'Hors UE : autorisation de travail OBLIGATOIRE (DIRECCTE)',
    'Passeport Talent : profils qualifiés (diplôme master + salaire ≥ 53,836€/an)',
    'Visa long séjour travail : contrat + autorisation validée',
    'PVT (Vacances-Travail) : 18-30 ans, pays partenaires, 1-2 ans',
  ],
  'royaume-uni': [
    'Citoyens UE post-Brexit : Skilled Worker visa requis',
    'Skilled Worker visa : salaire minimum £38,700/an (£29,000 pour certains métiers)',
    'Health and Care Worker visa : NHS et care sector',
    'Graduate visa : 2 ans pour diplômés UK',
    'Youth Mobility Scheme : 18-30 ans, pays partenaires, 2 ans',
  ],
  suisse: [
    'Permis L (court séjour) : contrats < 1 an',
    'Permis B (résidence annuelle) : contrats > 1 an',
    'Permis C (résidence permanente) : après 5-10 ans',
    'Permis G (frontalier) : retour hebdo au domicile',
    'Documents : Contrat, Passeport, Casier judiciaire, CV complet',
  ],
};

export const employmentNotes: Record<string, string[]> = {
  france: [
    'Français indispensable (niveau B2 minimum) sauf certaines startups tech',
    'CV + lettre de motivation obligatoires, photo professionnelle recommandée',
    'Période d\'essai : 2-4 mois négociable, rupture libre sans indemnités',
    'Chômage : 57% du salaire pendant 18-24 mois si cotisations suffisantes',
    '35h légales avec possibilité heures supplémentaires majorées (+25% puis +50%)',
  ],
  'royaume-uni': [
    'Anglais professionnel indispensable (niveau C1 recommandé)',
    'CV anglo-saxon : max 2 pages, pas de photo, pas de date de naissance',
    'Right to Work check obligatoire : passeport + visa/BRP/settled status',
    'Notice period : 1 semaine à 3 mois selon contrat et ancienneté',
    'Universal Credit : aide au chômage/logement selon revenus et situation',
  ],
  suisse: [
    'Langue selon région : allemand (Zurich, Bern), français (Genève, Lausanne), italien (Tessin)',
    'Salaires très élevés MAIS coût de la vie très élevé (loyer, santé, transports)',
    'CV suisse : photo obligatoire, diplômes détaillés, références vérifiées',
    'Permis de travail requis AVANT de postuler (sauf UE/AELE)',
    'Période d\'essai : 1-3 mois, résiliation possible avec préavis court',
  ],
};
