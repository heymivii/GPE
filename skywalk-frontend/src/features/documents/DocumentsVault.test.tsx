import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import DocumentsVault from './DocumentsVault';
import { documentsApi } from '../../api/documents';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('../../api/documents', async () => {
  const actual = await vi.importActual<any>('../../api/documents');
  return {
    ...actual,
    documentsApi: {
      listByProject: vi.fn(),
      listByProcedure: vi.fn(),
      upload: vi.fn(),
      remove: vi.fn(),
      download: vi.fn(),
    },
  };
});

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseMutation = vi.mocked(useMutation);
const mockedUseQueryClient = vi.mocked(useQueryClient);

const invalidateQueries = vi.fn();
const uploadMutate = vi.fn();
const deleteMutate = vi.fn();

const doc = {
  idDocument: 1,
  docType: 'passport',
  originalName: 'passeport.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 1024,
  createdAt: '2026-01-01T00:00:00Z',
};

function setup({ isLoading = false, docsList = [doc] }: any = {}) {
  mockedUseQueryClient.mockReturnValue({ invalidateQueries } as any);
  mockedUseQuery.mockReturnValue({ data: docsList, isLoading } as any);
  mockedUseMutation.mockImplementation(((config: any) => {
    const fnText = config.mutationFn?.toString() || '';
    if (fnText.includes('remove')) return { mutate: deleteMutate, isPending: false };
    return { mutate: uploadMutate, isPending: false };
  }) as any);
}

function makeFile(name: string, type: string, size: number) {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('DocumentsVault', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state', () => {
    setup({ isLoading: true, docsList: [] });
    const { container } = render(<DocumentsVault projectId={1} />);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('shows an empty state', () => {
    setup({ docsList: [] });
    render(<DocumentsVault projectId={1} />);
    expect(screen.getByText('documents.empty')).toBeInTheDocument();
  });

  it('lists documents', () => {
    setup();
    render(<DocumentsVault projectId={1} />);
    expect(screen.getByText(/passeport\.pdf/)).toBeInTheDocument();
  });

  it('renders the header in non-compact mode, hides it in compact mode', () => {
    setup();
    const { rerender } = render(<DocumentsVault projectId={1} />);
    expect(screen.getByText('documents.title')).toBeInTheDocument();
    rerender(<DocumentsVault projectId={1} compact />);
    expect(screen.queryByText('documents.title')).not.toBeInTheDocument();
  });

  it('uploads a valid file, scoped to the project', () => {
    setup();
    render(<DocumentsVault projectId={7} />);
    const file = makeFile('id.png', 'image/png', 1024);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    expect(uploadMutate).toHaveBeenCalledWith({ file, type: 'passport' });
  });

  it('rejects an oversized file', () => {
    setup();
    render(<DocumentsVault projectId={1} />);
    const file = makeFile('big.pdf', 'application/pdf', 11 * 1024 * 1024);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    expect(toast.error).toHaveBeenCalledWith('documents.sizeError');
    expect(uploadMutate).not.toHaveBeenCalled();
  });

  it('deletes a document', () => {
    setup();
    render(<DocumentsVault projectId={1} />);
    fireEvent.click(screen.getByTitle('documents.delete'));
    expect(deleteMutate).toHaveBeenCalledWith(1);
  });

  it('downloads a document', () => {
    vi.mocked(documentsApi.download).mockResolvedValue(undefined as any);
    setup();
    render(<DocumentsVault projectId={1} />);
    fireEvent.click(screen.getByTitle('documents.download'));
    expect(documentsApi.download).toHaveBeenCalledWith(doc);
  });

  it('queries by procedure when a procedureTrackingId is given', () => {
    setup();
    render(<DocumentsVault projectId={1} procedureTrackingId={99} />);
    expect(mockedUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['documents', 'procedure', 99] }),
    );
  });
});
