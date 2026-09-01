import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EditTopicPage from './EditTopicPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const authState: { user: any } = { user: { idUser: 1 } };
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: authState.user }),
}));

const topicState: { data: any; isLoading: boolean; error: any } = {
  data: {
    idForumTopic: 5,
    title: 'Mon sujet',
    category: 'advice',
    user: { idUser: 1 },
    messages: [{ content: 'Contenu initial' }],
  },
  isLoading: false,
  error: null,
};
const mockMutateAsync = vi.fn();
const updateState: { isPending: boolean } = { isPending: false };
vi.mock('../../../hooks/useForum', () => ({
  useForumTopic: () => topicState,
  useUpdateForumTopic: () => ({ mutateAsync: mockMutateAsync, isPending: updateState.isPending }),
}));

function renderAt(id = '5') {
  return render(
    <MemoryRouter initialEntries={[`/forum/edit/${id}`]}>
      <Routes>
        <Route path="/forum/edit/:id" element={<EditTopicPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('EditTopicPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { idUser: 1 };
    topicState.data = {
      idForumTopic: 5,
      title: 'Mon sujet',
      category: 'advice',
      user: { idUser: 1 },
      messages: [{ content: 'Contenu initial' }],
    };
    topicState.isLoading = false;
    topicState.error = null;
    updateState.isPending = false;
  });

  it('shows a loading spinner while the topic loads', () => {
    topicState.isLoading = true;
    const { container } = renderAt();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows an error state when the topic fails to load', () => {
    topicState.error = new Error('Sujet introuvable');
    topicState.data = null;
    renderAt();
    expect(screen.getByText('Sujet introuvable')).toBeInTheDocument();
    fireEvent.click(screen.getByText('forum.editTopic.backToForum'));
    expect(mockNavigate).toHaveBeenCalledWith('/forum');
  });

  it('shows a login-required state when unauthenticated', () => {
    authState.user = null;
    renderAt();
    expect(screen.getByText('forum.editTopic.loginRequired')).toBeInTheDocument();
    fireEvent.click(screen.getByText('forum.editTopic.login'));
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
  });

  it('shows an access-denied state when the user is not the topic author', () => {
    authState.user = { idUser: 99 };
    renderAt();
    expect(screen.getByText('forum.editTopic.accessDenied')).toBeInTheDocument();
    fireEvent.click(screen.getByText('forum.editTopic.backToTopic'));
    expect(mockNavigate).toHaveBeenCalledWith('/forum/post/5');
  });

  it('pre-fills the form from the topic and its first message', () => {
    renderAt();
    expect(screen.getByLabelText(/forum.editTopic.titleLabel/)).toHaveValue('Mon sujet');
    expect(screen.getByLabelText(/forum.editTopic.contentLabel/)).toHaveValue('Contenu initial');
    expect(screen.getByText('forum.categories.advice.name').closest('button')).toHaveClass('border-blue-500');
  });

  it('disables submit when the title is cleared', () => {
    renderAt();
    fireEvent.change(screen.getByLabelText(/forum.editTopic.titleLabel/), { target: { value: '' } });
    expect(screen.getByText('forum.editTopic.saveChanges')).toBeDisabled();
  });

  it('submits the updated topic and navigates back to it', async () => {
    mockMutateAsync.mockResolvedValue({});
    renderAt();
    fireEvent.change(screen.getByLabelText(/forum.editTopic.titleLabel/), { target: { value: 'Titre modifié' } });
    fireEvent.click(screen.getByText('forum.categories.question.name'));
    fireEvent.click(screen.getByText('forum.editTopic.saveChanges'));
    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 5,
        data: { title: 'Titre modifié', content: 'Contenu initial', category: 'question' },
      }),
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/forum/post/5'));
  });

  it('shows the server error message from a 400 response', async () => {
    mockMutateAsync.mockRejectedValue({ response: { status: 400, data: { message: 'Titre invalide.' } } });
    renderAt();
    fireEvent.click(screen.getByText('forum.editTopic.saveChanges'));
    expect(await screen.findByText('Titre invalide.')).toBeInTheDocument();
  });

  it('shows a generic error message on an unexpected failure', async () => {
    mockMutateAsync.mockRejectedValue(new Error('network down'));
    renderAt();
    fireEvent.click(screen.getByText('forum.editTopic.saveChanges'));
    expect(await screen.findByText('forum.editTopic.error: network down')).toBeInTheDocument();
  });

  it('dismisses the feedback banner', async () => {
    mockMutateAsync.mockRejectedValue({ response: { status: 400, data: { message: 'Erreur X.' } } });
    renderAt();
    fireEvent.click(screen.getByText('forum.editTopic.saveChanges'));
    await screen.findByText('Erreur X.');
    fireEvent.click(screen.getByRole('button', { name: '' }));
    expect(screen.queryByText('Erreur X.')).not.toBeInTheDocument();
  });

  it('shows a saving overlay while the mutation is pending', () => {
    updateState.isPending = true;
    renderAt();
    expect(screen.getAllByText('forum.editTopic.saving').length).toBeGreaterThan(0);
  });
});
