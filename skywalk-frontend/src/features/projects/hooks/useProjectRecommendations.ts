import { useMemo } from 'react';
import type { ExpatriationProject } from '../../../types/expatriation-project';
import type { Country } from '../../../types/country';
import { getVisaDataForCountry } from '../../../data/visa-data';


export interface VisaRecommendation {
  visaType: string;
  visaId: string;
  color: string;
  description: string;
  duration: string;
  cost: string;
  processing: string;
  learnMoreUrl: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export interface ServiceRecommendation {
  id: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  link: string;
}

export interface ActionStep {
  id: string;
  icon: string;
  title: string;
  description: string;
  timeline: string;
  link?: string;
}

export interface ProjectRecommendations {
  visa: VisaRecommendation | null;
  alternativeVisa: VisaRecommendation | null;
  services: ServiceRecommendation[];
  actionPlan: ActionStep[];
  countryCode: string | null;
  durationCategory: 'short' | 'medium' | 'long' | 'permanent';
}


const OBJECTIVE_TO_VISA: Record<string, string> = {
  work: 'work',
  study: 'student',
  family_reunion: 'family',
  retirement: 'short-stay',
  adventure: 'short-stay',
  other: 'short-stay',
};

const OBJECTIVE_TO_ALT_VISA: Record<string, string | null> = {
  work: null,
  study: 'work',
  family_reunion: null,
  retirement: null,
  adventure: null,
  other: null,
};

const PRIORITY_TO_SERVICE: Record<string, { id: string; icon: string; link: string }> = {
  employment: { id: 'emploi', icon: '💼', link: '/services/emploi' },
  housing: { id: 'logement', icon: '🏠', link: '/services/logement' },
  health: { id: 'sante', icon: '🏥', link: '/services/sante' },
  transport: { id: 'transport', icon: '🚗', link: '/services/transport' },
  admin_help: { id: 'demarches', icon: '📋', link: '/services/demarches' },
  social_integration: { id: 'culture', icon: '🤝', link: '/services/culture' },
  education: { id: 'education', icon: '🎓', link: '/services/education' },
  language: { id: 'education', icon: '🗣️', link: '/services/education' },
  business: { id: 'business', icon: '🏢', link: '/services/business' },
  finance: { id: 'banque', icon: '🏦', link: '/services' },
};

function classifyDuration(months?: number): 'short' | 'medium' | 'long' | 'permanent' {
  if (!months || months <= 6) return 'short';
  if (months <= 12) return 'medium';
  if (months <= 36) return 'long';
  return 'permanent';
}


export function useProjectRecommendations(
  project: ExpatriationProject | undefined,
  country: Country | undefined,
): ProjectRecommendations {
  return useMemo(() => {
    const empty: ProjectRecommendations = {
      visa: null,
      alternativeVisa: null,
      services: [],
      actionPlan: [],
      countryCode: null,
      durationCategory: 'short',
    };

    if (!project || !country) return empty;

    const countryCode = country.isoCode?.toUpperCase() || null;
    const durationCategory = classifyDuration(project.expectedDuration);
    const visaData = countryCode ? getVisaDataForCountry(countryCode) : undefined;

    let visa: VisaRecommendation | null = null;
    let alternativeVisa: VisaRecommendation | null = null;

    if (visaData && project.mainObjective) {
      const targetVisaId = OBJECTIVE_TO_VISA[project.mainObjective] || 'short-stay';

      const effectiveVisaId =
        durationCategory === 'short' && !['work', 'study', 'family_reunion'].includes(project.mainObjective)
          ? 'short-stay'
          : targetVisaId;

      const altVisaId =
        project.mainObjective === 'work' && project.travelType === 'family'
          ? 'family'
          : OBJECTIVE_TO_ALT_VISA[project.mainObjective];

      const matchedVisa = visaData.visaTypes.find(v => {
        if (effectiveVisaId === 'work') return v.id.includes('work') || v.id === 'h1b' || v.id === 'engineer' || v.id === 'work-l';
        if (effectiveVisaId === 'student') return v.id.includes('student') || v.id === 'f1' || v.id.includes('student');
        if (effectiveVisaId === 'family') return v.id.includes('family') || v.id.includes('spouse') || v.id.includes('greencard');
        return v.id.includes('short') || v.id.includes('schengen') || v.id.includes('b1b2') || v.id.includes('temporary');
      });

      if (matchedVisa) {
        let confidence: 'high' | 'medium' | 'low' = 'medium';
        if (project.mainObjective && project.expectedDuration && project.travelType) {
          confidence = 'high';
        } else if (!project.mainObjective) {
          confidence = 'low';
        }

        let reason = 'projectRecommendations.visaReason.default';
        if (project.mainObjective === 'work') {
          reason = durationCategory === 'permanent' || durationCategory === 'long'
            ? 'projectRecommendations.visaReason.workLong'
            : 'projectRecommendations.visaReason.workShort';
        } else if (project.mainObjective === 'study') {
          reason = 'projectRecommendations.visaReason.study';
        } else if (project.mainObjective === 'family_reunion') {
          reason = 'projectRecommendations.visaReason.family';
        } else if (project.mainObjective === 'retirement') {
          reason = 'projectRecommendations.visaReason.retirement';
        }

        visa = {
          visaType: matchedVisa.type,
          visaId: matchedVisa.id,
          color: matchedVisa.color,
          description: matchedVisa.description,
          duration: matchedVisa.duration,
          cost: matchedVisa.cost,
          processing: matchedVisa.processing,
          learnMoreUrl: matchedVisa.learnMoreUrl,
          confidence,
          reason,
        };
      }

      if (altVisaId) {
        const matchedAlt = visaData.visaTypes.find(v => {
          if (altVisaId === 'family') return v.id.includes('family') || v.id.includes('spouse') || v.id.includes('greencard');
          if (altVisaId === 'work') return v.id.includes('work') || v.id === 'h1b' || v.id === 'engineer' || v.id === 'work-l';
          return false;
        });
        if (matchedAlt && matchedAlt.id !== matchedVisa?.id) {
          alternativeVisa = {
            visaType: matchedAlt.type,
            visaId: matchedAlt.id,
            color: matchedAlt.color,
            description: matchedAlt.description,
            duration: matchedAlt.duration,
            cost: matchedAlt.cost,
            processing: matchedAlt.processing,
            learnMoreUrl: matchedAlt.learnMoreUrl,
            confidence: 'low',
            reason: 'projectRecommendations.visaReason.alternative',
          };
        }
      }
    }

    const services: ServiceRecommendation[] = [];
    const priorities = project.priorities
      ? project.priorities.split(',').map(p => p.trim().toLowerCase())
      : [];

    const addedServiceIds = new Set<string>();
    priorities.forEach((priority, index) => {
      const mapping = PRIORITY_TO_SERVICE[priority];
      if (mapping && !addedServiceIds.has(mapping.id)) {
        addedServiceIds.add(mapping.id);
        services.push({
          id: mapping.id,
          icon: mapping.icon,
          priority: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
          reason: `projectRecommendations.serviceReason.${priority}`,
          link: mapping.link,
        });
      }
    });

    if (countryCode && !addedServiceIds.has('visa')) {
      services.push({
        id: 'visa',
        icon: '🛂',
        priority: 'high',
        reason: 'projectRecommendations.serviceReason.visaAuto',
        link: `/visa?country=${countryCode}`,
      });
    }

    if (project.mainObjective === 'work' && !addedServiceIds.has('emploi')) {
      services.push({
        id: 'emploi',
        icon: '💼',
        priority: 'medium',
        reason: 'projectRecommendations.serviceReason.workAuto',
        link: '/services/emploi',
      });
    }
    if (project.mainObjective === 'study' && !addedServiceIds.has('education')) {
      services.push({
        id: 'education',
        icon: '🎓',
        priority: 'medium',
        reason: 'projectRecommendations.serviceReason.studyAuto',
        link: '/services/education',
      });
    }

    const actionPlan: ActionStep[] = [];

    if (countryCode) {
      actionPlan.push({
        id: 'visa-step',
        icon: '🛂',
        title: 'projectRecommendations.actionPlan.visa.title',
        description: 'projectRecommendations.actionPlan.visa.description',
        timeline: 'projectRecommendations.actionPlan.visa.timeline',
        link: `/visa?country=${countryCode}`,
      });
    }

    if (project.mainObjective === 'work') {
      actionPlan.push({
        id: 'job-step',
        icon: '💼',
        title: 'projectRecommendations.actionPlan.job.title',
        description: 'projectRecommendations.actionPlan.job.description',
        timeline: 'projectRecommendations.actionPlan.job.timeline',
        link: '/services/emploi',
      });
    } else if (project.mainObjective === 'study') {
      actionPlan.push({
        id: 'study-step',
        icon: '🎓',
        title: 'projectRecommendations.actionPlan.study.title',
        description: 'projectRecommendations.actionPlan.study.description',
        timeline: 'projectRecommendations.actionPlan.study.timeline',
        link: '/services/education',
      });
    }

    if (project.housingBudget || priorities.includes('housing')) {
      actionPlan.push({
        id: 'housing-step',
        icon: '🏠',
        title: 'projectRecommendations.actionPlan.housing.title',
        description: 'projectRecommendations.actionPlan.housing.description',
        timeline: 'projectRecommendations.actionPlan.housing.timeline',
        link: '/services/logement',
      });
    }

    if (priorities.includes('health')) {
      actionPlan.push({
        id: 'health-step',
        icon: '🏥',
        title: 'projectRecommendations.actionPlan.health.title',
        description: 'projectRecommendations.actionPlan.health.description',
        timeline: 'projectRecommendations.actionPlan.health.timeline',
        link: '/services/sante',
      });
    }

    if (priorities.includes('admin_help')) {
      actionPlan.push({
        id: 'admin-step',
        icon: '📋',
        title: 'projectRecommendations.actionPlan.admin.title',
        description: 'projectRecommendations.actionPlan.admin.description',
        timeline: 'projectRecommendations.actionPlan.admin.timeline',
        link: '/services/demarches',
      });
    }

    if (priorities.includes('social_integration')) {
      actionPlan.push({
        id: 'integration-step',
        icon: '🤝',
        title: 'projectRecommendations.actionPlan.integration.title',
        description: 'projectRecommendations.actionPlan.integration.description',
        timeline: 'projectRecommendations.actionPlan.integration.timeline',
        link: '/services/culture',
      });
    }

    if (priorities.includes('transport')) {
      actionPlan.push({
        id: 'transport-step',
        icon: '🚗',
        title: 'projectRecommendations.actionPlan.transport.title',
        description: 'projectRecommendations.actionPlan.transport.description',
        timeline: 'projectRecommendations.actionPlan.transport.timeline',
        link: '/services/transport',
      });
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    services.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return {
      visa,
      alternativeVisa,
      services,
      actionPlan,
      countryCode,
      durationCategory,
    };
  }, [project, country]);
}
