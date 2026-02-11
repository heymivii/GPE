
export interface VisaToProjectMapping {
  stepId: string;
  substepId: string;
}

export const VISA_CHECKLIST_MAPPING: Record<string, Record<string, VisaToProjectMapping>> = {
  FR: {
    passport:      { stepId: '1', substepId: '1.3' },
    contract:      { stepId: '1', substepId: '1.3' },
    accommodation: { stepId: '2', substepId: '2.5' },
    bank:          { stepId: '2', substepId: '2.5' },
    insurance:     { stepId: '2', substepId: '2.5' },
    photos:        { stepId: '2', substepId: '2.5' },
    form:          { stepId: '2', substepId: '2.2' },
  },

  US: {
    passport:  { stepId: '1', substepId: '1.3' },
    ds160:     { stepId: '2', substepId: '2.1' },
    i797:      { stepId: '2', substepId: '2.2' },
    contract:  { stepId: '1', substepId: '1.3' },
    bank:      { stepId: '2', substepId: '2.3' },
    photos:    { stepId: '2', substepId: '2.3' },
    interview: { stepId: '2', substepId: '2.4' },
  },

  CH: {
    passport:  { stepId: '2', substepId: '2.2' },
    contract:  { stepId: '1', substepId: '1.3' },
    diplomas:  { stepId: '2', substepId: '2.2' },
    insurance: { stepId: '2', substepId: '2.2' },
    bank:      { stepId: '2', substepId: '2.2' },
    photos:    { stepId: '2', substepId: '2.2' },
    cv:        { stepId: '2', substepId: '2.2' },
  },

  JP: {
    passport:  { stepId: '2', substepId: '2.3' },
    coe:       { stepId: '1', substepId: '1.4' },
    contract:  { stepId: '1', substepId: '1.2' },
    diplomas:  { stepId: '1', substepId: '1.2' },
    photos:    { stepId: '2', substepId: '2.3' },
    insurance: { stepId: '2', substepId: '2.3' },
    plan:      { stepId: '2', substepId: '2.5' },
  },
};

export function getVisaToProjectMapping(
  countryCode: string,
  visaChecklistItemId: string,
): VisaToProjectMapping | undefined {
  return VISA_CHECKLIST_MAPPING[countryCode]?.[visaChecklistItemId];
}
