export interface ChecklistLink {
  label: string;
  url: string;
  countryCode?: string; // si null → lien universel
  isInternal?: boolean; // true = route Skywalk
}

export interface ChecklistCategoryLinks {
  serviceLink?: string;           // route interne Skywalk /services/...
  externalLinks?: ChecklistLink[];
}

export const CHECKLIST_LINKS: Record<string, ChecklistCategoryLinks> = {
  administrative: {
    serviceLink: '/services/demarches',
    externalLinks: [
      { label: 'Service-Public.fr', url: 'https://service-public.fr', countryCode: 'FR' },
      { label: 'GOV.UK', url: 'https://gov.uk', countryCode: 'GB' },
      { label: 'CH.ch', url: 'https://www.ch.ch', countryCode: 'CH' },
    ],
  },
  housing: {
    serviceLink: '/services/logement',
    externalLinks: [
      { label: 'SeLoger', url: 'https://seloger.com', countryCode: 'FR' },
      { label: 'PAP', url: 'https://pap.fr', countryCode: 'FR' },
      { label: 'Rightmove', url: 'https://rightmove.co.uk', countryCode: 'GB' },
      { label: 'SpareRoom', url: 'https://spareroom.co.uk', countryCode: 'GB' },
      { label: 'Homegate', url: 'https://homegate.ch', countryCode: 'CH' },
      { label: 'ImmoScout24', url: 'https://immoscout24.ch', countryCode: 'CH' },
    ],
  },
  employment: {
    serviceLink: '/services/emploi',
    externalLinks: [
      { label: 'Indeed FR', url: 'https://indeed.fr', countryCode: 'FR' },
      { label: 'Welcome to the Jungle', url: 'https://welcometothejungle.com', countryCode: 'FR' },
      { label: 'Reed', url: 'https://reed.co.uk', countryCode: 'GB' },
      { label: 'Indeed UK', url: 'https://indeed.co.uk', countryCode: 'GB' },
      { label: 'Jobs.ch', url: 'https://jobs.ch', countryCode: 'CH' },
      { label: 'JobUp', url: 'https://jobup.ch', countryCode: 'CH' },
    ],
  },
  health: {
    serviceLink: '/services/sante',
    externalLinks: [
      { label: 'Ameli.fr', url: 'https://ameli.fr', countryCode: 'FR' },
      { label: 'NHS', url: 'https://nhs.uk', countryCode: 'GB' },
      { label: 'OFSP', url: 'https://bag.admin.ch', countryCode: 'CH' },
    ],
  },
  transport: {
    serviceLink: '/services/transport',
  },
  education: {
    serviceLink: '/services/education',
  },
  banking: {
    externalLinks: [
      { label: 'N26', url: 'https://n26.com' },
      { label: 'Wise', url: 'https://wise.com' },
      { label: 'Revolut', url: 'https://revolut.com' },
    ],
  },
};

// Fonction utilitaire
export const getLinksForStep = (
  category: string,
  countryCode?: string
): ChecklistCategoryLinks | null => {
  const links = CHECKLIST_LINKS[category];
  if (!links) return null;

  return {
    serviceLink: links.serviceLink,
    externalLinks: links.externalLinks?.filter(
      (l) => !l.countryCode || l.countryCode === countryCode
    ),
  };
};