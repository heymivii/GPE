import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import apiClient from '../lib/api';
import { adminApi } from './admin';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedPatch = apiClient.patch as ReturnType<typeof vi.fn>;
const mockedDelete = apiClient.delete as ReturnType<typeof vi.fn>;

describe('adminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getStats() GETs /admin/dashboard/stats', async () => {
    mockedGet.mockResolvedValue({ data: { counts: {} } });
    await adminApi.getStats();
    expect(mockedGet).toHaveBeenCalledWith('/admin/dashboard/stats');
  });

  it('getAllProjects() GETs /expatriation-project/admin/all', async () => {
    mockedGet.mockResolvedValue({ data: [] });
    await adminApi.getAllProjects();
    expect(mockedGet).toHaveBeenCalledWith('/expatriation-project/admin/all');
  });

  it('updateProjectStatus() PATCHes the project status', async () => {
    mockedPatch.mockResolvedValue({ data: { idProject: 1, status: 'validated' } });
    await adminApi.updateProjectStatus(1, 'validated');
    expect(mockedPatch).toHaveBeenCalledWith('/expatriation-project/admin/1', {
      status: 'validated',
    });
  });

  describe('getAllProcedures', () => {
    it('omits params when no countryId is given', async () => {
      mockedGet.mockResolvedValue({ data: [] });
      await adminApi.getAllProcedures();
      expect(mockedGet).toHaveBeenCalledWith('/admin-procedure', { params: undefined });
    });

    it('filters by countryId when given', async () => {
      mockedGet.mockResolvedValue({ data: [] });
      await adminApi.getAllProcedures(3);
      expect(mockedGet).toHaveBeenCalledWith('/admin-procedure', { params: { countryId: 3 } });
    });
  });

  it('createProcedure() POSTs to /admin-procedure', async () => {
    mockedPost.mockResolvedValue({ data: { idAdminProcedure: 1 } });
    await adminApi.createProcedure({ procedureType: 'visa', countryId: 1 });
    expect(mockedPost).toHaveBeenCalledWith('/admin-procedure', {
      procedureType: 'visa',
      countryId: 1,
    });
  });

  it('updateProcedure() PATCHes /admin-procedure/:id', async () => {
    mockedPatch.mockResolvedValue({ data: { idAdminProcedure: 1 } });
    await adminApi.updateProcedure(1, { procedureType: 'x' });
    expect(mockedPatch).toHaveBeenCalledWith('/admin-procedure/1', { procedureType: 'x' });
  });

  it('deleteProcedure() DELETEs /admin-procedure/:id', async () => {
    mockedDelete.mockResolvedValue({});
    await adminApi.deleteProcedure(1);
    expect(mockedDelete).toHaveBeenCalledWith('/admin-procedure/1');
  });

  it('generateFromGovLinks() POSTs with no body and the country as a query param', async () => {
    mockedPost.mockResolvedValue({ data: [] });
    await adminApi.generateFromGovLinks('FR');
    expect(mockedPost).toHaveBeenCalledWith('/admin-procedure/generate', undefined, {
      params: { country: 'FR' },
    });
  });

  it('getLogs() GETs /admin-logs', async () => {
    mockedGet.mockResolvedValue({ data: [] });
    await adminApi.getLogs();
    expect(mockedGet).toHaveBeenCalledWith('/admin-logs');
  });
});
