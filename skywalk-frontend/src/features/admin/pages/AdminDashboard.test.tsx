import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdminDashboard from './AdminDashboard';
import {
  useForumTopic,
  useLockTopic,
  usePinTopic,
  useModeratorDeleteTopic,
  useModeratorDeleteMessage,
  useCreateForumMessage,
} from '../../../hooks/useForum';
import { useAuth } from '../../../hooks/useAuth';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({ useAuth: vi.fn() }));

vi.mock('../../../hooks/useForum', () => ({
  useForumTopic: vi.fn(),
  useLockTopic: vi.fn(),
  usePinTopic: vi.fn(),
  useModeratorDeleteTopic: vi.fn(),
  useModeratorDeleteMessage: vi.fn(),
  useCreateForumMessage: vi.fn(),
}));

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseQueryClient = vi.mocked(useQueryClient);
const mockedUseAuth = vi.mocked(useAuth);
const mockedUseForumTopic = vi.mocked(useForumTopic);
const mockedUseLockTopic = vi.mocked(useLockTopic);
const mockedUsePinTopic = vi.mocked(usePinTopic);
const mockedUseModeratorDeleteTopic = vi.mocked(useModeratorDeleteTopic);
const mockedUseModeratorDeleteMessage = vi.mocked(useModeratorDeleteMessage);
const mockedUseCreateForumMessage = vi.mocked(useCreateForumMessage);

const invalidateQueries = vi.fn();
const refetch = vi.fn();
const refetchLogs = vi.fn();

