import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import DocumentsPage from './DocumentsPage';
import { documentsApi } from '../../api/documents';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr' },
  }),
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
      listAll: vi.fn(),
      upload: vi.fn(),
      remove: vi.fn(),
      download: vi.fn(),
      blobUrl: vi.fn(),
    },
  };
});

vi.mock('../../api/expatriation-project', () => ({
  expatriationProjectApi: { getAll: vi.fn() },
}));

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseMutation = vi.mocked(useMutation);
const mockedUseQueryClient = vi.mocked(useQueryClient);

const invalidateQueries = vi.fn();
const uploadMutate = vi.fn();
const deleteMutate = vi.fn();

const docs = [
  {
    idDocument: 1,
    docType: 'passport',
    originalName: 'passeport.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 204800,
    createdAt: '2026-01-01T00:00:00Z',
    project: null,
  },
  {
    idDocument: 2,
    docType: 'visa',
    originalName: 'visa-canada.png',
    mimeType: 'image/png',
    sizeBytes: 51200,
    createdAt: '2026-01-02T00:00:00Z',
    project: { idProject: 5, destinationCountry: { countryName: 'Canada' } },
  },
];

function setup({ isLoading = false, docsList = docs }: any = {}) {
  mockedUseQueryClient.mockReturnValue({ invalidateQueries } as any);
  mockedUseQuery.mockImplementation((opts: any) => {
    if (opts.queryKey[0] === 'documents') return { data: docsList, isLoading } as any;
    if (opts.queryKey[0] === 'projects') return { data: [] } as any;
    return { data: undefined } as any;
  });
  mockedUseMutation.mockImplementation(((config: any) => {
    const fnText = config.mutationFn?.toString() || '';
    if (fnText.includes('remove')) return { mutate: deleteMutate, isPending: false };
    return { mutate: uploadMutate, isPending: false };
  }) as any);
}

function makeFile(name: string, type: string, size: number) {
  const file = new File(['x'.repeat(Math.min(size, 10))], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('DocumentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state', () => {
    setup({ isLoading: true, docsList: [] });
    const { container } = render(<DocumentsPage />);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('shows an empty state when there are no documents', () => {
    setup({ docsList: [] });
    render(<DocumentsPage />);
    expect(screen.getByText('documents.empty')).toBeInTheDocument();
  });

  it('lists documents with their name and personal/project badge', () => {
    setup();
    render(<DocumentsPage />);
    expect(screen.getByText('passeport.pdf')).toBeInTheDocument();
    expect(screen.getByText('documents.page.personal')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
  });

  it('filters by search text', () => {
    setup();
    render(<DocumentsPage />);
    fireEvent.change(screen.getByPlaceholderText('documents.page.searchPlaceholder'), {
      target: { value: 'visa' },
    });
    expect(screen.queryByText('passeport.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('visa-canada.png')).toBeInTheDocument();
  });

  it('shows a no-results state when the filters match nothing', () => {
    setup();
    render(<DocumentsPage />);
    fireEvent.change(screen.getByPlaceholderText('documents.page.searchPlaceholder'), {
      target: { value: 'zzz-nomatch' },
    });
    expect(screen.getByText('documents.page.noResults')).toBeInTheDocument();
  });

  it('uploads a valid file selected via the input', () => {
    setup();
    render(<DocumentsPage />);
    const file = makeFile('id.png', 'image/png', 1024);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    expect(uploadMutate).toHaveBeenCalledWith({ file, type: 'passport' });
  });

  it('rejects a file with an unsupported mime type', () => {
    setup();
    render(<DocumentsPage />);
    const file = makeFile('archive.zip', 'application/zip', 1024);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    expect(toast.error).toHaveBeenCalledWith('documents.formatError');
    expect(uploadMutate).not.toHaveBeenCalled();
  });

  it('rejects a file that is too large', () => {
    setup();
    render(<DocumentsPage />);
    const file = makeFile('big.pdf', 'application/pdf', 11 * 1024 * 1024);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    expect(toast.error).toHaveBeenCalledWith('documents.sizeError');
    expect(uploadMutate).not.toHaveBeenCalled();
  });

  it('deletes a document', () => {
    setup();
    render(<DocumentsPage />);
    fireEvent.click(screen.getAllByTitle('documents.delete')[0]);
    expect(deleteMutate).toHaveBeenCalledWith(1);
  });

  it('downloads a document', () => {
    vi.mocked(documentsApi.download).mockResolvedValue(undefined as any);
    setup();
    render(<DocumentsPage />);
    fireEvent.click(screen.getAllByTitle('documents.download')[0]);
    expect(documentsApi.download).toHaveBeenCalledWith(docs[0]);
  });

  it('opens the preview modal and closes it on click', async () => {
    vi.mocked(documentsApi.blobUrl).mockResolvedValue('blob:http://x/1');
    setup();
    render(<DocumentsPage />);
    fireEvent.click(screen.getAllByText('documents.page.preview')[0]);
    await vi.waitFor(() => expect(screen.getByTitle('documents.page.close')).toBeInTheDocument());
    fireEvent.click(screen.getByTitle('documents.page.close'));
    expect(screen.queryByTitle('documents.page.close')).not.toBeInTheDocument();
  });

  it('closes the preview modal on Escape', async () => {
    vi.mocked(documentsApi.blobUrl).mockResolvedValue('blob:http://x/1');
    setup();
    render(<DocumentsPage />);
    fireEvent.click(screen.getAllByText('documents.page.preview')[0]);
    await vi.waitFor(() => expect(screen.getByTitle('documents.page.close')).toBeInTheDocument());
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTitle('documents.page.close')).not.toBeInTheDocument();
  });
});
