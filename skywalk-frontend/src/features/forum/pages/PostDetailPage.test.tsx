import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PostDetailPage from './PostDetailPage';
import {
  useForumTopic,
  useCreateForumMessage,
  useUpdateForumMessage,
  useDeleteForumMessage,
  useReportContent,
  useLockTopic,
  usePinTopic,
  useModeratorDeleteMessage,
  useModeratorDeleteTopic,
  useDeleteTopic,
  useFollowTopic,
  useUnfollowTopic,
} from '../../../hooks/useForum';
import { useAuth } from '../../../hooks/useAuth';
import { useMyTopicRatings, useRateMessage } from '../../../hooks/useRatings';
import { userReportApi } from '../../../api/user-report';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) =>
      opts && typeof opts === 'object' ? `${key}:${JSON.stringify(opts)}` : key,
  }),
}));

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '42' }),
    useNavigate: () => navigate,
  };
});

vi.mock('../../../hooks/useForum', () => ({
  useForumTopic: vi.fn(),
  useCreateForumMessage: vi.fn(),
  useUpdateForumMessage: vi.fn(),
  useDeleteForumMessage: vi.fn(),
  useReportContent: vi.fn(),
  useLockTopic: vi.fn(),
  usePinTopic: vi.fn(),
  useModeratorDeleteMessage: vi.fn(),
  useModeratorDeleteTopic: vi.fn(),
  useDeleteTopic: vi.fn(),
  useFollowTopic: vi.fn(),
  useUnfollowTopic: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({ useAuth: vi.fn() }));

vi.mock('../../../hooks/useRatings', () => ({
  useMyTopicRatings: vi.fn(),
  useRateMessage: vi.fn(),
}));

vi.mock('../../../api/user-report', () => ({
  userReportApi: { create: vi.fn() },
}));

const mockedUseForumTopic = vi.mocked(useForumTopic);
const mockedUseCreateForumMessage = vi.mocked(useCreateForumMessage);
const mockedUseUpdateForumMessage = vi.mocked(useUpdateForumMessage);
const mockedUseDeleteForumMessage = vi.mocked(useDeleteForumMessage);
const mockedUseReportContent = vi.mocked(useReportContent);
const mockedUseLockTopic = vi.mocked(useLockTopic);
const mockedUsePinTopic = vi.mocked(usePinTopic);
const mockedUseModeratorDeleteMessage = vi.mocked(useModeratorDeleteMessage);
const mockedUseModeratorDeleteTopic = vi.mocked(useModeratorDeleteTopic);
const mockedUseDeleteTopic = vi.mocked(useDeleteTopic);
const deleteTopicMutateAsync = vi.fn();
const mockedUseFollowTopic = vi.mocked(useFollowTopic);
const mockedUseUnfollowTopic = vi.mocked(useUnfollowTopic);
const mockedUseAuth = vi.mocked(useAuth);
const mockedUseMyTopicRatings = vi.mocked(useMyTopicRatings);
const mockedUseRateMessage = vi.mocked(useRateMessage);

const createMutateAsync = vi.fn();
const updateMutateAsync = vi.fn();
const deleteMutateAsync = vi.fn();
const reportMutateAsync = vi.fn();
const lockMutateAsync = vi.fn();
const pinMutateAsync = vi.fn();
const modDeleteMessageMutateAsync = vi.fn();
const modDeleteTopicMutateAsync = vi.fn();
const followMutate = vi.fn();
const unfollowMutate = vi.fn();
const rateMutate = vi.fn();

const topic = {
  idForumTopic: 42,
  title: 'Bienvenue au Canada',
  category: 'question',
  is_pinned: false,
  is_locked: false,
  created_at: '2026-01-01T00:00:00Z',
  isFollowedByMe: false,
  followersCount: 3,
  user: { idUser: 1, fullName: 'Alice' },
  country: { countryName: 'Canada' },
  messages: [
    { message_id: 1, content: 'Message initial', sent_at: '2026-01-01T00:00:00Z', user: { idUser: 1, fullName: 'Alice' } },
    { message_id: 2, content: 'Une réponse', sent_at: '2026-01-01T01:00:00Z', user: { idUser: 2, fullName: 'Bob' } },
  ],
};

function setup({
  isLoading = false,
  error = null,
  topicData = topic,
  user = { idUser: 1, id: 1, userRole: 'user' },
}: any = {}) {
  mockedUseForumTopic.mockReturnValue({ data: topicData, isLoading, error } as any);
  mockedUseCreateForumMessage.mockReturnValue({ mutateAsync: createMutateAsync, isPending: false } as any);
  mockedUseUpdateForumMessage.mockReturnValue({ mutateAsync: updateMutateAsync, isPending: false } as any);
  mockedUseDeleteForumMessage.mockReturnValue({ mutateAsync: deleteMutateAsync, isPending: false } as any);
  mockedUseReportContent.mockReturnValue({ mutateAsync: reportMutateAsync, isPending: false } as any);
  mockedUseLockTopic.mockReturnValue({ mutateAsync: lockMutateAsync, isPending: false } as any);
  mockedUsePinTopic.mockReturnValue({ mutateAsync: pinMutateAsync, isPending: false } as any);
  mockedUseModeratorDeleteMessage.mockReturnValue({ mutateAsync: modDeleteMessageMutateAsync, isPending: false } as any);
  mockedUseModeratorDeleteTopic.mockReturnValue({ mutateAsync: modDeleteTopicMutateAsync, isPending: false } as any);
  mockedUseDeleteTopic.mockReturnValue({ mutateAsync: deleteTopicMutateAsync, isPending: false } as any);
  mockedUseFollowTopic.mockReturnValue({ mutate: followMutate, isPending: false } as any);
  mockedUseUnfollowTopic.mockReturnValue({ mutate: unfollowMutate, isPending: false } as any);
  mockedUseAuth.mockReturnValue({ user } as any);
  mockedUseMyTopicRatings.mockReturnValue({ data: [] } as any);
  mockedUseRateMessage.mockReturnValue({ mutate: rateMutate } as any);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <PostDetailPage />
    </MemoryRouter>,
  );
}

describe('PostDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('shows a loading state', () => {
    setup({ isLoading: true, topicData: undefined });
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('shows a not-found state on error', () => {
    setup({ error: new Error('boom'), topicData: undefined });
    renderPage();
    expect(screen.getByText('forum.postDetail.notFound')).toBeInTheDocument();
  });

  it('renders the topic, initial message and replies', () => {
    setup();
    renderPage();
    expect(screen.getByText('Bienvenue au Canada')).toBeInTheDocument();
    expect(screen.getByText('Message initial')).toBeInTheDocument();
    expect(screen.getByText('Une réponse')).toBeInTheDocument();
  });

  it('shows a join-the-conversation CTA when logged out', () => {
    setup({ user: null });
    renderPage();
    expect(screen.getByText('forum.postDetail.joinConversation')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('forum.postDetail.writePlaceholder')).not.toBeInTheDocument();
  });

  it('submits a reply when logged in', () => {
    createMutateAsync.mockResolvedValue(undefined);
    setup();
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('forum.postDetail.writePlaceholder'), {
      target: { value: 'Ma réponse' },
    });
    fireEvent.submit(screen.getByPlaceholderText('forum.postDetail.writePlaceholder').closest('form')!);
    expect(createMutateAsync).toHaveBeenCalledWith({ content: 'Ma réponse', topicId: 42 });
  });

  it('shows a locked message and hides the reply form when the topic is locked', () => {
    setup({ topicData: { ...topic, is_locked: true } });
    renderPage();
    expect(screen.getByText('forum.postDetail.moderation.locked')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('forum.postDetail.writePlaceholder')).not.toBeInTheDocument();
  });

  it('toggles follow / unfollow', () => {
    setup();
    renderPage();
    fireEvent.click(screen.getByTitle('forum.follow.follow'));
    expect(followMutate).toHaveBeenCalledWith(42);
  });

  it('redirects to login when toggling follow while logged out', () => {
    setup({ user: null });
    renderPage();
    fireEvent.click(screen.getByTitle('forum.follow.follow'));
    expect(navigate).toHaveBeenCalledWith('/auth/login');
    expect(followMutate).not.toHaveBeenCalled();
  });

  it('edits and saves your own reply', () => {
    updateMutateAsync.mockResolvedValue(undefined);
    setup({ user: { idUser: 2, id: 2, userRole: 'user' } });
    renderPage();
    fireEvent.click(screen.getByTitle('forum.postDetail.edit'));
    const textarea = screen.getByDisplayValue('Une réponse');
    fireEvent.change(textarea, { target: { value: 'Réponse modifiée' } });
    fireEvent.click(screen.getByText('forum.postDetail.save'));
    expect(updateMutateAsync).toHaveBeenCalledWith({
      id: 2,
      data: { content: 'Réponse modifiée' },
      topicId: 42,
    });
  });

  it('cancels editing a reply', () => {
    setup({ user: { idUser: 2, id: 2, userRole: 'user' } });
    renderPage();
    fireEvent.click(screen.getByTitle('forum.postDetail.edit'));
    fireEvent.click(screen.getByText('forum.postDetail.cancel'));
    expect(screen.queryByDisplayValue('Une réponse')).not.toBeInTheDocument();
    expect(screen.getByText('Une réponse')).toBeInTheDocument();
  });

  it('deletes your own reply after confirmation', () => {
    deleteMutateAsync.mockResolvedValue(undefined);
    setup({ user: { idUser: 2, id: 2, userRole: 'user' } });
    renderPage();
    fireEvent.click(screen.getByTitle('forum.postDetail.confirmDelete'));
    expect(window.confirm).toHaveBeenCalled();
    expect(deleteMutateAsync).toHaveBeenCalledWith({ id: 2, topicId: 42 });
  });

  it('opens the report-content modal for a reply and submits it', () => {
    reportMutateAsync.mockResolvedValue(undefined);
    setup();
    renderPage();
    fireEvent.click(screen.getByTitle('forum.postDetail.reportMessage'));
    expect(screen.getByText('forum.postDetail.reportTitle')).toBeInTheDocument();
    fireEvent.click(screen.getByText('forum.postDetail.reportSubmit'));
    expect(reportMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ messageId: 2, reason: 'spam' }),
    );
  });

  it('opens the report-member modal and submits it', async () => {
    vi.mocked(userReportApi.create).mockResolvedValue({} as any);
    setup({ user: { idUser: 3, id: 3, userRole: 'user' } });
    renderPage();
    fireEvent.click(screen.getByTitle('Signaler ce membre'));
    expect(screen.getByText('Signaler ce membre', { selector: 'h3' })).toBeInTheDocument();
    fireEvent.click(screen.getByText('Signaler'));
    await vi.waitFor(() =>
      expect(userReportApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ reportedUserId: 1, reason: 'inappropriate' }),
      ),
    );
  });

  it('shows moderation controls to a moderator and locks/pins/deletes the topic', () => {
    setup({ user: { idUser: 99, id: 99, userRole: 'admin' } });
    renderPage();
    fireEvent.click(screen.getByText('forum.postDetail.moderation.lockTopic'));
    expect(lockMutateAsync).toHaveBeenCalled();
    fireEvent.click(screen.getByText('forum.postDetail.moderation.pinTopic'));
    expect(pinMutateAsync).toHaveBeenCalled();
    fireEvent.click(screen.getByText('forum.postDetail.moderation.deleteTopic'));
    expect(window.confirm).toHaveBeenCalled();
    expect(modDeleteTopicMutateAsync).toHaveBeenCalled();
  });

  it('hides moderation controls from a regular user', () => {
    setup({ user: { idUser: 1, id: 1, userRole: 'user' } });
    renderPage();
    expect(screen.queryByText('forum.postDetail.moderation.lockTopic')).not.toBeInTheDocument();
  });

  it('lets a moderator delete someone else\'s reply', () => {
    setup({ user: { idUser: 99, id: 99, userRole: 'admin' } });
    renderPage();
    fireEvent.click(screen.getByTitle('forum.postDetail.moderation.deleteMessage'));
    expect(window.confirm).toHaveBeenCalled();
    expect(modDeleteMessageMutateAsync).toHaveBeenCalledWith({ id: 2, topicId: 42 });
  });

  it('rates a reply from another author', () => {
    setup({ user: { idUser: 1, id: 1, userRole: 'user' } });
    renderPage();
    const group = screen
      .getAllByRole('radiogroup')
      .find((g) => g.getAttribute('aria-label')?.includes('rating.rateAuthor'))!;
    fireEvent.click(within(group).getAllByRole('radio')[2]);
    expect(rateMutate).toHaveBeenCalledWith(expect.objectContaining({ messageId: 2 }));
  });

  describe('suppression du sujet par son auteur', () => {
    // Retour de recette : un doublon publié par erreur ne pouvait qu'être
    // modifié, jamais supprimé — alors que l'API l'autorisait déjà.
    it('propose Supprimer à l’auteur du sujet', () => {
      setup({ user: { idUser: 1, id: 1, userRole: 'user' } });
      renderPage();
      expect(
        screen.getByRole('button', { name: 'forum.postDetail.delete' }),
      ).toBeInTheDocument();
    });

    it('ne le propose pas à quelqu’un d’autre', () => {
      setup({ user: { idUser: 2, id: 2, userRole: 'user' } });
      renderPage();
      expect(
        screen.queryByRole('button', { name: 'forum.postDetail.delete' }),
      ).not.toBeInTheDocument();
    });

    it('supprime puis renvoie au forum après confirmation', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      deleteTopicMutateAsync.mockResolvedValue(undefined);
      setup({ user: { idUser: 1, id: 1, userRole: 'user' } });
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: 'forum.postDetail.delete' }));

      await waitFor(() => expect(deleteTopicMutateAsync).toHaveBeenCalledWith(42));
      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/forum'));
      confirmSpy.mockRestore();
    });

    it('ne supprime rien si la confirmation est annulée', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      setup({ user: { idUser: 1, id: 1, userRole: 'user' } });
      renderPage();

      fireEvent.click(screen.getByRole('button', { name: 'forum.postDetail.delete' }));

      expect(deleteTopicMutateAsync).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });
  });
});
