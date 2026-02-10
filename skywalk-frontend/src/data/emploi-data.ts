export interface EmploiData {
  unemploymentRate: number;
  avgSalaryNet: number;
  minWageNet: number;
  workingHours: number;
  paidLeaveDays: number;
  socialChargesEmployee: number;
}

export interface JobSector {
  nameKey: string;
  demandKey: string;
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
  'etats-unis': {
    unemploymentRate: 3.9,
    avgSalaryNet: 4200,
    minWageNet: 1260,
    workingHours: 40,
    paidLeaveDays: 10,
    socialChargesEmployee: 7.65,
  },
  canada: {
    unemploymentRate: 6.1,
    avgSalaryNet: 3400,
    minWageNet: 2080,
    workingHours: 40,
    paidLeaveDays: 10,
    socialChargesEmployee: 12,
  },
  allemagne: {
    unemploymentRate: 5.8,
    avgSalaryNet: 2900,
    minWageNet: 2054,
    workingHours: 38,
    paidLeaveDays: 20,
    socialChargesEmployee: 20,
  },
  espagne: {
    unemploymentRate: 11.5,
    avgSalaryNet: 1800,
    minWageNet: 1134,
    workingHours: 40,
    paidLeaveDays: 22,
    socialChargesEmployee: 6.4,
  },
  italie: {
    unemploymentRate: 6.8,
    avgSalaryNet: 1950,
    minWageNet: 0,
    workingHours: 40,
    paidLeaveDays: 26,
    socialChargesEmployee: 9.2,
  },
  belgique: {
    unemploymentRate: 5.5,
    avgSalaryNet: 2700,
    minWageNet: 1955,
    workingHours: 38,
    paidLeaveDays: 20,
    socialChargesEmployee: 13.07,
  },
  'pays-bas': {
    unemploymentRate: 3.6,
    avgSalaryNet: 2900,
    minWageNet: 2070,
    workingHours: 36,
    paidLeaveDays: 20,
    socialChargesEmployee: 27.65,
  },
  australie: {
    unemploymentRate: 4.1,
    avgSalaryNet: 4600,
    minWageNet: 2700,
    workingHours: 38,
    paidLeaveDays: 20,
    socialChargesEmployee: 2,
  },
  japon: {
    unemploymentRate: 2.5,
    avgSalaryNet: 2400,
    minWageNet: 1200,
    workingHours: 40,
    paidLeaveDays: 10,
    socialChargesEmployee: 15,
  },
  singapour: {
    unemploymentRate: 2.0,
    avgSalaryNet: 4100,
    minWageNet: 0,
    workingHours: 44,
    paidLeaveDays: 7,
    socialChargesEmployee: 20,
  },
};

