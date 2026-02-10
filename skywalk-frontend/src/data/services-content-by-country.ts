
export interface CountrySpecificContent {
  emploi?: {
    stats?: Array<{ label: string; value: string }>;
    specificGuides?: Array<{
      title: string;
      steps: string[];
    }>;
    tips?: string[];
    sites?: string[];
  };
  logement?: {
    stats?: Array<{ label: string; value: string }>;
    specificGuides?: Array<{
      title: string;
      steps: string[];
    }>;
    tips?: string[];
    sites?: string[];
  };
  transport?: {
    stats?: Array<{ label: string; value: string }>;
    specificGuides?: Array<{
      title: string;
      steps: string[];
    }>;
    tips?: string[];
  };
  sante?: {
    stats?: Array<{ label: string; value: string }>;
    specificGuides?: Array<{
      title: string;
      steps: string[];
    }>;
    tips?: string[];
  };
  demarches?: {
    stats?: Array<{ label: string; value: string }>;
    specificGuides?: Array<{
      title: string;
      steps: string[];
    }>;
    tips?: string[];
    documents?: string[];
  };
}

export const countryContent: Record<string, CountrySpecificContent> = {
  france: {
    emploi: {
      stats: [
        { label: 'countryContent.france.emploi.stats.offers', value: '1,800+' },
        { label: 'countryContent.france.emploi.stats.avgSalary', value: '38,000 EUR' },
        { label: 'countryContent.france.emploi.stats.unemployment', value: '7.3%' },
      ],
      specificGuides: [
        {
          title: 'countryContent.france.emploi.guides.0.title',
          steps: [
            'countryContent.france.emploi.guides.0.steps.0',
            'countryContent.france.emploi.guides.0.steps.1',
            'countryContent.france.emploi.guides.0.steps.2',
            'countryContent.france.emploi.guides.0.steps.3',
          ],
        },
      ],
      tips: [
        'countryContent.france.emploi.tips.0',
        'countryContent.france.emploi.tips.1',
        'countryContent.france.emploi.tips.2',
      ],
      sites: ['Pôle Emploi', 'APEC', 'Indeed.fr', 'LinkedIn', 'Welcome to the Jungle'],
    },
    logement: {
      stats: [
        { label: 'countryContent.france.logement.stats.rentParis', value: '1,200 EUR' },
        { label: 'countryContent.france.logement.stats.rentLyon', value: '800 EUR' },
        { label: 'countryContent.france.logement.stats.deposit', value: '1 mois' },
      ],
      specificGuides: [
        {
          title: 'countryContent.france.logement.guides.0.title',
          steps: [
            'countryContent.france.logement.guides.0.steps.0',
            'countryContent.france.logement.guides.0.steps.1',
            'countryContent.france.logement.guides.0.steps.2',
            'countryContent.france.logement.guides.0.steps.3',
          ],
        },
      ],
      tips: [
        'countryContent.france.logement.tips.0',
        'countryContent.france.logement.tips.1',
        'countryContent.france.logement.tips.2',
      ],
      sites: ['SeLoger', 'Leboncoin', 'PAP', 'Logic-Immo', 'Bien\'ici'],
    },
    transport: {
      specificGuides: [
        {
          title: 'countryContent.france.transport.guides.0.title',
          steps: [
            'countryContent.france.transport.guides.0.steps.0',
            'countryContent.france.transport.guides.0.steps.1',
            'countryContent.france.transport.guides.0.steps.2',
          ],
        },
      ],
      tips: [
        'countryContent.france.transport.tips.0',
        'countryContent.france.transport.tips.1',
        'countryContent.france.transport.tips.2',
      ],
    },
    sante: {
      specificGuides: [
        {
          title: 'countryContent.france.sante.guides.0.title',
          steps: [
            'countryContent.france.sante.guides.0.steps.0',
            'countryContent.france.sante.guides.0.steps.1',
            'countryContent.france.sante.guides.0.steps.2',
            'countryContent.france.sante.guides.0.steps.3',
          ],
        },
      ],
      tips: [
        'countryContent.france.sante.tips.0',
        'countryContent.france.sante.tips.1',
        'countryContent.france.sante.tips.2',
      ],
    },
    demarches: {
      specificGuides: [
        {
          title: 'countryContent.france.demarches.guides.0.title',
          steps: [
            'countryContent.france.demarches.guides.0.steps.0',
            'countryContent.france.demarches.guides.0.steps.1',
            'countryContent.france.demarches.guides.0.steps.2',
            'countryContent.france.demarches.guides.0.steps.3',
          ],
        },
      ],
      documents: [
        'countryContent.france.demarches.documents.0',
        'countryContent.france.demarches.documents.1',
        'countryContent.france.demarches.documents.2',
        'countryContent.france.demarches.documents.3',
      ],
    },
  },

  'etats-unis': {
    emploi: {
      stats: [
        { label: 'countryContent.usa.emploi.stats.offers', value: '3,500+' },
        { label: 'countryContent.usa.emploi.stats.avgSalary', value: '55,000 USD' },
        { label: 'countryContent.usa.emploi.stats.unemployment', value: '3.8%' },
      ],
      specificGuides: [
        {
          title: 'countryContent.usa.emploi.guides.0.title',
          steps: [
            'countryContent.usa.emploi.guides.0.steps.0',
            'countryContent.usa.emploi.guides.0.steps.1',
            'countryContent.usa.emploi.guides.0.steps.2',
          ],
        },
      ],
      sites: ['LinkedIn', 'Indeed.com', 'Glassdoor', 'Monster'],
      tips: [
        'countryContent.usa.emploi.tips.0',
        'countryContent.usa.emploi.tips.1',
      ],
    },
    logement: {
      stats: [
        { label: 'countryContent.usa.logement.stats.rentNYC', value: '3,500 USD' },
        { label: 'countryContent.usa.logement.stats.rentLA', value: '2,500 USD' },
      ],
      sites: ['Zillow', 'Craigslist', 'Apartments.com'],
    },
  },

  japon: {
    emploi: {
      stats: [
        { label: 'countryContent.japan.emploi.stats.offers', value: '900+' },
        { label: 'countryContent.japan.emploi.stats.avgSalary', value: '4.5M JPY' },
      ],
      specificGuides: [
        {
          title: 'countryContent.japan.emploi.guides.0.title',
          steps: [
            'countryContent.japan.emploi.guides.0.steps.0',
            'countryContent.japan.emploi.guides.0.steps.1',
            'countryContent.japan.emploi.guides.0.steps.2',
          ],
        },
      ],
      sites: ['Daijob', 'GaijinPot', 'LinkedIn'],
    },
    logement: {
      stats: [
        { label: 'countryContent.japan.logement.stats.rentTokyo', value: '120,000 JPY' },
        { label: 'countryContent.japan.logement.stats.keyMoney', value: '1-2 mois' },
      ],
      sites: ['Suumo', 'GaijinPot Housing', 'UR Housing'],
    },
  },

  suisse: {
    emploi: {
      stats: [
        { label: 'countryContent.switzerland.emploi.stats.offers', value: '600+' },
        { label: 'countryContent.switzerland.emploi.stats.avgSalary', value: '80,000 CHF' },
      ],
      specificGuides: [
        {
          title: 'countryContent.switzerland.emploi.guides.0.title',
          steps: [
            'countryContent.switzerland.emploi.guides.0.steps.0',
            'countryContent.switzerland.emploi.guides.0.steps.1',
            'countryContent.switzerland.emploi.guides.0.steps.2',
          ],
        },
      ],
      sites: ['Jobs.ch', 'LinkedIn', 'Indeed.ch'],
    },
    logement: {
      stats: [
        { label: 'countryContent.switzerland.logement.stats.rentZurich', value: '2,500 CHF' },
        { label: 'countryContent.switzerland.logement.stats.rentGeneva', value: '3,000 CHF' },
      ],
      sites: ['Homegate.ch', 'ImmoScout24.ch'],
    },
  },
};

export const getCountryContent = (
  countrySlug: string,
  category: string
): CountrySpecificContent[keyof CountrySpecificContent] | undefined => {
  const country = countryContent[countrySlug.toLowerCase()];
  if (!country) return undefined;
  return country[category as keyof CountrySpecificContent];
};
