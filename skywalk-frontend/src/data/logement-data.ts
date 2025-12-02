/**
 * DONNÉES LOGEMENT SIMPLIFIÉES (pour les outils React)
 * 
 * Ce fichier contient les données essentielles pour alimenter les composants LogementStats et outils interactifs.
 * Pour les données détaillées avec sources, voir countries/france-logement-data.ts, etc.
 */

export interface LogementPrices {
  avgRentStudio: number; // Loyer moyen studio en €/mois
  avgRent2Rooms: number; // Loyer moyen T2 en €/mois
  avgRent3Rooms: number; // Loyer moyen T3 en €/mois
  depositMonths: number; // Nombre de mois de loyer pour dépôt de garantie
  utilitiesAvg: number; // Charges mensuelles moyennes en €
  agencyFeesPercent?: number; // Frais d'agence (% du loyer annuel HT)
  tenantInsurance: number; // Assurance habitation mensuelle en €
}

export interface CityRentPrices {
  name: string;
  studio: number;
  t2: number;
  t3: number;
}

// Données logement par pays (moyennes grandes villes)
export const logementPricesByCountry: Record<string, LogementPrices> = {
  france: {
    avgRentStudio: 750, // Moyenne nationale hors Paris
    avgRent2Rooms: 1100, // T2 moyenne nationale
    avgRent3Rooms: 1500, // T3 moyenne nationale
    depositMonths: 1, // 1 mois pour non meublé, 2 pour meublé
    utilitiesAvg: 150, // Électricité + eau + internet
    agencyFeesPercent: 10, // Max 10% du loyer annuel HT + 25€/m²
    tenantInsurance: 15, // Assurance habitation obligatoire
  },
  'royaume-uni': {
    avgRentStudio: 1624, // £1400 × 1.16 (moyenne nationale)
    avgRent2Rooms: 2784, // £2400 × 1.16 (moyenne nationale)
    avgRent3Rooms: 3480, // £3000 × 1.16 (moyenne nationale)
    depositMonths: 1.2, // Max 5 semaines de loyer (≈ 1.15 mois)
    utilitiesAvg: 284, // £245 × 1.16 (électricité + eau + internet + Council Tax)
    agencyFeesPercent: 0, // Tenant Fees Act 2019 : frais interdits depuis 2019
    tenantInsurance: 23, // £20 × 1.16 (contents insurance recommandé, non obligatoire)
  },
  suisse: {
    avgRentStudio: 1470, // 1400 CHF × 1.05 (moyenne nationale)
    avgRent2Rooms: 2625, // 2500 CHF × 1.05 (moyenne nationale)
    avgRent3Rooms: 3360, // 3200 CHF × 1.05 (moyenne nationale)
    depositMonths: 3, // Généralement 3 mois en Suisse (compte bloqué)
    utilitiesAvg: 239, // 228 CHF × 1.05 (charges + électricité + Serafe)
    agencyFeesPercent: 0, // Pas de frais d'agence pour le locataire en Suisse (propriétaire paie)
    tenantInsurance: 158, // 150 CHF × 1.05 (RC obligatoire/an ÷ 12 = ~13€/mois)
  },
};

// Prix par ville principale (pour affichage détaillé)
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
    { name: 'London', studio: 1740, t2: 2668, t3: 3480 }, // £1500/£2300/£3000 × 1.16
    { name: 'Manchester', studio: 1044, t2: 1508, t3: 2088 }, // £900/£1300/£1800 × 1.16
    { name: 'Birmingham', studio: 928, t2: 1392, t3: 1972 }, // £800/£1200/£1700 × 1.16
    { name: 'Edinburgh', studio: 1102, t2: 1624, t3: 2204 }, // £950/£1400/£1900 × 1.16
    { name: 'Bristol', studio: 1102, t2: 1566, t3: 2146 }, // £950/£1350/£1850 × 1.16
    { name: 'Leeds', studio: 870, t2: 1276, t3: 1740 }, // £750/£1100/£1500 × 1.16
  ],
  suisse: [
    { name: 'Zurich', studio: 1785, t2: 2625, t3: 3675 }, // 1700/2500/3500 CHF × 1.05
    { name: 'Geneva', studio: 1890, t2: 2730, t3: 3990 }, // 1800/2600/3800 CHF × 1.05
    { name: 'Lausanne', studio: 1680, t2: 2415, t3: 3255 }, // 1600/2300/3100 CHF × 1.05
    { name: 'Basel', studio: 1575, t2: 2310, t3: 3150 }, // 1500/2200/3000 CHF × 1.05
    { name: 'Bern', studio: 1470, t2: 2205, t3: 2940 }, // 1400/2100/2800 CHF × 1.05
    { name: 'Lucerne', studio: 1365, t2: 1995, t3: 2730 }, // 1300/1900/2600 CHF × 1.05
  ],
};

// Documents requis pour dossier locatif
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

// Plateformes de recherche par pays
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

// Notes importantes par pays
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
