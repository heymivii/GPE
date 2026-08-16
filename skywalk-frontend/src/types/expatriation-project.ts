export interface ChecklistProgress {
  [stepId: string]: {
    completed: boolean;
    completedAt?: string;
    substeps?: {
      [substepId: string]: {
        completed: boolean;
        completedAt?: string;
      };
    };
  };
}

export interface ExpatriationProject {
  idProject: number;
  idUser: number;
  idDestinationCountry: number;
  idDestinationCity?: number | null;
  idOriginCountry?: number;
  languageLevel?: string;
  travelType?: 'alone' | 'couple' | 'family' | 'friends' | 'other';
  mainObjective?: 'work' | 'study' | 'retirement' | 'adventure' | 'family_reunion' | 'other';
  expectedDuration?: number;
  housingBudget?: number;
  stepsDone?: string;
  priorities?: string;
  needsSupport: boolean;
  isPaid?: boolean;
  projectStatus: 'planning' | 'active' | 'completed' | 'cancelled' | 'on_hold';
  expectedDepartureDate?: string;
  nationality?: string;
  hasChildren?: boolean;
  hasJobOffer?: boolean;
  checklistProgress?: ChecklistProgress;
  completedAt?: string;
  completedReason?: string;
  completedFeedback?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancellationDetails?: string;
  createdAt: string;
  updatedAt: string;
  destinationCity?: { id: number; name: string; slug: string } | null;
  destinationCountry?: { idCountry: number; countryName: string; isoCode: string } | null;
}

export interface CreateExpatriationProjectDto {
  idDestinationCountry: number;
  idDestinationCity?: number | null;
  idOriginCountry?: number;
  languageLevel?: string;
  travelType?: 'alone' | 'couple' | 'family' | 'friends' | 'other';
  mainObjective?: 'work' | 'study' | 'retirement' | 'adventure' | 'family_reunion' | 'other';
  expectedDuration?: number;
  housingBudget?: number;
  stepsDone?: string;
  priorities?: string;
  needsSupport?: boolean;
  projectStatus?: 'planning' | 'active' | 'completed' | 'cancelled' | 'on_hold';
  expectedDepartureDate?: string;
  nationality?: string;
  hasChildren?: boolean;
  hasJobOffer?: boolean;
}

export interface UpdateExpatriationProjectDto extends Partial<CreateExpatriationProjectDto> {
  checklistProgress?: ChecklistProgress;
}
