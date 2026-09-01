import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../../../api/expatriation-project', () => ({
  expatriationProjectApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getCount: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    unlock: vi.fn(),
    complete: vi.fn(),
    cancel: vi.fn(),
    reactivate: vi.fn(),
  },
}));
vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

import { toast } from 'react-hot-toast';
import { expatriationProjectApi } from '../../../api/expatriation-project';
import {
  useProjects,
  useProject,
  useProjectCount,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useUnlockProject,
  useCompleteProject,
  useCancelProject,
  useReactivateProject,
} from './useProjectMutations';

const mockedApi = vi.mocked(expatriationProjectApi);

function wrapper(qc: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

function newQc() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('read hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useProjects respects the enabled flag', () => {
    mockedApi.getAll.mockResolvedValue([]);
    const qc = newQc();
    renderHook(() => useProjects(false), { wrapper: wrapper(qc) });
    expect(mockedApi.getAll).not.toHaveBeenCalled();
  });

  it('useProject only fetches when projectId is truthy', () => {
    mockedApi.getById.mockResolvedValue({} as any);
    const qc = newQc();
    renderHook(() => useProject(0), { wrapper: wrapper(qc) });
    expect(mockedApi.getById).not.toHaveBeenCalled();
  });

  it('useProject fetches by id when projectId is truthy', async () => {
    mockedApi.getById.mockResolvedValue({ idProject: 5 } as any);
    const qc = newQc();
    const { result } = renderHook(() => useProject(5), { wrapper: wrapper(qc) });
    await waitFor(() => expect(result.current.data).toEqual({ idProject: 5 }));
    expect(mockedApi.getById).toHaveBeenCalledWith(5);
  });

  it('useProjectCount fetches the count', async () => {
    mockedApi.getCount.mockResolvedValue(3);
    const qc = newQc();
    const { result } = renderHook(() => useProjectCount(), { wrapper: wrapper(qc) });
    await waitFor(() => expect(result.current.data).toBe(3));
  });
});

describe('useCreateProject', () => {
  beforeEach(() => vi.clearAllMocks());

  it('invalidates the projects list + count and shows a success toast', async () => {
    mockedApi.create.mockResolvedValue({ idProject: 1 } as any);
    const qc = newQc();
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useCreateProject(), { wrapper: wrapper(qc) });

    result.current.mutate({} as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['expatriation-projects'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['expatriation-projects-count'] });
    expect(toast.success).toHaveBeenCalledWith('projectsPage.createSuccess');
  });

  it('shows the API error message when available, else a generic fallback', async () => {
    mockedApi.create.mockRejectedValue({ response: { data: { message: 'quota exceeded' } } });
    const qc = newQc();
    const { result } = renderHook(() => useCreateProject(), { wrapper: wrapper(qc) });

    result.current.mutate({} as any);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('quota exceeded');
  });

  it('falls back to a translated generic error when the API gives no message', async () => {
    mockedApi.create.mockRejectedValue({});
    const qc = newQc();
    const { result } = renderHook(() => useCreateProject(), { wrapper: wrapper(qc) });

    result.current.mutate({} as any);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('projectsPage.createError');
  });
});

describe('useUpdateProject', () => {
  beforeEach(() => vi.clearAllMocks());

  it('caches the updated project and invalidates the list', async () => {
    mockedApi.update.mockResolvedValue({ idProject: 5, objective: 'study' } as any);
    const qc = newQc();
    const setSpy = vi.spyOn(qc, 'setQueryData');
    const { result } = renderHook(() => useUpdateProject(), { wrapper: wrapper(qc) });

    result.current.mutate({ projectId: 5, data: { mainObjective: 'study' } as any });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setSpy).toHaveBeenCalledWith(
      ['expatriation-project', 5],
      { idProject: 5, objective: 'study' },
    );
    expect(toast.success).toHaveBeenCalledWith('projectsPage.updateSuccess');
  });

  it('shows the API error message when available, else a generic fallback', async () => {
    mockedApi.update.mockRejectedValue({ response: { data: { message: 'nope' } } });
    const qc = newQc();
    const { result } = renderHook(() => useUpdateProject(), { wrapper: wrapper(qc) });
    result.current.mutate({ projectId: 5, data: {} as any });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('nope');
  });

  it('falls back to a translated generic error when the API gives no message', async () => {
    mockedApi.update.mockRejectedValue({});
    const qc = newQc();
    const { result } = renderHook(() => useUpdateProject(), { wrapper: wrapper(qc) });
    result.current.mutate({ projectId: 5, data: {} as any });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('projectsPage.updateError');
  });
});

