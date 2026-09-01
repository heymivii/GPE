import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import apiClient from '../lib/api';
import { expatriationProjectApi } from './expatriation-project';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedPatch = apiClient.patch as ReturnType<typeof vi.fn>;
const mockedDelete = apiClient.delete as ReturnType<typeof vi.fn>;

describe('expatriationProjectApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('backend-to-frontend mapping (via getById)', () => {
    it('maps a travelType relation object to its name', async () => {
      mockedGet.mockResolvedValue({
        data: { idProject: 1, travelType: { name: 'couple' } },
      });
      const result = await expatriationProjectApi.getById(1);
      expect(result.travelType).toBe('couple');
    });

    it('passes through a raw travelType string', async () => {
      mockedGet.mockResolvedValue({ data: { idProject: 1, travelType: 'family' } });
      const result = await expatriationProjectApi.getById(1);
      expect(result.travelType).toBe('family');
    });

    it('resolves travelType from a bare travelTypeId', async () => {
      mockedGet.mockResolvedValue({ data: { idProject: 1, travelTypeId: 4 } });
      const result = await expatriationProjectApi.getById(1);
      expect(result.travelType).toBe('friends');
    });

    it('defaults travelType to "alone" when nothing is provided', async () => {
      mockedGet.mockResolvedValue({ data: { idProject: 1 } });
      const result = await expatriationProjectApi.getById(1);
      expect(result.travelType).toBe('alone');
    });

    it('applies defaults for objective/duration/status/isPaid when absent', async () => {
      mockedGet.mockResolvedValue({ data: { idProject: 1 } });
      const result = await expatriationProjectApi.getById(1);
      expect(result.mainObjective).toBe('work');
      expect(result.expectedDuration).toBe(12);
      expect(result.projectStatus).toBe('planning');
      expect(result.isPaid).toBe(false);
    });

    it('parses the budget string into a number', async () => {
      mockedGet.mockResolvedValue({ data: { idProject: 1, budget: '1500.50' } });
      const result = await expatriationProjectApi.getById(1);
      expect(result.housingBudget).toBe(1500.5);
    });

    it('falls back to the cached user origin country when idOriginCountry is absent', async () => {
      localStorage.setItem(
        'skywalk-user',
        JSON.stringify({ countryOriginId: 42 }),
      );
      mockedGet.mockResolvedValue({ data: { idProject: 1 } });
      const result = await expatriationProjectApi.getById(1);
      expect(result.idOriginCountry).toBe(42);
    });

    it('prefers the backend idOriginCountry over the cached fallback', async () => {
      localStorage.setItem('skywalk-user', JSON.stringify({ countryOriginId: 42 }));
      mockedGet.mockResolvedValue({ data: { idProject: 1, idOriginCountry: 7 } });
      const result = await expatriationProjectApi.getById(1);
      expect(result.idOriginCountry).toBe(7);
    });

    it('ignores unparsable cached user data instead of throwing', async () => {
      localStorage.setItem('skywalk-user', 'not-json');
      mockedGet.mockResolvedValue({ data: { idProject: 1 } });
      const result = await expatriationProjectApi.getById(1);
      expect(result.idOriginCountry).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('maps every project in the list', async () => {
      mockedGet.mockResolvedValue({
        data: [{ idProject: 1 }, { idProject: 2 }],
      });
      const result = await expatriationProjectApi.getAll();
      expect(result).toHaveLength(2);
      expect(result[0].travelType).toBe('alone');
    });

    it('falls back to an empty array when the response data is missing', async () => {
      mockedGet.mockResolvedValue({ data: null });
      const result = await expatriationProjectApi.getAll();
      expect(result).toEqual([]);
    });
  });

  it('getCount() returns the unwrapped count', async () => {
    mockedGet.mockResolvedValue({ data: { count: 3 } });
    const result = await expatriationProjectApi.getCount();
    expect(mockedGet).toHaveBeenCalledWith('/expatriation-project/count');
    expect(result).toBe(3);
  });

  describe('create', () => {
    it('maps the frontend dto (travelType name -> id) to the backend shape', async () => {
      mockedPost.mockResolvedValue({ data: { idProject: 1 } });
      await expatriationProjectApi.create({
        idDestinationCountry: 3,
        travelType: 'couple',
        mainObjective: 'study',
      } as any);
      expect(mockedPost).toHaveBeenCalledWith(
        '/expatriation-project',
        expect.objectContaining({
          destinationCountryId: 3,
          travelTypeId: 2,
          objective: 'study',
        }),
      );
    });
  });

  describe('update', () => {
    it('only includes fields that were explicitly provided', async () => {
      mockedPatch.mockResolvedValue({ data: { idProject: 1 } });
      await expatriationProjectApi.update(1, { mainObjective: 'study' } as any);
      expect(mockedPatch).toHaveBeenCalledWith('/expatriation-project/1', {
        objective: 'study',
      });
    });

    it('maps travelType to null when explicitly cleared', async () => {
      mockedPatch.mockResolvedValue({ data: { idProject: 1 } });
      await expatriationProjectApi.update(1, { travelType: '' } as any);
      expect(mockedPatch).toHaveBeenCalledWith('/expatriation-project/1', {
        travelTypeId: null,
      });
    });
  });

  it('delete() DELETEs /expatriation-project/:id', async () => {
    mockedDelete.mockResolvedValue({});
    await expatriationProjectApi.delete(1);
    expect(mockedDelete).toHaveBeenCalledWith('/expatriation-project/1');
  });

  it('unlock() PATCHes /expatriation-project/:id/unlock with no body', async () => {
    mockedPatch.mockResolvedValue({ data: { idProject: 1, isPaid: true } });
    const result = await expatriationProjectApi.unlock(1);
    expect(mockedPatch).toHaveBeenCalledWith('/expatriation-project/1/unlock');
    expect(result.isPaid).toBe(true);
  });

  it('complete() PATCHes the project status to completed', async () => {
    mockedPatch.mockResolvedValue({ data: { idProject: 1, status: 'completed' } });
    await expatriationProjectApi.complete(1, { reason: 'done' });
    expect(mockedPatch).toHaveBeenCalledWith('/expatriation-project/1', {
      status: 'completed',
    });
  });

  it('cancel() PATCHes the project status to cancelled', async () => {
    mockedPatch.mockResolvedValue({ data: { idProject: 1, status: 'cancelled' } });
    await expatriationProjectApi.cancel(1, { reason: 'changed my mind' });
    expect(mockedPatch).toHaveBeenCalledWith('/expatriation-project/1', {
      status: 'cancelled',
    });
  });

  it('reactivate() PATCHes the project status back to planning', async () => {
    mockedPatch.mockResolvedValue({ data: { idProject: 1, status: 'planning' } });
    await expatriationProjectApi.reactivate(1);
    expect(mockedPatch).toHaveBeenCalledWith('/expatriation-project/1', {
      status: 'planning',
    });
  });
});
