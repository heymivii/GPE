export interface ExpatriationProject {
  idProject: number;
  idUser: number;
  idDestinationCountry: number;
  idDestinationCity?: number;
  travelType?: 'alone' | 'couple' | 'family' | 'friends' | 'other';
  mainObjective?: 'work' | 'study' | 'retirement' | 'adventure' | 'family_reunion' | 'other';
  expectedDuration?: number;
  housingBudget?: number;
  stepsDone?: string;
  priorities?: string;
  needsSupport: boolean;
  projectStatus: 'planning' | 'active' | 'completed' | 'cancelled' | 'on_hold';
  expectedDepartureDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpatriationProjectDto {
  idDestinationCountry: number;
  idDestinationCity?: number;
  travelType?: 'alone' | 'couple' | 'family' | 'friends' | 'other';
  mainObjective?: 'work' | 'study' | 'retirement' | 'adventure' | 'family_reunion' | 'other';
  expectedDuration?: number;
  housingBudget?: number;
  stepsDone?: string;
  priorities?: string;
  needsSupport?: boolean;
  projectStatus?: 'planning' | 'active' | 'completed' | 'cancelled' | 'on_hold';
  expectedDepartureDate?: string;
}

export interface UpdateExpatriationProjectDto extends Partial<CreateExpatriationProjectDto> {}