describe('useDeleteProject', () => {
  beforeEach(() => vi.clearAllMocks());

  it('removes the detail cache entry and invalidates the list + count', async () => {
    mockedApi.delete.mockResolvedValue(undefined);
    const qc = newQc();
    const removeSpy = vi.spyOn(qc, 'removeQueries');
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteProject(), { wrapper: wrapper(qc) });

    result.current.mutate(5);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(removeSpy).toHaveBeenCalledWith({ queryKey: ['expatriation-project', 5] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['expatriation-projects'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['expatriation-projects-count'] });
    expect(toast.success).toHaveBeenCalledWith('projectsPage.deleteSuccess');
  });

  it('shows the API error message when available, else a generic fallback', async () => {
    mockedApi.delete.mockRejectedValue({ response: { data: { message: 'nope' } } });
    const qc = newQc();
    const { result } = renderHook(() => useDeleteProject(), { wrapper: wrapper(qc) });
    result.current.mutate(5);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('nope');
  });

  it('falls back to a translated generic error when the API gives no message', async () => {
    mockedApi.delete.mockRejectedValue({});
    const qc = newQc();
    const { result } = renderHook(() => useDeleteProject(), { wrapper: wrapper(qc) });
    result.current.mutate(5);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('projectsPage.deleteError');
  });
});

describe('useUnlockProject', () => {
  beforeEach(() => vi.clearAllMocks());

  it('invalidates the project + list and shows a hardcoded success toast', async () => {
    mockedApi.unlock.mockResolvedValue({ idProject: 5, isPaid: true } as any);
    const qc = newQc();
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useUnlockProject(), { wrapper: wrapper(qc) });

    result.current.mutate(5);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['expatriation-project', 5] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['expatriation-projects'] });
    expect(toast.success).toHaveBeenCalledWith('Projet débloqué — plan complet activé 🎉');
  });

  it('shows a hardcoded error toast on failure', async () => {
    mockedApi.unlock.mockRejectedValue(new Error('boom'));
    const qc = newQc();
    const { result } = renderHook(() => useUnlockProject(), { wrapper: wrapper(qc) });

    result.current.mutate(5);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Le déblocage a échoué');
  });
});

describe('useCompleteProject / useCancelProject / useReactivateProject', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useCompleteProject caches the result and shows a success toast', async () => {
    mockedApi.complete.mockResolvedValue({ idProject: 5, status: 'completed' } as any);
    const qc = newQc();
    const { result } = renderHook(() => useCompleteProject(), { wrapper: wrapper(qc) });
    result.current.mutate({ projectId: 5, data: { reason: 'done' } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('projectDetail.completeSuccess');
  });

  it('useCompleteProject shows the API error message, or a fallback', async () => {
    mockedApi.complete.mockRejectedValueOnce({ response: { data: { message: 'nope' } } });
    const qc = newQc();
    const { result } = renderHook(() => useCompleteProject(), { wrapper: wrapper(qc) });
    result.current.mutate({ projectId: 5, data: { reason: 'done' } });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('nope');

    mockedApi.complete.mockRejectedValueOnce({});
    const { result: result2 } = renderHook(() => useCompleteProject(), { wrapper: wrapper(qc) });
    result2.current.mutate({ projectId: 5, data: { reason: 'done' } });
    await waitFor(() => expect(result2.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('projectDetail.completeError');
  });

  it('useCancelProject caches the result and shows a success toast', async () => {
    mockedApi.cancel.mockResolvedValue({ idProject: 5, status: 'cancelled' } as any);
    const qc = newQc();
    const { result } = renderHook(() => useCancelProject(), { wrapper: wrapper(qc) });
    result.current.mutate({ projectId: 5, data: { reason: 'changed mind' } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('projectDetail.cancelSuccess');
  });

  it('useCancelProject shows the API error message, or a fallback', async () => {
    mockedApi.cancel.mockRejectedValueOnce({ response: { data: { message: 'nope' } } });
    const qc = newQc();
    const { result } = renderHook(() => useCancelProject(), { wrapper: wrapper(qc) });
    result.current.mutate({ projectId: 5, data: { reason: 'x' } });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('nope');

    mockedApi.cancel.mockRejectedValueOnce({});
    const { result: result2 } = renderHook(() => useCancelProject(), { wrapper: wrapper(qc) });
    result2.current.mutate({ projectId: 5, data: { reason: 'x' } });
    await waitFor(() => expect(result2.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('projectDetail.cancelError');
  });

  it('useReactivateProject caches the result and shows a success toast', async () => {
    mockedApi.reactivate.mockResolvedValue({ idProject: 5, status: 'planning' } as any);
    const qc = newQc();
    const { result } = renderHook(() => useReactivateProject(), { wrapper: wrapper(qc) });
    result.current.mutate(5);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('projectDetail.reactivateSuccess');
  });

  it('useReactivateProject shows the API error message, or a fallback', async () => {
    mockedApi.reactivate.mockRejectedValueOnce({ response: { data: { message: 'nope' } } });
    const qc = newQc();
    const { result } = renderHook(() => useReactivateProject(), { wrapper: wrapper(qc) });
    result.current.mutate(5);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('nope');

    mockedApi.reactivate.mockRejectedValueOnce({});
    const { result: result2 } = renderHook(() => useReactivateProject(), { wrapper: wrapper(qc) });
    result2.current.mutate(5);
    await waitFor(() => expect(result2.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('projectDetail.reactivateError');
  });
});
