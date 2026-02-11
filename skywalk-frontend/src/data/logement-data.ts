
export interface LogementPrices {
  avgRentStudio: number;
  avgRent2Rooms: number;
  avgRent3Rooms: number;
  depositMonths: number;
  utilitiesAvg: number;
  agencyFeesPercent?: number;
  tenantInsurance: number;
}

export interface CityRentPrices {
  name: string;
  studio: number;
  t2: number;
  t3: number;
}

export const logementPricesByCountry: Record<string, LogementPrices> = {
  france: {
    avgRentStudio: 750,
    avgRent2Rooms: 1100,
    avgRent3Rooms: 1500,
    depositMonths: 1,
    utilitiesAvg: 150,
    agencyFeesPercent: 10,
    tenantInsurance: 15,
  },
  'royaume-uni': {
    avgRentStudio: 1624,
    avgRent2Rooms: 2784,
    avgRent3Rooms: 3480,
    depositMonths: 1.2,
    utilitiesAvg: 284,
    agencyFeesPercent: 0,
    tenantInsurance: 23,
  },
  suisse: {
    avgRentStudio: 1470,
    avgRent2Rooms: 2625,
    avgRent3Rooms: 3360,
    depositMonths: 3,
    utilitiesAvg: 239,
    agencyFeesPercent: 0,
    tenantInsurance: 158,
  },
};

export const cityRentPrices: Record<string, CityRentPrices[]> = {
  france: [
    { name: 'Paris', studio: 1100, t2: 1600, t3: 2300 },
    { name: 'Lyon', studio: 750, t2: 1100, t3: 1500 },
    { name: 'Marseille', studio: 650, t2: 900, t3: 1300 },
    { name: 'Toulouse', studio: 600, t2: 850, t3: 1200 },
    { name: 'Bordeaux', studio: 700, t2: 950, t3: 1400 },
    { name: 'Lille', studio: 600, t2: 850, t3: 1150 },
  ],
  'royaume-uni': [
    { name: 'London', studio: 1740, t2: 2668, t3: 3480 },
    { name: 'Manchester', studio: 1044, t2: 1508, t3: 2088 },
    { name: 'Birmingham', studio: 928, t2: 1392, t3: 1972 },
    { name: 'Edinburgh', studio: 1102, t2: 1624, t3: 2204 },
    { name: 'Bristol', studio: 1102, t2: 1566, t3: 2146 },
    { name: 'Leeds', studio: 870, t2: 1276, t3: 1740 },
  ],
  suisse: [
    { name: 'Zurich', studio: 1785, t2: 2625, t3: 3675 },
    { name: 'Geneva', studio: 1890, t2: 2730, t3: 3990 },
    { name: 'Lausanne', studio: 1680, t2: 2415, t3: 3255 },
    { name: 'Basel', studio: 1575, t2: 2310, t3: 3150 },
    { name: 'Bern', studio: 1470, t2: 2205, t3: 2940 },
    { name: 'Lucerne', studio: 1365, t2: 1995, t3: 2730 },
  ],
};

export const rentalDocumentsChecklist: Record<string, string[]> = {
  france: [
    'Carte d\'identité ou passeport',
    'Justificatifs de revenus (3 dernières fiches de paie)',
    'Contrat de travail ou attestation employeur',
    'Avis d\'imposition N-1',
    'Justificatif de domicile actuel',
    'Garantie locative (garant ou Visale)',
    'RIB (Relevé d\'Identité Bancaire)',
  ],
  'royaume-uni': [
    'Passport or photo ID',
    'Right to Rent documents (visa, BRP, settled status)',
    'Proof of address (bank statement, utility bill)',
    'Last 3 months bank statements',
    'Employment contract or offer letter',
    'Employer reference',
    'Previous landlord reference',
    'Guarantor (if income < 2.5× annual rent)',
  ],
  suisse: [
    'Passport ou carte d\'identité',
    'Permis de séjour/travail (permis B, L, C ou G)',
    'Extrait du registre des poursuites (Betreibungsregisterauszug) - OBLIGATOIRE',
    'Justificatifs de revenus (3 derniers salaires)',
    'Contrat de travail ou attestation d\'employeur',
    'Attestation d\'assurance responsabilité civile (Haftpflichtversicherung) - OBLIGATOIRE',
    'Références de précédents bailleurs',
    'Formulaire de candidature (Bewerbungsformular)',
  ],
};

