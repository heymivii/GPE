export interface ChecklistLink {
  label: string;
  url: string;
  countryCode?: string;
  isInternal?: boolean;
}

export interface ChecklistCategoryLinks {
  serviceLink?: string;
  externalLinks?: ChecklistLink[];
}

export const CHECKLIST_LINKS: Record<string, ChecklistCategoryLinks> = {
  // ── Anglais (ancien mapping) ──────────────────────────────────────────
  administrative: {
    serviceLink: '/services/visa',
    externalLinks: [
      { label: 'Service-Public.fr', url: 'https://service-public.fr', countryCode: 'FR' },
      { label: 'GOV.UK', url: 'https://gov.uk', countryCode: 'GB' },
      { label: 'CH.ch', url: 'https://www.ch.ch', countryCode: 'CH' },
      { label: 'USA.gov', url: 'https://usa.gov', countryCode: 'US' },
    ],
  },
  housing: {
    serviceLink: '/services/logement',
    externalLinks: [
      { label: 'SeLoger', url: 'https://seloger.com', countryCode: 'FR' },
      { label: 'PAP', url: 'https://pap.fr', countryCode: 'FR' },
      { label: 'Rightmove', url: 'https://rightmove.co.uk', countryCode: 'GB' },
      { label: 'Homegate', url: 'https://homegate.ch', countryCode: 'CH' },
      { label: 'Zillow', url: 'https://zillow.com', countryCode: 'US' },
      { label: 'Apartments.com', url: 'https://apartments.com', countryCode: 'US' },
    ],
  },
  employment: {
    serviceLink: '/services/emploi',
    externalLinks: [
      { label: 'Indeed FR', url: 'https://indeed.fr', countryCode: 'FR' },
      { label: 'Indeed US', url: 'https://indeed.com', countryCode: 'US' },
      { label: 'LinkedIn', url: 'https://linkedin.com/jobs', countryCode: 'US' },
      { label: 'Jobs.ch', url: 'https://jobs.ch', countryCode: 'CH' },
    ],
  },
  health: {
    serviceLink: '/services/sante',
    externalLinks: [
      { label: 'Ameli.fr', url: 'https://ameli.fr', countryCode: 'FR' },
      { label: 'NHS', url: 'https://nhs.uk', countryCode: 'GB' },
      { label: 'OFSP', url: 'https://bag.admin.ch', countryCode: 'CH' },
      { label: 'Healthcare.gov', url: 'https://healthcare.gov', countryCode: 'US' },
    ],
  },
  transport: { serviceLink: '/services/transport' },
  education: { serviceLink: '/services/education' },
  banking: {
    externalLinks: [
      { label: 'N26', url: 'https://n26.com' },
      { label: 'Wise', url: 'https://wise.com' },
      { label: 'Revolut', url: 'https://revolut.com' },
    ],
  },
  visa: {
    serviceLink: '/services/visa',
    externalLinks: [
      { label: 'France-Visas', url: 'https://france-visas.gouv.fr', countryCode: 'FR' },
      { label: 'IRCC Canada', url: 'https://www.canada.ca/fr/immigration-refugies-citoyennete.html', countryCode: 'CA' },
      { label: 'SEM Suisse', url: 'https://www.sem.admin.ch', countryCode: 'CH' },
      { label: 'USCIS', url: 'https://www.uscis.gov', countryCode: 'US' },
      { label: 'MOJ Japan', url: 'https://www.moj.go.jp', countryCode: 'JP' },
    ],
  },

  // ── Français (catégories BDD) ─────────────────────────────────────────
  administratif: {
    serviceLink: '/services/visa',
    externalLinks: [
      { label: 'Service-Public.fr', url: 'https://service-public.fr', countryCode: 'FR' },
      { label: 'CH.ch', url: 'https://www.ch.ch', countryCode: 'CH' },
      { label: 'USA.gov', url: 'https://usa.gov', countryCode: 'US' },
      { label: 'Canada.ca', url: 'https://www.canada.ca', countryCode: 'CA' },
      { label: 'e-Gov Japan', url: 'https://www.e-gov.go.jp', countryCode: 'JP' },
    ],
  },
  logement: {
    serviceLink: '/services/logement',
    externalLinks: [
      { label: 'SeLoger', url: 'https://seloger.com', countryCode: 'FR' },
      { label: 'PAP', url: 'https://pap.fr', countryCode: 'FR' },
      { label: 'Homegate', url: 'https://homegate.ch', countryCode: 'CH' },
      { label: 'Zillow', url: 'https://zillow.com', countryCode: 'US' },
      { label: 'Apartments.com', url: 'https://apartments.com', countryCode: 'US' },
      { label: 'Kijiji CA', url: 'https://www.kijiji.ca', countryCode: 'CA' },
    ],
  },
  'vie-quotidienne': {
    serviceLink: '/services/emploi',
    externalLinks: [
      { label: 'Wise', url: 'https://wise.com' },
      { label: 'Revolut', url: 'https://revolut.com' },
      { label: 'N26', url: 'https://n26.com' },
    ],
  },
  'pre-departure': {
    serviceLink: '/services/visa',
  },
  arrival: {
    serviceLink: undefined,
  },
  arrivee: {
    serviceLink: undefined,
  },
  installation: {
    serviceLink: undefined,
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