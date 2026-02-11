import franceFr from './countries/france.fr.json';
import franceEn from './countries/france.en.json';
import ukFr from './countries/uk.fr.json';
import ukEn from './countries/uk.en.json';
import switzerlandFr from './countries/switzerland.fr.json';
import switzerlandEn from './countries/switzerland.en.json';
import japanFr from './countries/japan.fr.json';
import japanEn from './countries/japan.en.json';
import usaFr from './countries/usa.fr.json';
import usaEn from './countries/usa.en.json';

export interface CountryTranslations {
  name?: string;
  expatSteps: {
    [stepSlug: string]: {
      title: string;
      description: string;
      substeps: {
        [substepId: string]: string;
      };
    };
  };
  jobMarket?: {
    topSectors: string[];
    salaryBySector?: Record<string, number>;
  };
}

export const countryTranslations: Record<string, Record<string, CountryTranslations>> = {
  FR: {
    fr: franceFr as CountryTranslations,
    en: franceEn as CountryTranslations,
  },
  GB: {
    fr: ukFr as CountryTranslations,
    en: ukEn as CountryTranslations,
  },
  CH: {
    fr: switzerlandFr as CountryTranslations,
    en: switzerlandEn as CountryTranslations,
  },
  JP: {
    fr: japanFr as CountryTranslations,
    en: japanEn as CountryTranslations,
  },
  US: {
    fr: usaFr as CountryTranslations,
    en: usaEn as CountryTranslations,
  },
};

export function getCountryTranslation(
  countryCode: string,
  language: string
): CountryTranslations | null {
  const country = countryTranslations[countryCode];
  if (!country) return null;
  return country[language] || country['fr'] || null;
}