export const inDemandSectorsByCountry: Record<string, JobSector[]> = {
  france: [
    { nameKey: 'emploiData.sectors.france.techDev', demandKey: 'emploiData.demand.veryHigh', avgSalary: '3200-4500€' },
    { nameKey: 'emploiData.sectors.france.health', demandKey: 'emploiData.demand.veryHigh', avgSalary: '2000-4500€' },
    { nameKey: 'emploiData.sectors.france.logistics', demandKey: 'emploiData.demand.high', avgSalary: '1900-3000€' },
    { nameKey: 'emploiData.sectors.france.construction', demandKey: 'emploiData.demand.high', avgSalary: '2000-3500€' },
    { nameKey: 'emploiData.sectors.france.hospitality', demandKey: 'emploiData.demand.veryHigh', avgSalary: '1800-2500€' },
  ],
  'royaume-uni': [
    { nameKey: 'emploiData.sectors.uk.techEng', demandKey: 'emploiData.demand.veryHigh', avgSalary: '£45,000-80,000' },
    { nameKey: 'emploiData.sectors.uk.finance', demandKey: 'emploiData.demand.high', avgSalary: '£50,000-100,000+' },
    { nameKey: 'emploiData.sectors.uk.healthcare', demandKey: 'emploiData.demand.veryHigh', avgSalary: '£28,000-60,000' },
    { nameKey: 'emploiData.sectors.uk.marketing', demandKey: 'emploiData.demand.medium', avgSalary: '£30,000-50,000' },
    { nameKey: 'emploiData.sectors.uk.construction', demandKey: 'emploiData.demand.high', avgSalary: '£35,000-65,000' },
  ],
  suisse: [
    { nameKey: 'emploiData.sectors.ch.finance', demandKey: 'emploiData.demand.high', avgSalary: '110,000-180,000 CHF' },
    { nameKey: 'emploiData.sectors.ch.it', demandKey: 'emploiData.demand.veryHigh', avgSalary: '95,000-145,000 CHF' },
    { nameKey: 'emploiData.sectors.ch.health', demandKey: 'emploiData.demand.veryHigh', avgSalary: '80,000-150,000 CHF' },
    { nameKey: 'emploiData.sectors.ch.pharma', demandKey: 'emploiData.demand.veryHigh', avgSalary: '105,000-160,000 CHF' },
    { nameKey: 'emploiData.sectors.ch.watchmaking', demandKey: 'emploiData.demand.high', avgSalary: '70,000-110,000 CHF' },
  ],
  'etats-unis': [
    { nameKey: 'emploiData.sectors.us.techSoftware', demandKey: 'emploiData.demand.veryHigh', avgSalary: '$80,000-150,000' },
    { nameKey: 'emploiData.sectors.us.healthMedical', demandKey: 'emploiData.demand.veryHigh', avgSalary: '$60,000-120,000' },
    { nameKey: 'emploiData.sectors.us.finance', demandKey: 'emploiData.demand.high', avgSalary: '$70,000-130,000' },
    { nameKey: 'emploiData.sectors.us.dataScience', demandKey: 'emploiData.demand.veryHigh', avgSalary: '$90,000-160,000' },
    { nameKey: 'emploiData.sectors.us.engineering', demandKey: 'emploiData.demand.high', avgSalary: '$75,000-120,000' },
  ],
  canada: [
    { nameKey: 'emploiData.sectors.ca.techIt', demandKey: 'emploiData.demand.veryHigh', avgSalary: 'CA$70,000-120,000' },
    { nameKey: 'emploiData.sectors.ca.health', demandKey: 'emploiData.demand.veryHigh', avgSalary: 'CA$55,000-100,000' },
    { nameKey: 'emploiData.sectors.ca.construction', demandKey: 'emploiData.demand.high', avgSalary: 'CA$50,000-85,000' },
    { nameKey: 'emploiData.sectors.ca.finance', demandKey: 'emploiData.demand.high', avgSalary: 'CA$60,000-110,000' },
    { nameKey: 'emploiData.sectors.ca.naturalRes', demandKey: 'emploiData.demand.medium', avgSalary: 'CA$55,000-95,000' },
  ],
  allemagne: [
    { nameKey: 'emploiData.sectors.de.autoEng', demandKey: 'emploiData.demand.veryHigh', avgSalary: '55,000-85,000€' },
    { nameKey: 'emploiData.sectors.de.itSoftware', demandKey: 'emploiData.demand.veryHigh', avgSalary: '50,000-80,000€' },
    { nameKey: 'emploiData.sectors.de.healthCare', demandKey: 'emploiData.demand.veryHigh', avgSalary: '35,000-60,000€' },
    { nameKey: 'emploiData.sectors.de.industry', demandKey: 'emploiData.demand.high', avgSalary: '40,000-65,000€' },
    { nameKey: 'emploiData.sectors.de.logistics', demandKey: 'emploiData.demand.high', avgSalary: '35,000-55,000€' },
  ],
  australie: [
    { nameKey: 'emploiData.sectors.au.mining', demandKey: 'emploiData.demand.veryHigh', avgSalary: 'AU$90,000-150,000' },
    { nameKey: 'emploiData.sectors.au.techIt', demandKey: 'emploiData.demand.veryHigh', avgSalary: 'AU$80,000-130,000' },
    { nameKey: 'emploiData.sectors.au.healthcare', demandKey: 'emploiData.demand.veryHigh', avgSalary: 'AU$65,000-110,000' },
    { nameKey: 'emploiData.sectors.au.construction', demandKey: 'emploiData.demand.high', avgSalary: 'AU$60,000-100,000' },
    { nameKey: 'emploiData.sectors.au.agriculture', demandKey: 'emploiData.demand.high', avgSalary: 'AU$50,000-75,000' },
  ],
  japon: [
    { nameKey: 'emploiData.sectors.jp.itEng', demandKey: 'emploiData.demand.veryHigh', avgSalary: '¥5M-9M/an' },
    { nameKey: 'emploiData.sectors.jp.automotive', demandKey: 'emploiData.demand.high', avgSalary: '¥4M-7M/an' },
    { nameKey: 'emploiData.sectors.jp.finance', demandKey: 'emploiData.demand.high', avgSalary: '¥5M-10M/an' },
    { nameKey: 'emploiData.sectors.jp.teaching', demandKey: 'emploiData.demand.medium', avgSalary: '¥3M-5M/an' },
    { nameKey: 'emploiData.sectors.jp.tourism', demandKey: 'emploiData.demand.high', avgSalary: '¥3M-5M/an' },
  ],
};

