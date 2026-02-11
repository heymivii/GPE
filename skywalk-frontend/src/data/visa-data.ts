export interface VisaType {
  id: string;
  color: string;
  type: string;
  description: string;
  duration: string;
  cost: string;
  processing: string;
  learnMoreUrl: string;
}

export interface VisaStep {
  title: string;
  description: string;
  timeline: string;
  details?: string[];
}

export interface CostItem {
  label: string;
  amount: string;
}

export interface Warning {
  level: 'red' | 'yellow' | 'orange';
  text: string;
}

export interface OfficialResource {
  name: string;
  url: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
}

export interface VisaCountryData {
  countryCode: string;
  countryName: string;
  flag: string;
  visaTypes: VisaType[];
  workVisaSteps: VisaStep[];
  costs: CostItem[];
  totalCost: string;
  warnings: Warning[];
  officialResources: OfficialResource[];
  checklist: ChecklistItem[];
  tips: string[];
}

export const visaDataByCountry: Record<string, VisaCountryData> = {
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    flag: '🇫🇷',
    visaTypes: [
      {
        id: 'short-stay',
        color: 'green',
        type: 'shortStay',
        description: 'shortStayDesc',
        duration: '90days',
        cost: '80EUR',
        processing: '15days',
        learnMoreUrl: 'https://france-visas.gouv.fr/en/short-stay-visa',
      },
      {
        id: 'work',
        color: 'yellow',
        type: 'workVisa',
        description: 'workVisaDescFR',
        duration: '1to4years',
        cost: '99EUR',
        processing: '2to3months',
        learnMoreUrl: 'https://france-visas.gouv.fr/en/long-stay-visa',
      },
      {
        id: 'student',
        color: 'blue',
        type: 'studentVisa',
        description: 'studentVisaDesc',
        duration: '1yearRenewable',
        cost: '99EUR',
        processing: '1to2months',
        learnMoreUrl: 'https://france-visas.gouv.fr/en/student-visa',
      },
      {
        id: 'family',
        color: 'purple',
        type: 'familyReunification',
        description: 'familyReunificationDesc',
        duration: 'variable',
        cost: '99EUR',
        processing: '4to6months',
        learnMoreUrl: 'https://france-visas.gouv.fr/en/family-visa',
      },
    ],
    workVisaSteps: [
      {
        title: 'step1ObtainJobOffer',
        description: 'step1DescFR',
        timeline: 'variable',
        details: ['step1Detail1FR', 'step1Detail2FR'],
      },
      {
        title: 'step2EmployerApplies',
        description: 'step2DescFR',
        timeline: '2to4weeks',
      },
      {
        title: 'step3VisaApplication',
        description: 'step3DescFR',
        timeline: '4to8weeks',
        details: ['step3Detail1', 'step3Detail2', 'step3Detail3'],
      },
      {
        title: 'step4MedicalExam',
        description: 'step4DescFR',
        timeline: '1to2weeksAfterArrival',
      },
      {
        title: 'step5ResidencePermit',
        description: 'step5DescFR',
        timeline: '3monthsAfterArrival',
      },
    ],
    costs: [
      { label: 'visaApplicationFee', amount: '99 EUR' },
      { label: 'documentTranslations', amount: '~150 EUR' },
      { label: 'medicalExamination', amount: '~50 EUR' },
      { label: 'residencePermit', amount: '~225 EUR' },
    ],
    totalCost: '~524 EUR',
    warnings: [
      { level: 'red', text: 'warningProcessingFR' },
      { level: 'yellow', text: 'warningBrexit' },
      { level: 'orange', text: 'warningHealthInsurance' },
    ],
    officialResources: [
      { name: 'France-Visas.gouv.fr', url: 'https://france-visas.gouv.fr' },
      { name: 'Service-Public.fr', url: 'https://www.service-public.fr' },
      { name: 'OFII', url: 'https://www.ofii.fr' },
    ],
    checklist: [
      { id: 'passport', label: 'checkPassport' },
      { id: 'contract', label: 'checkContract' },
      { id: 'accommodation', label: 'checkAccommodation' },
      { id: 'bank', label: 'checkBankStatements' },
      { id: 'insurance', label: 'checkHealthInsurance' },
      { id: 'photos', label: 'checkPassportPhotos' },
      { id: 'form', label: 'checkApplicationForm' },
    ],
    tips: ['tipStartEarly', 'tipApostille', 'tipLearnFrench', 'tipJoinExpats', 'tipDontQuit'],
  },

  US: {
    countryCode: 'US',
    countryName: 'États-Unis',
    flag: '🇺🇸',
    visaTypes: [
      {
        id: 'b1b2',
        color: 'green',
        type: 'shortStay',
        description: 'shortStayDescUS',
        duration: '180days',
        cost: '185USD',
        processing: '3to6months',
        learnMoreUrl: 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit.html',
      },
      {
        id: 'h1b',
        color: 'yellow',
        type: 'workVisa',
        description: 'workVisaDescUS',
        duration: '3to6years',
        cost: '460USD',
        processing: '3to8months',
        learnMoreUrl: 'https://travel.state.gov/content/travel/en/us-visas/employment.html',
      },
      {
        id: 'f1',
        color: 'blue',
        type: 'studentVisa',
        description: 'studentVisaDescUS',
        duration: 'studyDuration',
        cost: '185USD',
        processing: '2to4months',
        learnMoreUrl: 'https://travel.state.gov/content/travel/en/us-visas/study.html',
      },
      {
        id: 'greencard',
        color: 'purple',
        type: 'familyReunification',
        description: 'familyReunificationDescUS',
        duration: 'permanent',
        cost: '535USD',
        processing: '1to3years',
        learnMoreUrl: 'https://travel.state.gov/content/travel/en/us-visas/immigrate.html',
      },
    ],
    workVisaSteps: [
      {
        title: 'step1ObtainJobOfferUS',
        description: 'step1DescUS',
        timeline: 'variable',
        details: ['step1Detail1US', 'step1Detail2US'],
      },
      {
        title: 'step2H1BLottery',
        description: 'step2DescUS',
        timeline: 'marchApril',
      },
      {
        title: 'step3USCISPetition',
        description: 'step3DescUS',
        timeline: '3to6months',
      },
      {
        title: 'step4ConsularInterview',
        description: 'step4DescUS',
        timeline: '1to3months',
      },
      {
        title: 'step5EntryAndSSN',
        description: 'step5DescUS',
        timeline: '2to4weeksAfterArrival',
      },
    ],
    costs: [
      { label: 'visaApplicationFee', amount: '$185' },
      { label: 'h1bRegistrationFee', amount: '$10' },
      { label: 'h1bPetitionFee', amount: '$460' },
      { label: 'premiumProcessing', amount: '$2,805' },
    ],
    totalCost: '~$3,460 USD',
    warnings: [
      { level: 'red', text: 'warningH1BLottery' },
      { level: 'yellow', text: 'warningUSProcessing' },
      { level: 'orange', text: 'warningUSHealthInsurance' },
    ],
    officialResources: [
      { name: 'USCIS.gov', url: 'https://www.uscis.gov' },
      { name: 'Travel.State.gov', url: 'https://travel.state.gov' },
      { name: 'CBP.gov', url: 'https://www.cbp.gov' },
    ],
    checklist: [
      { id: 'passport', label: 'checkPassport' },
      { id: 'ds160', label: 'checkDS160' },
      { id: 'i797', label: 'checkI797' },
      { id: 'contract', label: 'checkContractUS' },
      { id: 'bank', label: 'checkBankStatements' },
      { id: 'photos', label: 'checkPassportPhotosUS' },
      { id: 'interview', label: 'checkConsularInterview' },
    ],
    tips: ['tipStartEarlyUS', 'tipH1BLawyer', 'tipPremiumProcessing', 'tipJoinExpats', 'tipDontQuit'],
  },

  CH: {
    countryCode: 'CH',
    countryName: 'Suisse',
    flag: '🇨🇭',
    visaTypes: [
      {
        id: 'schengen',
        color: 'green',
        type: 'shortStay',
        description: 'shortStayDescCH',
        duration: '90days',
        cost: '80CHF',
        processing: '15days',
        learnMoreUrl: 'https://www.sem.admin.ch/sem/en/home/themen/einreise.html',
      },
      {
        id: 'work-l',
        color: 'yellow',
        type: 'workVisa',
        description: 'workVisaDescCH',
        duration: '1to5years',
        cost: '150CHF',
        processing: '4to8weeks',
        learnMoreUrl: 'https://www.sem.admin.ch/sem/en/home/themen/arbeit.html',
      },
      {
        id: 'student',
        color: 'blue',
        type: 'studentVisa',
        description: 'studentVisaDescCH',
        duration: '1yearRenewable',
        cost: '150CHF',
        processing: '6to8weeks',
        learnMoreUrl: 'https://www.sem.admin.ch/sem/en/home/themen/einreise/studieren.html',
      },
      {
        id: 'family',
        color: 'purple',
        type: 'familyReunification',
        description: 'familyReunificationDescCH',
        duration: 'variable',
        cost: '150CHF',
        processing: '2to3months',
        learnMoreUrl: 'https://www.sem.admin.ch/sem/en/home/themen/aufenthalt/familiennachzug.html',
      },
    ],
    workVisaSteps: [
      {
        title: 'step1ObtainJobOfferCH',
        description: 'step1DescCH',
        timeline: 'variable',
        details: ['step1Detail1CH', 'step1Detail2CH'],
      },
      {
        title: 'step2EmployerAppliesCH',
        description: 'step2DescCH',
        timeline: '2to4weeks',
      },
      {
        title: 'step3CantonalApproval',
        description: 'step3DescCH',
        timeline: '4to8weeks',
      },
      {
        title: 'step4VisaCollectionCH',
        description: 'step4DescCH',
        timeline: '1to2weeks',
      },
      {
        title: 'step5RegisterMunicipality',
        description: 'step5DescCH',
        timeline: '14daysAfterArrival',
      },
    ],
    costs: [
      { label: 'visaApplicationFee', amount: '150 CHF' },
      { label: 'residencePermit', amount: '~100 CHF' },
      { label: 'documentTranslations', amount: '~200 CHF' },
      { label: 'healthInsuranceCH', amount: '~350 CHF/mois' },
    ],
    totalCost: '~800 CHF + 350 CHF/mois',
    warnings: [
      { level: 'red', text: 'warningCHQuotas' },
      { level: 'yellow', text: 'warningCHInsurance' },
      { level: 'orange', text: 'warningCHLanguage' },
    ],
    officialResources: [
      { name: 'SEM (Secrétariat d\'État aux migrations)', url: 'https://www.sem.admin.ch' },
      { name: 'ch.ch (Portail officiel)', url: 'https://www.ch.ch' },
      { name: 'Swissemigration.ch', url: 'https://www.swissemigration.ch' },
    ],
    checklist: [
      { id: 'passport', label: 'checkPassport' },
      { id: 'contract', label: 'checkContractCH' },
      { id: 'diplomas', label: 'checkDiplomasCH' },
      { id: 'insurance', label: 'checkInsuranceCH' },
      { id: 'bank', label: 'checkBankStatements' },
      { id: 'photos', label: 'checkPassportPhotos' },
      { id: 'cv', label: 'checkCVCH' },
    ],
    tips: ['tipStartEarly', 'tipLearnLanguageCH', 'tipCHInsuranceDeadline', 'tipJoinExpats', 'tipDontQuit'],
  },

  JP: {
    countryCode: 'JP',
    countryName: 'Japon',
    flag: '🇯🇵',
    visaTypes: [
      {
        id: 'temporary-visitor',
        color: 'green',
        type: 'shortStay',
        description: 'shortStayDescJP',
        duration: '90days',
        cost: 'free',
        processing: '5to10days',
        learnMoreUrl: 'https://www.mofa.go.jp/j_info/visit/visa/index.html',
      },
      {
        id: 'engineer',
        color: 'yellow',
        type: 'workVisa',
        description: 'workVisaDescJP',
        duration: '1to5years',
        cost: '3000JPY',
        processing: '1to3months',
        learnMoreUrl: 'https://www.mofa.go.jp/j_info/visit/visa/long/index.html',
      },
      {
        id: 'student-jp',
        color: 'blue',
        type: 'studentVisa',
        description: 'studentVisaDescJP',
        duration: '2yearsMax',
        cost: '3000JPY',
        processing: '1to3months',
        learnMoreUrl: 'https://www.studyinjapan.go.jp/en/planning/visa/',
      },
      {
        id: 'spouse',
        color: 'purple',
        type: 'familyReunification',
        description: 'familyReunificationDescJP',
        duration: '1to3years',
        cost: '3000JPY',
        processing: '1to3months',
        learnMoreUrl: 'https://www.mofa.go.jp/j_info/visit/visa/long/index.html',
      },
    ],
    workVisaSteps: [
      {
        title: 'step1ObtainJobOfferJP',
        description: 'step1DescJP',
        timeline: 'variable',
        details: ['step1Detail1JP', 'step1Detail2JP'],
      },
      {
        title: 'step2COEApplication',
        description: 'step2DescJP',
        timeline: '1to3months',
      },
      {
        title: 'step3VisaApplicationJP',
        description: 'step3DescJP',
        timeline: '5to10days',
      },
      {
        title: 'step4ResidenceCard',
        description: 'step4DescJP',
        timeline: 'uponArrival',
      },
      {
        title: 'step5CityRegistration',
        description: 'step5DescJP',
        timeline: '14daysAfterArrival',
      },
    ],
    costs: [
      { label: 'visaApplicationFee', amount: '3,000 JPY (~20€)' },
      { label: 'coeCertificate', amount: 'gratuit' },
      { label: 'residenceCard', amount: 'gratuit' },
      { label: 'healthInsuranceJP', amount: '~15,000 JPY/mois' },
    ],
    totalCost: '~3,000 JPY + 15,000 JPY/mois',
    warnings: [
      { level: 'red', text: 'warningJPCOE' },
      { level: 'yellow', text: 'warningJPLanguage' },
      { level: 'orange', text: 'warningJPInsurance' },
    ],
    officialResources: [
      { name: 'MOFA (Ministry of Foreign Affairs)', url: 'https://www.mofa.go.jp' },
      { name: 'Immigration Services Agency', url: 'https://www.moj.go.jp/isa/' },
      { name: 'Study in Japan', url: 'https://www.studyinjapan.go.jp' },
    ],
    checklist: [
      { id: 'passport', label: 'checkPassport' },
      { id: 'coe', label: 'checkCOE' },
      { id: 'contract', label: 'checkContractJP' },
      { id: 'diplomas', label: 'checkDiplomasJP' },
      { id: 'photos', label: 'checkPassportPhotosJP' },
      { id: 'insurance', label: 'checkInsuranceJP' },
      { id: 'plan', label: 'checkFlightPlan' },
    ],
    tips: ['tipStartEarly', 'tipLearnJapanese', 'tipHankoSeal', 'tipJoinExpats', 'tipDontQuit'],
  },
};

export const getVisaDataForCountry = (countryCode: string): VisaCountryData | undefined => {
  return visaDataByCountry[countryCode];
};

export const getAvailableVisaCountries = (): { code: string; name: string; flag: string }[] => {
  return Object.values(visaDataByCountry).map(d => ({
    code: d.countryCode,
    name: d.countryName,
    flag: d.flag,
  }));
};