const stats = {
  counts: { users: 120, projects: 34, topics: 12, messages: 58, countries: 4, cities: 10, newUsersThisWeek: 5 },
  distribution: {
    projects: [{ status: 'active', count: '10' }],
    users: [],
    destinations: [{ country: 'France', isoCode: 'FR', count: '20' }, { country: 'Canada', isoCode: 'CA', count: '14' }],
    travelTypes: [{ travelType: 'alone', count: '25' }, { travelType: 'couple', count: '9' }],
  },
  recentActivity: {
    topics: [
      {
        idForumTopic: 1,
        title: 'Bienvenue au Canada',
        createdAt: '2026-01-01T00:00:00Z',
        user: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com' },
        country: { countryName: 'Canada' },
      },
    ],
    projects: [
      {
        idProject: 1,
        objective: 'work',
        status: 'planning',
        expectedDepartureDate: '2026-06-01T00:00:00Z',
        user: { firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' },
        destinationCountry: { countryName: 'France', isoCode: 'FR' },
        travelType: 'alone',
      },
    ],
  },
  timestamp: '2026-01-01T00:00:00Z',
};

function setup({
  isLoading = false,
  error = null,
  logs = [],
  logsLoading = false,
  admins = [{ idUser: 1, firstName: 'Admin', lastName: 'One', email: 'admin1@example.com', lastLoginAt: null }],
  adminsLoading = false,
}: any = {}) {
  mockedUseQuery.mockImplementation((opts: any) => {
    const key = opts.queryKey[0];
    if (key === 'admin-logs') return { data: logs, isLoading: logsLoading, refetch: refetchLogs } as any;
    if (key === 'admin-collaborators') return { data: admins, isLoading: adminsLoading } as any;
    if (key === 'admin-stats') return { data: stats, isLoading, error, refetch, isRefetching: false } as any;
    return { data: undefined } as any;
  });
  mockedUseQueryClient.mockReturnValue({ invalidateQueries } as any);
  mockedUseAuth.mockReturnValue({ user: { idUser: 1, firstName: 'Admin', fullName: 'Admin One' } } as any);
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading spinner while stats are loading', () => {
    setup({ isLoading: true });
    const { container } = render(<AdminDashboard />);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('shows an error state with a retry button', () => {
    setup({ error: new Error('boom') });
    render(<AdminDashboard />);
    expect(screen.getByText('Impossible de charger les données.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Réessayer'));
    expect(refetch).toHaveBeenCalled();
  });

  it('renders the KPI cards from stats', () => {
    setup();
    render(<AdminDashboard />);
    expect(screen.getByText('Membres inscrits')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('lists the most recent projects with author and destination', () => {
    setup();
    render(<AdminDashboard />);
    expect(screen.getByText('Alice Martin')).toBeInTheDocument();
    expect(screen.getAllByText('France').length).toBeGreaterThan(0);
  });

  it('lists recent forum activity', () => {
    setup();
    render(<AdminDashboard />);
    expect(screen.getByText('Bienvenue au Canada')).toBeInTheDocument();
  });

  it('opens the topic moderation modal when a forum activity row is clicked', () => {
    mockedUseForumTopic.mockReturnValue({ data: undefined, isLoading: true, error: null } as any);
    mockedUseLockTopic.mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    mockedUsePinTopic.mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    mockedUseModeratorDeleteTopic.mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    mockedUseModeratorDeleteMessage.mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    mockedUseCreateForumMessage.mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    setup();
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('Bienvenue au Canada'));
    expect(screen.getByText('Chargement du sujet...')).toBeInTheDocument();
  });

  it('switches to the history tab and lists administrators', () => {
    setup({ admins: [{ idUser: 2, firstName: 'Bob', lastName: 'Admin', email: 'bob@example.com', lastLoginAt: '2026-01-05T10:00:00Z' }] });
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('Historique des modifications'));
    expect(screen.getByText('Bob Admin')).toBeInTheDocument();
  });

  it('shows an empty state when there are no administrators', () => {
    setup({ admins: [] });
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('Historique des modifications'));
    expect(screen.getByText('Aucun administrateur trouvé.')).toBeInTheDocument();
  });

  it('opens the activity drawer for a specific administrator and filters logs', () => {
    setup({
      admins: [{ idUser: 2, firstName: 'Bob', lastName: 'Admin', email: 'bob@example.com', lastLoginAt: null }],
      logs: [
        { idAdminLog: 1, userId: 2, action: 'CREATE', entityType: 'Country', entityId: 5, details: 'Ajout de la France', createdAt: '2026-01-01T00:00:00Z', user: { firstName: 'Bob', lastName: 'Admin', email: 'bob@example.com' } },
        { idAdminLog: 2, userId: 3, action: 'DELETE', entityType: 'City', entityId: 9, details: null, createdAt: '2026-01-02T00:00:00Z', user: null },
      ],
    });
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('Historique des modifications'));
    fireEvent.click(screen.getByText('Voir les modifications'));
    expect(screen.getByText('Ajout de la France')).toBeInTheDocument();
    expect(screen.queryByText('Modification de Ville (ID: 9)')).not.toBeInTheDocument();
  });

  it('opens the global activity drawer showing every log', () => {
    setup({
      logs: [
        { idAdminLog: 1, userId: 2, action: 'UPDATE', entityType: 'Resource', entityId: 3, details: null, createdAt: '2026-01-01T00:00:00Z', user: { firstName: 'Bob', lastName: 'Admin', email: 'bob@example.com' } },
      ],
    });
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('Historique des modifications'));
    fireEvent.click(screen.getByText("Voir l'historique global"));
    expect(screen.getByText('Historique global des modifications')).toBeInTheDocument();
  });

  it('closes the activity drawer', () => {
    setup({ logs: [] });
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('Historique des modifications'));
    fireEvent.click(screen.getByText("Voir l'historique global"));
    fireEvent.click(screen.getByText('Fermer'));
    expect(screen.queryByText('Historique global des modifications')).not.toBeInTheDocument();
  });

  it('refreshes stats or logs depending on the active tab', () => {
    setup();
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('Rafraîchir'));
    expect(refetch).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Historique des modifications'));
    fireEvent.click(screen.getByText('Rafraîchir'));
    expect(refetchLogs).toHaveBeenCalled();
  });
});