export const contractTypesByCountry: Record<string, string[]> = {
  france: [
    'emploiData.contracts.france.cdi',
    'emploiData.contracts.france.cdd',
    'emploiData.contracts.france.interim',
    'emploiData.contracts.france.freelance',
    'emploiData.contracts.france.alternance',
  ],
  'royaume-uni': [
    'emploiData.contracts.uk.permanent',
    'emploiData.contracts.uk.fixedTerm',
    'emploiData.contracts.uk.temporary',
    'emploiData.contracts.uk.zeroHours',
    'emploiData.contracts.uk.selfEmployed',
  ],
  suisse: [
    'emploiData.contracts.ch.cdi',
    'emploiData.contracts.ch.cdd',
    'emploiData.contracts.ch.trial',
    'emploiData.contracts.ch.freelance',
    'emploiData.contracts.ch.temporary',
  ],
  'etats-unis': [
    'emploiData.contracts.us.atWill',
    'emploiData.contracts.us.fullTime',
    'emploiData.contracts.us.partTime',
    'emploiData.contracts.us.contractor',
    'emploiData.contracts.us.internship',
  ],
  canada: [
    'emploiData.contracts.ca.permanentFull',
    'emploiData.contracts.ca.permanentPart',
    'emploiData.contracts.ca.fixedTerm',
    'emploiData.contracts.ca.casual',
    'emploiData.contracts.ca.selfEmployed',
  ],
  allemagne: [
    'emploiData.contracts.de.unbefristet',
    'emploiData.contracts.de.befristet',
    'emploiData.contracts.de.minijob',
    'emploiData.contracts.de.werkvertrag',
    'emploiData.contracts.de.freiberufler',
  ],
  australie: [
    'emploiData.contracts.au.permanent',
    'emploiData.contracts.au.fixedTerm',
    'emploiData.contracts.au.casual',
    'emploiData.contracts.au.contractor',
    'emploiData.contracts.au.workingHoliday',
  ],
  japon: [
    'emploiData.contracts.jp.seishain',
    'emploiData.contracts.jp.keiyaku',
    'emploiData.contracts.jp.haken',
    'emploiData.contracts.jp.partTime',
    'emploiData.contracts.jp.freelance',
  ],
};

