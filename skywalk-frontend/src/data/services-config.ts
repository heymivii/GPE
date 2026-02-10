import { Briefcase, Home, Car, Heart, FileText, GraduationCap, Building2, Users, Globe, Landmark, ClipboardList } from 'lucide-react';
import type { TFunction } from 'i18next';

export interface ServiceGuide {
  title: string;
  steps: string[];
}

export interface ServiceConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  hasTools?: boolean; // Indique si le service a des outils interactifs
  stats?: {
    label: string;
    value: string;
  }[];
  guides: ServiceGuide[];
  tips: string[];
  searchCategory?: string;
  faq?: {
    question: string;
    answer: string;
  }[];
  comingSoon?: boolean; // Indique que le service est à venir (grisé)
}

export const getServicesConfig = (t: TFunction): Record<string, ServiceConfig> => ({
  emploi: {
    id: 'emploi',
    title: t('services.categories.emploi.title'),
    subtitle: t('services.categories.emploi.subtitle'),
    description: t('services.categories.emploi.description'),
    icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hasTools: true, // ✅ A des outils (CV, Interview)
    stats: [
      { label: t('services.categories.emploi.stats.offers'), value: '2,500+' },
      { label: t('services.categories.emploi.stats.sectors'), value: '15' },
      { label: t('services.categories.emploi.stats.placement'), value: '85%' },
    ],
    guides: [
      {
        title: t('services.categories.emploi.guides.candidature.title'),
        steps: t('services.categories.emploi.guides.candidature.steps', { returnObjects: true }) as string[],
      },
      {
        title: t('services.categories.emploi.guides.demarches.title'),
        steps: t('services.categories.emploi.guides.demarches.steps', { returnObjects: true }) as string[],
      },
    ],
    tips: t('services.categories.emploi.tips', { returnObjects: true }) as string[],
    searchCategory: 'emploi',
    faq: t('services.categories.emploi.faq', { returnObjects: true }) as { question: string; answer: string }[],
  },

  logement: {
    id: 'logement',
    title: t('services.categories.logement.title'),
    subtitle: t('services.categories.logement.subtitle'),
    description: t('services.categories.logement.description'),
    icon: Home,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    hasTools: true, // ✅ A des outils (Budget, Dossier, Garantie)
    stats: [
      { label: t('services.categories.logement.stats.ads'), value: '1,800+' },
      { label: t('services.categories.logement.stats.cities'), value: '45' },
      { label: t('services.categories.logement.stats.avgPrice'), value: '€850' },
    ],
    guides: [
      {
        title: t('services.categories.logement.guides.recherche.title'),
        steps: t('services.categories.logement.guides.recherche.steps', { returnObjects: true }) as string[],
      },
      {
        title: t('services.categories.logement.guides.documents.title'),
        steps: t('services.categories.logement.guides.documents.steps', { returnObjects: true }) as string[],
      },
    ],
    tips: t('services.categories.logement.tips', { returnObjects: true }) as string[],
    searchCategory: 'logement',
    faq: t('services.categories.logement.faq', { returnObjects: true }) as { question: string; answer: string }[],
  },

  transport: {
    id: 'transport',
    title: t('services.categories.transport.title'),
    subtitle: t('services.categories.transport.subtitle'),
    description: t('services.categories.transport.description'),
    icon: Car,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hasTools: true, // ✅ A des outils (Coût, Permis, Véhicule)
    stats: [
      { label: t('services.categories.transport.stats.networks'), value: '120+' },
      { label: t('services.categories.transport.stats.passes'), value: '35' },
      { label: t('services.categories.transport.stats.savings'), value: '40%' },
    ],
    guides: [
      {
        title: t('services.categories.transport.guides.choix.title'),
        steps: t('services.categories.transport.guides.choix.steps', { returnObjects: true }) as string[],
      },
      {
        title: t('services.categories.transport.guides.permis.title'),
        steps: t('services.categories.transport.guides.permis.steps', { returnObjects: true }) as string[],
      },
    ],
    tips: t('services.categories.transport.tips', { returnObjects: true }) as string[],
    searchCategory: 'transport',
  },

  sante: {
    id: 'sante',
    title: t('services.categories.sante.title'),
    subtitle: t('services.categories.sante.subtitle'),
    description: t('services.categories.sante.description'),
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    hasTools: true, // ✅ A des outils (Couverture, Dossier médical, Budget)
    stats: [
      { label: t('services.categories.sante.stats.professionals'), value: '5,000+' },
      { label: t('services.categories.sante.stats.languages'), value: '25' },
      { label: t('services.categories.sante.stats.insurances'), value: '18' },
    ],
    guides: [
      {
        title: t('services.categories.sante.guides.couverture.title'),
        steps: t('services.categories.sante.guides.couverture.steps', { returnObjects: true }) as string[],
      },
      {
        title: t('services.categories.sante.guides.documents.title'),
        steps: t('services.categories.sante.guides.documents.steps', { returnObjects: true }) as string[],
      },
    ],
    tips: t('services.categories.sante.tips', { returnObjects: true }) as string[],
    searchCategory: 'sante',
  },

  demarches: {
    id: 'demarches',
    title: t('services.categories.demarches.title'),
    subtitle: t('services.categories.demarches.subtitle'),
    description: t('services.categories.demarches.description'),
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    stats: [
      { label: t('services.categories.demarches.stats.procedures'), value: '50+' },
      { label: t('services.categories.demarches.stats.successRate'), value: '92%' },
      { label: t('services.categories.demarches.stats.avgDelay'), value: '6 semaines' },
    ],
    guides: [
      {
        title: t('services.categories.demarches.guides.prioritaires.title'),
        steps: t('services.categories.demarches.guides.prioritaires.steps', { returnObjects: true }) as string[],
      },
      {
        title: t('services.categories.demarches.guides.organisation.title'),
        steps: t('services.categories.demarches.guides.organisation.steps', { returnObjects: true }) as string[],
      },
    ],
    tips: t('services.categories.demarches.tips', { returnObjects: true }) as string[],
    searchCategory: 'demarches',
  },

  education: {
    id: 'education',
    title: t('services.categories.education.title'),
    subtitle: t('services.categories.education.subtitle'),
    description: t('services.categories.education.description'),
    icon: GraduationCap,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    stats: [
      { label: t('services.categories.education.stats.establishments'), value: '800+' },
      { label: t('services.categories.education.stats.trainings'), value: '3,200+' },
      { label: t('services.categories.education.stats.languageCourses'), value: '450+' },
    ],
    guides: [
      {
        title: t('services.categories.education.guides.scolarisation.title'),
        steps: t('services.categories.education.guides.scolarisation.steps', { returnObjects: true }) as string[],
      },
      {
        title: t('services.categories.education.guides.formation.title'),
        steps: t('services.categories.education.guides.formation.steps', { returnObjects: true }) as string[],
      },
    ],
    tips: t('services.categories.education.tips', { returnObjects: true }) as string[],
    searchCategory: 'education',
  },

  culture: {
    id: 'culture',
    title: t('services.categories.culture.title'),
    subtitle: t('services.categories.culture.subtitle'),
    description: t('services.categories.culture.description'),
    icon: Users,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    stats: [
      { label: t('services.categories.culture.stats.eventsPerMonth'), value: '200+' },
      { label: t('services.categories.culture.stats.communities'), value: '85' },
      { label: t('services.categories.culture.stats.activities'), value: '1,500+' },
    ],
    guides: [
      {
        title: t('services.categories.culture.guides.integration.title'),
        steps: t('services.categories.culture.guides.integration.steps', { returnObjects: true }) as string[],
      },
    ],
    tips: t('services.categories.culture.tips', { returnObjects: true }) as string[],
    searchCategory: 'culture',
  },

  business: {
    id: 'business',
    title: t('services.categories.business.title'),
    subtitle: t('services.categories.business.subtitle'),
    description: t('services.categories.business.description'),
    icon: Building2,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    stats: [
      { label: t('services.categories.business.stats.creationsPerYear'), value: '1,200+' },
      { label: t('services.categories.business.stats.successRate'), value: '78%' },
      { label: t('services.categories.business.stats.avgDelay'), value: '3 mois' },
    ],
    guides: [
      {
        title: t('services.categories.business.guides.creation.title'),
        steps: t('services.categories.business.guides.creation.steps', { returnObjects: true }) as string[],
      },
      {
        title: t('services.categories.business.guides.freelance.title'),
        steps: t('services.categories.business.guides.freelance.steps', { returnObjects: true }) as string[],
      },
    ],
    tips: t('services.categories.business.tips', { returnObjects: true }) as string[],
    searchCategory: 'business',
  },

  /* ── Coming Soon services ── */

  visa: {
    id: 'visa',
    title: t('services.categories.visa.title'),
    subtitle: t('services.categories.visa.subtitle'),
    description: t('services.categories.visa.description'),
    icon: Globe,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    comingSoon: true,
    guides: [],
    tips: [],
  },

  banque: {
    id: 'banque',
    title: t('services.categories.banque.title'),
    subtitle: t('services.categories.banque.subtitle'),
    description: t('services.categories.banque.description'),
    icon: Landmark,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    comingSoon: true,
    guides: [],
    tips: [],
  },

  'demarches-admin': {
    id: 'demarches-admin',
    title: t('services.categories.demarches-admin.title'),
    subtitle: t('services.categories.demarches-admin.subtitle'),
    description: t('services.categories.demarches-admin.description'),
    icon: ClipboardList,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    comingSoon: true,
    guides: [],
    tips: [],
  },
});

export const getServiceBySlug = (slug: string, t: TFunction): ServiceConfig | undefined => {
  const services = getServicesConfig(t);
  return services[slug];
};

export const getAllServices = (t: TFunction): ServiceConfig[] => {
  return Object.values(getServicesConfig(t));
};

export const getServicesWithTools = (t: TFunction): ServiceConfig[] => {
  return Object.values(getServicesConfig(t)).filter(service => service.hasTools === true);
};

/** Services with tools + coming soon services (for the index page) */
export const getServicesForIndex = (t: TFunction): ServiceConfig[] => {
  return Object.values(getServicesConfig(t)).filter(service => service.hasTools === true || service.comingSoon === true);
};
