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

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseMutation = vi.mocked(useMutation);
const mockedUseQueryClient = vi.mocked(useQueryClient);

const invalidateQueries = vi.fn();
const markReadMutate = vi.fn();
const markAllMutate = vi.fn();

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

function setup(notifications: any[] = []) {
  mockedUseQuery.mockReturnValue({ data: notifications } as any);
  mockedUseQueryClient.mockReturnValue({ invalidateQueries } as any);
  mockedUseMutation.mockImplementation(((config: any) => {
    const fnText = config.mutationFn?.toString() || '';
    if (fnText.includes('markAllAsRead')) return { mutate: markAllMutate, isPending: false };
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
});
