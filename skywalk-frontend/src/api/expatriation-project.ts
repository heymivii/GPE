import apiClient from '../lib/api';
import type {
  ExpatriationProject,
  CreateExpatriationProjectDto,
  UpdateExpatriationProjectDto,
} from '../types/expatriation-project';

const travelTypeIds: Record<string, number> = {
  'alone': 1,
  'couple': 2,
  'family': 3,
  'friends': 4,
  'other': 5
};

const travelTypeNames: Record<number, string> = {
  1: 'alone',
  2: 'couple',
  3: 'family',
  4: 'friends',
  5: 'other'
};

// Map backend project object to frontend ExpatriationProject structure
const mapBackendToFrontendProject = (bp: any): ExpatriationProject => {
  if (!bp) return bp;

  let travelTypeStr: any = undefined;
  if (bp.travelType && typeof bp.travelType === 'object') {
    travelTypeStr = bp.travelType.name;
  } else if (bp.travelType && typeof bp.travelType === 'string') {
    travelTypeStr = bp.travelType;
  } else if (bp.travelTypeId) {
    travelTypeStr = travelTypeNames[bp.travelTypeId];
  }

  // Retrieve origin country from user object in local storage if possible, as fallback
  let fallbackOriginCountryId: number | undefined = undefined;
  try {
    const cachedUser = localStorage.getItem('skywalk-user');
    if (cachedUser) {
      const u = JSON.parse(cachedUser);
      fallbackOriginCountryId = u.countryOriginId || u.idOriginCountry;
    }
  } catch (e) {
    // Ignore
  }

  return {
    idProject: bp.idProject,
    idUser: bp.userId,
    idDestinationCountry: bp.destinationCountryId,
    idDestinationCity: bp.destinationCityId,
    idOriginCountry: bp.idOriginCountry || fallbackOriginCountryId,
    travelType: travelTypeStr || 'alone',
    mainObjective: bp.objective || 'work',
    expectedDuration: bp.expectedDuration || 12,
    housingBudget: bp.budget ? parseFloat(bp.budget) : undefined,
    projectStatus: bp.status || 'planning',
    expectedDepartureDate: bp.expectedDepartureDate,
    stepsDone: bp.stepsDone || '',
    priorities: bp.priorities || '',
    needsSupport: bp.needsSupport || false,
    checklistProgress: bp.checklistProgress || {},
    createdAt: bp.createdAt,
    updatedAt: bp.updatedAt,
    destinationCity: bp.destinationCity,
    destinationCountry: bp.destinationCountry,
  } as any;
};

// Map frontend CreateDto to backend structure
const mapFrontendToBackendCreateDto = (feDto: CreateExpatriationProjectDto): any => {
  if (!feDto) return feDto;
  return {
    destinationCountryId: feDto.idDestinationCountry,
    destinationCityId: feDto.idDestinationCity,
    travelTypeId: feDto.travelType ? travelTypeIds[feDto.travelType] : undefined,
    objective: feDto.mainObjective,
    expectedDuration: feDto.expectedDuration,
    budget: feDto.housingBudget,
    status: feDto.projectStatus,
    expectedDepartureDate: feDto.expectedDepartureDate,
  };
};

// Map frontend UpdateDto to backend structure
const mapFrontendToBackendUpdateDto = (feDto: UpdateExpatriationProjectDto): any => {
  if (!feDto) return feDto;
  const beDto: any = {};
  
  if (feDto.idDestinationCountry !== undefined) beDto.destinationCountryId = feDto.idDestinationCountry;
  if (feDto.idDestinationCity !== undefined) beDto.destinationCityId = feDto.idDestinationCity;
  if (feDto.travelType !== undefined) beDto.travelTypeId = feDto.travelType ? travelTypeIds[feDto.travelType] : null;
  if (feDto.mainObjective !== undefined) beDto.objective = feDto.mainObjective;
  if (feDto.expectedDuration !== undefined) beDto.expectedDuration = feDto.expectedDuration;
  if (feDto.housingBudget !== undefined) beDto.budget = feDto.housingBudget;
  if (feDto.projectStatus !== undefined) beDto.status = feDto.projectStatus;
  if (feDto.expectedDepartureDate !== undefined) beDto.expectedDepartureDate = feDto.expectedDepartureDate;
  if (feDto.checklistProgress !== undefined) beDto.checklistProgress = feDto.checklistProgress;

  return beDto;
};

export const expatriationProjectApi = {
  getAll: async (): Promise<ExpatriationProject[]> => {
    const response = await apiClient.get<any[]>('/expatriation-project');
    return (response.data || []).map(mapBackendToFrontendProject);
  },

  getById: async (projectId: number): Promise<ExpatriationProject> => {
    const response = await apiClient.get<any>(`/expatriation-project/${projectId}`);
    return mapBackendToFrontendProject(response.data);
  },

  getCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/expatriation-project/count');
    return response.data.count;
  },

  create: async (data: CreateExpatriationProjectDto): Promise<ExpatriationProject> => {
    const backendData = mapFrontendToBackendCreateDto(data);
    const response = await apiClient.post<any>('/expatriation-project', backendData);
    return mapBackendToFrontendProject(response.data);
  },

  update: async (
    projectId: number,
    data: UpdateExpatriationProjectDto,
  ): Promise<ExpatriationProject> => {
    const backendData = mapFrontendToBackendUpdateDto(data);
    const response = await apiClient.patch<any>(
      `/expatriation-project/${projectId}`,
      backendData,
    );
    return mapBackendToFrontendProject(response.data);
  },

  delete: async (projectId: number): Promise<void> => {
    await apiClient.delete(`/expatriation-project/${projectId}`);
  },

  complete: async (
    projectId: number,
    _data: { reason: string; feedback?: string },
  ): Promise<ExpatriationProject> => {
    const response = await apiClient.patch<any>(
      `/expatriation-project/${projectId}`,
      { status: 'completed' },
    );
    return mapBackendToFrontendProject(response.data);
  },

  cancel: async (
    projectId: number,
    _data: { reason: string; details?: string },
  ): Promise<ExpatriationProject> => {
    const response = await apiClient.patch<any>(
      `/expatriation-project/${projectId}`,
      { status: 'cancelled' },
    );
    return mapBackendToFrontendProject(response.data);
  },

  reactivate: async (projectId: number): Promise<ExpatriationProject> => {
    const response = await apiClient.patch<any>(
      `/expatriation-project/${projectId}`,
      { status: 'planning' },
    );
    return mapBackendToFrontendProject(response.data);
  },
};

export default expatriationProjectApi;
