import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));

import api from '../lib/api';
import { checklistApi } from './checklist';

const mockedGet = api.get as ReturnType<typeof vi.fn>;
const mockedPatch = api.patch as ReturnType<typeof vi.fn>;

describe('checklistApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProgress() GETs /procedure-tracking filtered by projectId', async () => {
    mockedGet.mockResolvedValue({ data: [{ idProcedureTracking: 1 }] });
    const result = await checklistApi.getProgress(5);
    expect(mockedGet).toHaveBeenCalledWith('/procedure-tracking?projectId=5');
    expect(result).toEqual([{ idProcedureTracking: 1 }]);
  });

  it('updateProgress() PATCHes the status', async () => {
    mockedPatch.mockResolvedValue({ data: { idProcedureTracking: 1, status: 'completed' } });
    const result = await checklistApi.updateProgress(1, 'completed');
    expect(mockedPatch).toHaveBeenCalledWith('/procedure-tracking/1', {
      status: 'completed',
    });
    expect(result.status).toBe('completed');
  });

  it('updateCompletedFacts() PATCHes the completedFacts array', async () => {
    mockedPatch.mockResolvedValue({
      data: { idProcedureTracking: 1, completedFacts: [1, 2] },
    });
    const result = await checklistApi.updateCompletedFacts(1, [1, 2]);
    expect(mockedPatch).toHaveBeenCalledWith('/procedure-tracking/1', {
      completedFacts: [1, 2],
    });
    expect(result.completedFacts).toEqual([1, 2]);
  });
});
