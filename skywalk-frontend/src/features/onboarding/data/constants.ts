
import { SUPPORTED_COUNTRIES } from '../../../data/supportedCountries';

export const COUNTRIES = SUPPORTED_COUNTRIES.map(c => ({
  value: c.code,
  label: c.name,
  i18nKey: c.i18nKey
}));

// IDs for translation lookup - labels resolved dynamically via t()
export const LANGUAGE_LEVEL_IDS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export const STATUS_IDS = ['student', 'employee', 'self_employed', 'unemployed', 'retired', 'other'] as const;
export const TRAVEL_PARTY_IDS = ['alone', 'couple', 'family', 'friends'] as const;
export const GOAL_IDS = ['studies', 'work', 'discovery', 'family', 'internship', 'other'] as const;
export const STAY_DURATION_IDS = ['less_6_months', '6_12_months', '1_3_years', 'more_3_years'] as const;
export const STEPS_DONE_IDS = ['school_registration', 'housing_search', 'job_search', 'visa_application', 'other', 'none'] as const;
export const PRIORITY_IDS = ['housing', 'employment', 'transport', 'admin_help', 'health', 'social_integration'] as const;
export const ONBOARDING_STEP_IDS = ['destination', 'profile', 'objective', 'preparation', 'needs', 'summary'] as const;

// Legacy exports for backward compatibility (used by SummaryStep getOptionLabel)
// Labels are now i18n keys — resolve with t(item.labelKey) at render time
export const LANGUAGE_LEVELS = [
  { value: 'A1', labelKey: 'onboardingLegacy.languageLevels.A1' },
  { value: 'A2', labelKey: 'onboardingLegacy.languageLevels.A2' },
  { value: 'B1', labelKey: 'onboardingLegacy.languageLevels.B1' },
  { value: 'B2', labelKey: 'onboardingLegacy.languageLevels.B2' },
  { value: 'C1', labelKey: 'onboardingLegacy.languageLevels.C1' },
  { value: 'C2', labelKey: 'onboardingLegacy.languageLevels.C2' }
]

export const STATUS_OPTIONS = [
  { value: 'student', labelKey: 'onboardingLegacy.status.student' },
  { value: 'employee', labelKey: 'onboardingLegacy.status.employee' },
  { value: 'self_employed', labelKey: 'onboardingLegacy.status.selfEmployed' },
  { value: 'unemployed', labelKey: 'onboardingLegacy.status.unemployed' },
  { value: 'retired', labelKey: 'onboardingLegacy.status.retired' },
  { value: 'other', labelKey: 'onboardingLegacy.status.other' }
]

export const TRAVEL_PARTY_OPTIONS = [
  { value: 'alone', labelKey: 'onboardingLegacy.travelParty.alone' },
  { value: 'couple', labelKey: 'onboardingLegacy.travelParty.couple' },
  { value: 'family', labelKey: 'onboardingLegacy.travelParty.family' },
  { value: 'friends', labelKey: 'onboardingLegacy.travelParty.friends' }
]

export const GOAL_OPTIONS = [
  { value: 'studies', labelKey: 'onboardingLegacy.goals.studies' },
  { value: 'work', labelKey: 'onboardingLegacy.goals.work' },
  { value: 'discovery', labelKey: 'onboardingLegacy.goals.discovery' },
  { value: 'family', labelKey: 'onboardingLegacy.goals.family' },
  { value: 'internship', labelKey: 'onboardingLegacy.goals.internship' },
  { value: 'other', labelKey: 'onboardingLegacy.goals.other' }
]

export const STAY_DURATION_OPTIONS = [
  { value: 'less_6_months', labelKey: 'onboardingLegacy.stayDuration.less6Months' },
  { value: '6_12_months', labelKey: 'onboardingLegacy.stayDuration.sixTo12Months' },
  { value: '1_3_years', labelKey: 'onboardingLegacy.stayDuration.oneToThreeYears' },
  { value: 'more_3_years', labelKey: 'onboardingLegacy.stayDuration.moreThanThreeYears' }
]

export const STEPS_DONE_OPTIONS = [
  { value: 'school_registration', labelKey: 'onboardingLegacy.stepsDone.schoolRegistration' },
  { value: 'housing_search', labelKey: 'onboardingLegacy.stepsDone.housingSearch' },
  { value: 'job_search', labelKey: 'onboardingLegacy.stepsDone.jobSearch' },
  { value: 'visa_application', labelKey: 'onboardingLegacy.stepsDone.visaApplication' },
  { value: 'other', labelKey: 'onboardingLegacy.stepsDone.other' },
  { value: 'none', labelKey: 'onboardingLegacy.stepsDone.none' }
]

export const PRIORITY_OPTIONS = [
  { value: 'housing', labelKey: 'onboardingLegacy.priorities.housing' },
  { value: 'employment', labelKey: 'onboardingLegacy.priorities.employment' },
  { value: 'transport', labelKey: 'onboardingLegacy.priorities.transport' },
  { value: 'admin_help', labelKey: 'onboardingLegacy.priorities.adminHelp' },
  { value: 'health', labelKey: 'onboardingLegacy.priorities.health' },
  { value: 'social_integration', labelKey: 'onboardingLegacy.priorities.socialIntegration' }
]

export const ONBOARDING_STEPS = [
  { id: 1, labelKey: 'onboardingLegacy.steps.destination', state: 'current' as const },
  { id: 2, labelKey: 'onboardingLegacy.steps.profile', state: 'todo' as const },
  { id: 3, labelKey: 'onboardingLegacy.steps.objective', state: 'todo' as const },
  { id: 4, labelKey: 'onboardingLegacy.steps.preparation', state: 'todo' as const },
  { id: 5, labelKey: 'onboardingLegacy.steps.needs', state: 'todo' as const },
  { id: 6, labelKey: 'onboardingLegacy.steps.summary', state: 'todo' as const }
]