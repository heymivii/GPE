// Translation files for country-specific content
import franceFr from './countries/france.fr.json';
import franceEn from './countries/france.en.json';
import ukFr from './countries/uk.fr.json';
import ukEn from './countries/uk.en.json';
import switzerlandFr from './countries/switzerland.fr.json';
import switzerlandEn from './countries/switzerland.en.json';

export interface CountryTranslations {
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
  // Les autres pays seront ajoutés progressivement
};

export function getCountryTranslation(
  countryCode: string,
  language: string
): CountryTranslations | null {
  const country = countryTranslations[countryCode];
  if (!country) return null;
  return country[language] || country['fr'] || null;
}
