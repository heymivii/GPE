import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NotificationBell from './NotificationBell';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, opts?: any) => opts?.defaultValue ?? key, i18n: { language: 'fr' } }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

vi.mock('../../api/notifications', () => ({
  notificationsApi: { listMine: vi.fn(), markAsRead: vi.fn(), markAllAsRead: vi.fn() },
}));

vi.mock('../../api/buddy-contact', () => ({
  buddyContactApi: { getMyRequests: vi.fn(), respond: vi.fn() },
}));

vi.mock('../../hooks/usePrivateMessages', () => ({
  pmKeys: { conversations: () => ['private-messages', 'conversations'] },
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { idUser: 1 } }),
}));

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseMutation = vi.mocked(useMutation);
const mockedUseQueryClient = vi.mocked(useQueryClient);

const invalidateQueries = vi.fn();
const markReadMutate = vi.fn();
const markAllMutate = vi.fn();
const respondMutate = vi.fn();

function notification(overrides: any = {}) {
  return {
    idNotification: 1,
    notifType: 'info',
    message: 'Bienvenue !',
    isRead: false,
    sentAt: '2026-01-15T10:00:00Z',
    contextType: null,
    contextId: null,
    ...overrides,
  };
}

function contactRequest(overrides: any = {}) {
  return {
    id: 6,
    status: 'pending',
    createdAt: '2026-01-15T10:00:00Z',
    sender: { firstName: 'Jane', idUser: 2 },
    recipient: { idUser: 1 },
    procedure: { procedureType: 'Visa long séjour' },
    ...overrides,
  };
}

function setup(notifications: any[] = [], contactRequests: any[] = []) {
  mockedUseQuery.mockImplementation(((options: any) => {
    const key = options.queryKey?.[0];
    if (key === 'buddy-contact-requests') return { data: contactRequests } as any;
    return { data: notifications } as any;
  }) as any);
  mockedUseQueryClient.mockReturnValue({ invalidateQueries } as any);
  mockedUseMutation.mockImplementation(((config: any) => {
    const fnText = config.mutationFn?.toString() || '';
    if (fnText.includes('markAllAsRead')) return { mutate: markAllMutate, isPending: false };
    if (fnText.includes('respond')) return { mutate: respondMutate, isPending: false };
    return { mutate: markReadMutate, isPending: false };
  }) as any);
}

function renderBell() {
  return render(
    <MemoryRouter>
      <NotificationBell />
    </MemoryRouter>,
  );
}

describe('NotificationBell (user)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the unread badge', () => {
    setup([notification()]);
    renderBell();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows an empty state', () => {
    setup([]);
    renderBell();
    fireEvent.click(screen.getByRole('button', { name: /unread notification/ }));
    expect(screen.getByText('No notifications.')).toBeInTheDocument();
  });

  it('marks a single notification as read via its button when not clickable', () => {
    setup([notification()]);
    renderBell();
    fireEvent.click(screen.getByRole('button', { name: /unread notification/ }));
    fireEvent.click(screen.getByTitle('Mark as read'));
    expect(markReadMutate).toHaveBeenCalledWith(1);
  });

  it('marks all as read', () => {
    setup([notification()]);
    renderBell();
    fireEvent.click(screen.getByRole('button', { name: /unread notification/ }));
    fireEvent.click(screen.getByText('Mark all read'));
    expect(markAllMutate).toHaveBeenCalled();
  });

  it('navigates to the linked project checklist and marks the notification read on click', () => {
    setup([notification({ contextType: 'project', contextId: 7 })]);
    renderBell();
    fireEvent.click(screen.getByRole('button', { name: /unread notification/ }));
    fireEvent.click(screen.getByText('Bienvenue !'));
    expect(markReadMutate).toHaveBeenCalledWith(1);
    expect(navigate).toHaveBeenCalledWith('/projects/7/checklist');
  });

  it('navigates to a followed forum topic', () => {
    setup([notification({ contextType: 'forum-topic', contextId: 42, isRead: true })]);
    renderBell();
    fireEvent.click(screen.getByRole('button', { name: /unread notification/ }));
    fireEvent.click(screen.getByText('Bienvenue !'));
    expect(navigate).toHaveBeenCalledWith('/forum/post/42');
  });

  it('does not navigate for a non-actionable notification', () => {
    setup([notification()]);
    renderBell();
    fireEvent.click(screen.getByRole('button', { name: /unread notification/ }));
    fireEvent.click(screen.getByText('Bienvenue !'));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('navigates to the private conversation for an accepted buddy request', () => {
    setup([notification({ contextType: 'user', contextId: 6, message: 'Demande acceptee !' })]);
    renderBell();
    fireEvent.click(screen.getByRole('button', { name: /unread notification/ }));
    fireEvent.click(screen.getByText('Demande acceptee !'));
    expect(navigate).toHaveBeenCalledWith('/messages?to=6');
  });

  it('carries the contact name along so the conversation header does not fall back to a generic label', () => {
    setup([
      notification({ contextType: 'user', contextId: 6, contextLabel: 'Jane', message: 'Demande acceptee !' }),
    ]);
    renderBell();
    fireEvent.click(screen.getByRole('button', { name: /unread notification/ }));
    fireEvent.click(screen.getByText('Demande acceptee !'));
    expect(navigate).toHaveBeenCalledWith('/messages?to=6&name=Jane');
  });

  it('excludes the raw buddy-request notification from the regular list to avoid duplicating the actionable card', () => {
    setup([notification({ contextType: 'buddy-request', contextId: 6, message: 'Jane souhaite vous contacter' })]);
    renderBell();
    fireEvent.click(screen.getByRole('button', { name: /unread notification/ }));
    expect(screen.queryByText('Jane souhaite vous contacter')).not.toBeInTheDocument();
    expect(screen.getByText('No notifications.')).toBeInTheDocument();
  });

  it('folds pending buddy contact requests into the unread badge count', () => {
    setup([notification()], [contactRequest()]);
    renderBell();
    expect(screen.getByText('2')).toBeInTheDocument(); // 1 unread notification + 1 pending request
  });

  it('accepts a pending buddy contact request', () => {
    setup([], [contactRequest()]);
    renderBell();
    fireEvent.click(screen.getByRole('button', { name: /unread notification/ }));
    expect(screen.getByText(/souhaite vous contacter/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Accepter'));
    expect(respondMutate).toHaveBeenCalledWith({ id: 6, accept: true });
  });

  it('declines a pending buddy contact request', () => {
    setup([], [contactRequest()]);
    renderBell();
    fireEvent.click(screen.getByRole('button', { name: /unread notification/ }));
    fireEvent.click(screen.getByText('Décliner'));
    expect(respondMutate).toHaveBeenCalledWith({ id: 6, accept: false });
  });

  it('ignores requests addressed to someone else', () => {
    setup([], [contactRequest({ recipient: { idUser: 999 } })]);
    renderBell();
    fireEvent.click(screen.getByRole('button', { name: /unread notification/ }));
    expect(screen.queryByText(/souhaite vous contacter/)).not.toBeInTheDocument();
  });

  it('ignores requests that are no longer pending', () => {
    setup([], [contactRequest({ status: 'accepted' })]);
    renderBell();
    fireEvent.click(screen.getByRole('button', { name: /unread notification/ }));
    expect(screen.queryByText(/souhaite vous contacter/)).not.toBeInTheDocument();
  });
});