export const housingPlatforms: Record<string, Array<{ name: string; url: string; type: string }>> = {
  france: [
    { name: 'SeLoger', url: 'https://www.seloger.com', type: 'Agences + Particuliers' },
    { name: 'PAP', url: 'https://www.pap.fr', type: 'Particuliers' },
    { name: 'Leboncoin', url: 'https://www.leboncoin.fr', type: 'Tout type' },
    { name: 'Spotahome', url: 'https://www.spotahome.com', type: 'International' },
  ],
  'royaume-uni': [
    { name: 'Rightmove', url: 'https://www.rightmove.co.uk', type: 'Market leader' },
    { name: 'Zoopla', url: 'https://www.zoopla.co.uk', type: 'Comprehensive' },
    { name: 'SpareRoom', url: 'https://www.spareroom.co.uk', type: 'Flatshares' },
    { name: 'OpenRent', url: 'https://www.openrent.com', type: 'No fees' },
    { name: 'OnTheMarket', url: 'https://www.onthemarket.com', type: 'Estate agents' },
  ],
  suisse: [
    { name: 'Homegate', url: 'https://www.homegate.ch', type: 'Market leader' },
    { name: 'ImmoScout24', url: 'https://www.immoscout24.ch', type: 'Popular' },
    { name: 'Flatfox', url: 'https://flatfox.ch', type: 'Modern platform' },
    { name: 'Anibis', url: 'https://www.anibis.ch', type: 'Classifieds' },
    { name: 'Comparis', url: 'https://en.comparis.ch/immobilien/default', type: 'Comparison' },
    { name: 'WG-Zimmer', url: 'https://www.wgzimmer.ch', type: 'Flatshares' },
  ],
};

export const housingNotes: Record<string, string[]> = {
  france: [
    'Encadrement des loyers à Paris, Lyon, Lille : vérifier le loyer de référence',
    'Dispositif Visale gratuit pour caution (Action Logement) pour -30 ans et salariés',
    'Revenus requis : généralement 3× le loyer charges comprises',
    'Frais d\'agence max : 10% du loyer annuel HT + 25€/m² pour état des lieux',
    'Marché très tendu dans les grandes villes : préparer dossier complet',
  ],
  'royaume-uni': [
    'Tenant Fees Act 2019 : aucun frais d\'agence pour le locataire',
    'Right to Rent check obligatoire : preuve du droit de résider au UK (visa, BRP, settled status)',
    'Deposit max : 5 semaines de loyer, protégé par Deposit Protection Scheme (DPS/MyDeposits/TDS)',
    'Council Tax OBLIGATOIRE en plus du loyer (£100-150/mois selon zone)',
    'Marché très compétitif à Londres : visites groupées, décision rapide nécessaire',
    'Guarantor UK-based requis si revenus < 2.5× le loyer annuel',
    'Inventory (état des lieux) crucial : photos, vidéos, check-in/check-out reports à conserver',
  ],
  suisse: [
    'Extrait du registre des poursuites (Betreibungsregisterauszug) OBLIGATOIRE pour louer',
    'Assurance responsabilité civile (Haftpflichtversicherung) OBLIGATOIRE (~150 CHF/an)',
    'Dépôt de garantie 3 mois : compte bancaire bloqué (Mietkautionskonto) ou garantie SwissCaution',
    'Loyers parmi les plus élevés au monde (Zurich 1785€, Genève 1890€, Lausanne 1680€)',
    'Permis de séjour requis : permis B (résidents), L (courte durée), C (établissement), G (frontaliers)',
    'Résiliation par lettre recommandée aux dates légales uniquement (fin mois/trimestre selon canton)',
    'Commission de conciliation (Schlichtungsbehörde) : passage obligatoire avant tribunal pour litiges',
    'Marché très compétitif : dossier parfait indispensable, réactivité cruciale',
  ],
};
