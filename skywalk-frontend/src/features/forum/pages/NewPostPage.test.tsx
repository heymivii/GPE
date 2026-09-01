import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NewPostPage from './NewPostPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => (typeof fallback === 'string' ? fallback : key),
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const authState: { user: any } = { user: { idUser: 1, fullName: 'Jean' } };
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: authState.user }),
}));

const mockMutateAsync = vi.fn();
const createState: { isPending: boolean } = { isPending: false };
vi.mock('../../../hooks/useForum', () => ({
  useCreateForumTopic: () => ({ mutateAsync: mockMutateAsync, isPending: createState.isPending }),
}));

const mockGetAll = vi.fn();
vi.mock('../../../api/destinations', () => ({
  destinationsApi: { getAll: (...a: any[]) => mockGetAll(...a) },
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <NewPostPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('NewPostPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { idUser: 1, fullName: 'Jean' };
    createState.isPending = false;
    mockGetAll.mockResolvedValue([
      { idCountry: 2, countryName: 'Allemagne' },
      { idCountry: 1, countryName: 'France' },
    ]);
  });

  it('shows the login-required state and navigates to login/forum', () => {
    authState.user = null;
    renderPage();
    expect(screen.getByText('forum.newTopic.loginRequired')).toBeInTheDocument();
    fireEvent.click(screen.getByText('forum.newTopic.loginButton'));
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
  });

  it('renders the form with all categories', () => {
    renderPage();
    expect(screen.getByLabelText(/forum.newTopic.titleLabel/)).toBeInTheDocument();
    expect(screen.getByText('forum.categories.question.name')).toBeInTheDocument();
    expect(screen.getByText('forum.categories.testimony.name')).toBeInTheDocument();
    expect(screen.getByText('forum.categories.other.name')).toBeInTheDocument();
  });

  it('sorts the country options alphabetically', async () => {
    renderPage();
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(3));
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual(['— Aucun pays —', 'Allemagne', 'France']);
  });

  it('disables submit until title and content are filled', () => {
    renderPage();
    const submitBtn = screen.getByText('forum.newTopic.publish');
    expect(submitBtn).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/forum.newTopic.titleLabel/), { target: { value: 'Mon titre' } });
    expect(submitBtn).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/forum.newTopic.contentLabel/), { target: { value: 'Mon contenu' } });
    expect(submitBtn).not.toBeDisabled();
  });

  it('selects a category', () => {
    renderPage();
    fireEvent.click(screen.getByText('forum.categories.advice.name'));
    expect(screen.getByText('forum.categories.advice.name').closest('button')).toHaveClass('border-blue-500');
  });

  it('submits the topic and navigates to the new post', async () => {
    mockMutateAsync.mockResolvedValue({ idForumTopic: 42 });
    renderPage();
    fireEvent.change(screen.getByLabelText(/forum.newTopic.titleLabel/), { target: { value: 'Mon titre' } });
    fireEvent.change(screen.getByLabelText(/forum.newTopic.contentLabel/), { target: { value: 'Mon contenu' } });
    fireEvent.click(screen.getByText('forum.newTopic.publish'));
    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({
        title: 'Mon titre',
        content: 'Mon contenu',
        category: 'question',
        countryId: undefined,
      }),
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/forum/post/42'));
  });

  it('shows a validation error when the title is missing', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/forum.newTopic.contentLabel/), { target: { value: 'x' } });
    fireEvent.change(screen.getByLabelText(/forum.newTopic.titleLabel/), { target: { value: 'x' } });
    fireEvent.change(screen.getByLabelText(/forum.newTopic.titleLabel/), { target: { value: '' } });
    // submit button is disabled with empty title, so submit the form directly
    fireEvent.submit(screen.getByLabelText(/forum.newTopic.titleLabel/).closest('form')!);
    expect(screen.getByText('forum.newTopic.titleRequired')).toBeInTheDocument();
  });

  it('shows the server error message from a 400 response', async () => {
    mockMutateAsync.mockRejectedValue({ response: { status: 400, data: { message: 'Titre déjà utilisé.' } } });
    renderPage();
    fireEvent.change(screen.getByLabelText(/forum.newTopic.titleLabel/), { target: { value: 'Mon titre' } });
    fireEvent.change(screen.getByLabelText(/forum.newTopic.contentLabel/), { target: { value: 'Mon contenu' } });
    fireEvent.click(screen.getByText('forum.newTopic.publish'));
    expect(await screen.findByText('Titre déjà utilisé.')).toBeInTheDocument();
  });

  it('shows a generic error message on an unexpected failure', async () => {
    mockMutateAsync.mockRejectedValue(new Error('network down'));
    renderPage();
    fireEvent.change(screen.getByLabelText(/forum.newTopic.titleLabel/), { target: { value: 'Mon titre' } });
    fireEvent.change(screen.getByLabelText(/forum.newTopic.contentLabel/), { target: { value: 'Mon contenu' } });
    fireEvent.click(screen.getByText('forum.newTopic.publish'));
    expect(await screen.findByText('forum.newTopic.submitError: network down')).toBeInTheDocument();
  });

  it('dismisses the feedback banner', async () => {
    mockMutateAsync.mockRejectedValue({ response: { status: 400, data: { message: 'Erreur X.' } } });
    renderPage();
    fireEvent.change(screen.getByLabelText(/forum.newTopic.titleLabel/), { target: { value: 'Mon titre' } });
    fireEvent.change(screen.getByLabelText(/forum.newTopic.contentLabel/), { target: { value: 'Mon contenu' } });
    fireEvent.click(screen.getByText('forum.newTopic.publish'));
    await screen.findByText('Erreur X.');
    fireEvent.click(screen.getByRole('button', { name: '' }));
    expect(screen.queryByText('Erreur X.')).not.toBeInTheDocument();
  });

  it('shows a publishing overlay while the mutation is pending', () => {
    createState.isPending = true;
    renderPage();
    expect(screen.getAllByText('forum.newTopic.publishing').length).toBeGreaterThan(0);
  });
});