export const jobPlatformsByCountry: Record<string, Array<{ name: string; url: string; typeKey: string }>> = {
  france: [
    { name: 'Pôle Emploi', url: 'https://www.pole-emploi.fr', typeKey: 'emploiData.platformTypes.publicService' },
    { name: 'Indeed France', url: 'https://www.indeed.fr', typeKey: 'emploiData.platformTypes.generalist' },
    { name: 'APEC', url: 'https://www.apec.fr', typeKey: 'emploiData.platformTypes.executives' },
    { name: 'Welcome to the Jungle', url: 'https://www.welcometothejungle.com/fr', typeKey: 'emploiData.platformTypes.techStartups' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs', typeKey: 'emploiData.platformTypes.proNetwork' },
  ],
  'royaume-uni': [
    { name: 'Indeed UK', url: 'https://uk.indeed.com', typeKey: 'emploiData.platformTypes.marketLeader' },
    { name: 'NHS Jobs', url: 'https://www.jobs.nhs.uk', typeKey: 'emploiData.platformTypes.publicSector' },
    { name: 'Reed', url: 'https://www.reed.co.uk', typeKey: 'emploiData.platformTypes.comprehensive' },
    { name: 'Totaljobs', url: 'https://www.totaljobs.com', typeKey: 'emploiData.platformTypes.generalist' },
    { name: 'LinkedIn UK', url: 'https://www.linkedin.com/jobs', typeKey: 'emploiData.platformTypes.proNetwork' },
    { name: 'Gov.uk Jobs', url: 'https://www.gov.uk/find-a-job', typeKey: 'emploiData.platformTypes.government' },
  ],
  suisse: [
    { name: 'JobUp', url: 'https://www.jobup.ch', typeKey: 'emploiData.platformTypes.leaderRomandie' },
    { name: 'Indeed Suisse', url: 'https://www.indeed.ch', typeKey: 'emploiData.platformTypes.aggregator' },
    { name: 'Jobs.ch', url: 'https://www.jobs.ch', typeKey: 'emploiData.platformTypes.nationalLeader' },
    { name: 'LinkedIn Suisse', url: 'https://www.linkedin.com/jobs', typeKey: 'emploiData.platformTypes.proNetwork' },
    { name: 'Michael Page CH', url: 'https://www.michaelpage.ch', typeKey: 'emploiData.platformTypes.specializedRecruitment' },
  ],
  'etats-unis': [
    { name: 'Indeed', url: 'https://www.indeed.com', typeKey: 'emploiData.platformTypes.marketLeader' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs', typeKey: 'emploiData.platformTypes.proNetwork' },
    { name: 'Glassdoor', url: 'https://www.glassdoor.com', typeKey: 'emploiData.platformTypes.reviewsJobs' },
    { name: 'ZipRecruiter', url: 'https://www.ziprecruiter.com', typeKey: 'emploiData.platformTypes.matchingAI' },
    { name: 'USAJobs', url: 'https://www.usajobs.gov', typeKey: 'emploiData.platformTypes.federalGov' },
  ],
  canada: [
    { name: 'Job Bank (Guichet-Emplois)', url: 'https://www.jobbank.gc.ca', typeKey: 'emploiData.platformTypes.publicService' },
    { name: 'Indeed Canada', url: 'https://ca.indeed.com', typeKey: 'emploiData.platformTypes.generalist' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs', typeKey: 'emploiData.platformTypes.proNetwork' },
    { name: 'Workopolis', url: 'https://www.workopolis.com', typeKey: 'emploiData.platformTypes.canadaOnly' },
    { name: 'Randstad Canada', url: 'https://www.randstad.ca', typeKey: 'emploiData.platformTypes.recruitment' },
  ],
  allemagne: [
    { name: 'Agentur für Arbeit', url: 'https://www.arbeitsagentur.de', typeKey: 'emploiData.platformTypes.publicService' },
    { name: 'StepStone', url: 'https://www.stepstone.de', typeKey: 'emploiData.platformTypes.leaderGermany' },
    { name: 'Xing', url: 'https://www.xing.com', typeKey: 'emploiData.platformTypes.proNetworkDACH' },
    { name: 'Indeed Deutschland', url: 'https://de.indeed.com', typeKey: 'emploiData.platformTypes.generalist' },
    { name: 'LinkedIn DACH', url: 'https://www.linkedin.com/jobs', typeKey: 'emploiData.platformTypes.international' },
  ],
  australie: [
    { name: 'Seek', url: 'https://www.seek.com.au', typeKey: 'emploiData.platformTypes.leaderAustralia' },
    { name: 'Indeed Australia', url: 'https://au.indeed.com', typeKey: 'emploiData.platformTypes.generalist' },
    { name: 'Jora', url: 'https://au.jora.com', typeKey: 'emploiData.platformTypes.aggregator' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs', typeKey: 'emploiData.platformTypes.proNetwork' },
    { name: 'APS Jobs', url: 'https://www.apsjobs.gov.au', typeKey: 'emploiData.platformTypes.government' },
  ],
  japon: [
    { name: 'GaijinPot Jobs', url: 'https://jobs.gaijinpot.com', typeKey: 'emploiData.platformTypes.foreignersJapan' },
    { name: 'Daijob', url: 'https://www.daijob.com', typeKey: 'emploiData.platformTypes.bilingualIntl' },
    { name: 'Indeed Japan', url: 'https://jp.indeed.com', typeKey: 'emploiData.platformTypes.generalist' },
    { name: 'LinkedIn Japan', url: 'https://www.linkedin.com/jobs', typeKey: 'emploiData.platformTypes.international' },
    { name: 'HelloWork', url: 'https://www.hellowork.mhlw.go.jp', typeKey: 'emploiData.platformTypes.publicService' },
  ],
};

export const workPermitRequirements: Record<string, string[]> = {
  france: [
    'emploiData.permits.france.0',
    'emploiData.permits.france.1',
    'emploiData.permits.france.2',
    'emploiData.permits.france.3',
    'emploiData.permits.france.4',
  ],
  'royaume-uni': [
    'emploiData.permits.uk.0',
    'emploiData.permits.uk.1',
    'emploiData.permits.uk.2',
    'emploiData.permits.uk.3',
    'emploiData.permits.uk.4',
  ],
  suisse: [
    'emploiData.permits.ch.0',
    'emploiData.permits.ch.1',
    'emploiData.permits.ch.2',
    'emploiData.permits.ch.3',
    'emploiData.permits.ch.4',
  ],
  'etats-unis': [
    'emploiData.permits.us.0',
    'emploiData.permits.us.1',
    'emploiData.permits.us.2',
    'emploiData.permits.us.3',
    'emploiData.permits.us.4',
  ],
  canada: [
    'emploiData.permits.ca.0',
    'emploiData.permits.ca.1',
    'emploiData.permits.ca.2',
    'emploiData.permits.ca.3',
    'emploiData.permits.ca.4',
  ],
  allemagne: [
    'emploiData.permits.de.0',
    'emploiData.permits.de.1',
    'emploiData.permits.de.2',
    'emploiData.permits.de.3',
    'emploiData.permits.de.4',
  ],
  australie: [
    'emploiData.permits.au.0',
    'emploiData.permits.au.1',
    'emploiData.permits.au.2',
    'emploiData.permits.au.3',
    'emploiData.permits.au.4',
  ],
  japon: [
    'emploiData.permits.jp.0',
    'emploiData.permits.jp.1',
    'emploiData.permits.jp.2',
    'emploiData.permits.jp.3',
    'emploiData.permits.jp.4',
  ],
};

export const employmentNotes: Record<string, string[]> = {
  france: [
    'emploiData.notes.france.0',
    'emploiData.notes.france.1',
    'emploiData.notes.france.2',
    'emploiData.notes.france.3',
    'emploiData.notes.france.4',
  ],
  'royaume-uni': [
    'emploiData.notes.uk.0',
    'emploiData.notes.uk.1',
    'emploiData.notes.uk.2',
    'emploiData.notes.uk.3',
    'emploiData.notes.uk.4',
  ],
  suisse: [
    'emploiData.notes.ch.0',
    'emploiData.notes.ch.1',
    'emploiData.notes.ch.2',
    'emploiData.notes.ch.3',
    'emploiData.notes.ch.4',
  ],
  'etats-unis': [
    'emploiData.notes.us.0',
    'emploiData.notes.us.1',
    'emploiData.notes.us.2',
    'emploiData.notes.us.3',
    'emploiData.notes.us.4',
  ],
  canada: [
    'emploiData.notes.ca.0',
    'emploiData.notes.ca.1',
    'emploiData.notes.ca.2',
    'emploiData.notes.ca.3',
    'emploiData.notes.ca.4',
  ],
  allemagne: [
    'emploiData.notes.de.0',
    'emploiData.notes.de.1',
    'emploiData.notes.de.2',
    'emploiData.notes.de.3',
    'emploiData.notes.de.4',
  ],
  australie: [
    'emploiData.notes.au.0',
    'emploiData.notes.au.1',
    'emploiData.notes.au.2',
    'emploiData.notes.au.3',
    'emploiData.notes.au.4',
  ],
  japon: [
    'emploiData.notes.jp.0',
    'emploiData.notes.jp.1',
    'emploiData.notes.jp.2',
    'emploiData.notes.jp.3',
    'emploiData.notes.jp.4',
  ],
};
