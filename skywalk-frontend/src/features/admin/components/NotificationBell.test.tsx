import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NotificationBell from './NotificationBell';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('../../../api/notifications', () => ({
  notificationsApi: { listMine: vi.fn(), markAsRead: vi.fn() },
}));

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseMutation = vi.mocked(useMutation);
const mockedUseQueryClient = vi.mocked(useQueryClient);

const mutate = vi.fn();
const invalidateQueries = vi.fn();

function notification(overrides: any = {}) {
  return {
    idNotification: 1,
    notifType: 'info',
    message: 'Bienvenue !',
    isRead: false,
    sentAt: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

function setup(notifications: any[] = []) {
  mockedUseQuery.mockReturnValue({ data: notifications } as any);
  mockedUseMutation.mockReturnValue({ mutate } as any);
  mockedUseQueryClient.mockReturnValue({ invalidateQueries } as any);
}

describe('NotificationBell (admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows no badge when there are no unread notifications', () => {
    setup([notification({ isRead: true })]);
    render(<NotificationBell />);
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('shows the unread count badge', () => {
    setup([notification({ idNotification: 1 }), notification({ idNotification: 2, isRead: true })]);
    render(<NotificationBell />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('caps the badge at "9+"', () => {
    setup(Array.from({ length: 12 }, (_, i) => notification({ idNotification: i })));
    render(<NotificationBell />);
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('does not show the panel before the bell is clicked', () => {
    setup([notification()]);
    render(<NotificationBell />);
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('opens the panel and lists notifications on click', () => {
    setup([notification({ message: 'Nouveau signalement' })]);
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Nouveau signalement')).toBeInTheDocument();
  });

  it('shows an empty state when there are no notifications', () => {
    setup([]);
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Aucune notification.')).toBeInTheDocument();
  });

  it('marks a notification as read', () => {
    setup([notification({ idNotification: 42 })]);
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByTitle('Marquer comme lue'));
    expect(mutate).toHaveBeenCalledWith(42);
  });

  it('does not show a "mark as read" action for an already-read notification', () => {
    setup([notification({ isRead: true })]);
    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByTitle('Marquer comme lue')).not.toBeInTheDocument();
  });

  it('toggles the panel closed on a second click', () => {
    setup([notification()]);
    render(<NotificationBell />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });
});