describe('AdminDashboard > TopicModerationModal', () => {
  const lockMutate = vi.fn();
  const pinMutate = vi.fn();
  const deleteTopicMutate = vi.fn();
  const deleteMessageMutate = vi.fn();
  const createMessageMutate = vi.fn();

  const topic = {
    idForumTopic: 1,
    title: 'Bienvenue au Canada',
    content: 'Contenu du sujet',
    category: 'general',
    created_at: '2026-01-01T00:00:00Z',
    is_pinned: false,
    is_locked: false,
    user: { fullName: 'Jean Dupont' },
    messages: [
      { message_id: 1, content: 'Un message', sent_at: '2026-01-01T01:00:00Z', user: { fullName: 'Bob', roles: 'user' } },
    ],
  };

  function setupModal(topicOverrides: any = {}) {
    mockedUseQuery.mockImplementation((opts: any) => {
      if (opts.queryKey[0] === 'admin-stats') return { data: stats, isLoading: false, error: null, refetch, isRefetching: false } as any;
      if (opts.queryKey[0] === 'admin-logs') return { data: [], isLoading: false, refetch: refetchLogs } as any;
      if (opts.queryKey[0] === 'admin-collaborators') return { data: [], isLoading: false } as any;
      return { data: undefined } as any;
    });
    mockedUseQueryClient.mockReturnValue({ invalidateQueries } as any);
    mockedUseAuth.mockReturnValue({ user: { idUser: 9, fullName: 'Admin' } } as any);
    mockedUseForumTopic.mockReturnValue({ data: { ...topic, ...topicOverrides }, isLoading: false, error: null } as any);
    mockedUseLockTopic.mockReturnValue({ mutate: lockMutate, isPending: false } as any);
    mockedUsePinTopic.mockReturnValue({ mutate: pinMutate, isPending: false } as any);
    mockedUseModeratorDeleteTopic.mockReturnValue({ mutate: deleteTopicMutate, isPending: false } as any);
    mockedUseModeratorDeleteMessage.mockReturnValue({ mutate: deleteMessageMutate, isPending: false } as any);
    mockedUseCreateForumMessage.mockReturnValue({ mutate: createMessageMutate, isPending: false } as any);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  function openModal() {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('Bienvenue au Canada'));
  }

  it('renders the topic content and its messages', () => {
    setupModal();
    openModal();
    expect(screen.getByText('Contenu du sujet')).toBeInTheDocument();
    expect(screen.getByText('Un message')).toBeInTheDocument();
  });

  it('pins and unpins a topic', () => {
    setupModal();
    openModal();
    fireEvent.click(screen.getByText('Épingler'));
    expect(pinMutate).toHaveBeenCalledWith(1, expect.objectContaining({ onSuccess: expect.any(Function) }));
  });

  it('locks a topic', () => {
    setupModal();
    openModal();
    fireEvent.click(screen.getByText('Verrouiller'));
    expect(lockMutate).toHaveBeenCalledWith(1, expect.objectContaining({ onSuccess: expect.any(Function) }));
  });

  it('deletes a topic after confirmation', () => {
    setupModal();
    openModal();
    fireEvent.click(screen.getByText('Supprimer le sujet'));
    expect(window.confirm).toHaveBeenCalled();
    expect(deleteTopicMutate).toHaveBeenCalledWith(1, expect.objectContaining({ onSuccess: expect.any(Function) }));
  });

  it('deletes a message after confirmation', () => {
    setupModal();
    openModal();
    fireEvent.click(screen.getByTitle('Supprimer le message'));
    expect(deleteMessageMutate).toHaveBeenCalledWith(
      { id: 1, topicId: 1 },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('posts a reply as admin', () => {
    setupModal();
    openModal();
    fireEvent.change(screen.getByPlaceholderText("Saisissez votre réponse en tant qu'administrateur..."), {
      target: { value: 'Réponse admin' },
    });
    fireEvent.click(screen.getByText('Répondre'));
    expect(createMessageMutate).toHaveBeenCalledWith(
      { content: 'Réponse admin', topicId: 1 },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('does not submit an empty reply', () => {
    setupModal();
    openModal();
    fireEvent.click(screen.getByText('Répondre'));
    expect(createMessageMutate).not.toHaveBeenCalled();
  });

  it('shows locked/pinned badges and offers to unlock/unpin', () => {
    setupModal({ is_locked: true, is_pinned: true });
    openModal();
    expect(screen.getByText('Verrouillé')).toBeInTheDocument();
    expect(screen.getByText('Épinglé')).toBeInTheDocument();
    expect(screen.getByText('Déverrouiller')).toBeInTheDocument();
    expect(screen.getByText('Désépingler')).toBeInTheDocument();
  });
});
