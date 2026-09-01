import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminRoles from './AdminRoles';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const authState = { user: { idUser: 1 } };
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: authState.user }),
}));

vi.mock('../../../api/user', () => ({
  userApi: { getUsersAdmin: vi.fn(), updateUserRole: vi.fn() },
}));

import toast from 'react-hot-toast';
import { userApi } from '../../../api/user';
const mockedGetUsers = vi.mocked(userApi.getUsersAdmin);
const mockedUpdateRole = vi.mocked(userApi.updateUserRole);

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
  const utils = render(
    <QueryClientProvider client={qc}>
      <AdminRoles />
    </QueryClientProvider>,
  );
  return { ...utils, invalidateSpy };
}

const user = (overrides: any = {}) => ({
  idUser: 2,
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean@x.com',
  roles: 'user',
  createdAt: '2026-01-01T00:00:00Z',
  lastLoginAt: null,
  ...overrides,
});

describe('AdminRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { idUser: 1 };
    mockedUpdateRole.mockResolvedValue({});
  });

  it('shows a loading indicator while fetching users', () => {
    mockedGetUsers.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/Chargement de la liste/)).toBeInTheDocument();
  });

  it('shows an empty state when there are no users', async () => {
    mockedGetUsers.mockResolvedValue({ data: [], total: 0 });
    renderPage();
    expect(await screen.findByText('Aucun utilisateur trouvé.')).toBeInTheDocument();
  });

  it('filters users by name or email (case-insensitive)', async () => {
    mockedGetUsers.mockResolvedValue({
      data: [user({ idUser: 2, firstName: 'Jean', lastName: 'Dupont', email: 'jean@x.com' }),
             user({ idUser: 3, firstName: 'Marie', lastName: 'Curie', email: 'marie@x.com' })],
      total: 2,
    });
    renderPage();
    await screen.findByText('Jean Dupont');

    const u = userEvent.setup();
    await u.type(screen.getByPlaceholderText('Rechercher par nom ou email...'), 'marie');

    expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();
    expect(screen.getByText('Marie Curie')).toBeInTheDocument();
  });

  it('pins "Admin SkyWalk" first, then sorts the rest alphabetically', async () => {
    mockedGetUsers.mockResolvedValue({
      data: [
        user({ idUser: 2, firstName: 'Zoe', lastName: 'Adams' }),
        user({ idUser: 3, firstName: 'Admin', lastName: 'SkyWalk' }),
        user({ idUser: 4, firstName: 'Alice', lastName: 'Brown' }),
      ],
      total: 3,
    });
    renderPage();
    await screen.findByText('Admin SkyWalk');

    const rows = screen.getAllByRole('row').slice(1); // skip header row
    const names = rows.map((r) => r.textContent);
    expect(names[0]).toContain('Admin SkyWalk');
    expect(names[1]).toContain('Alice Brown');
    expect(names[2]).toContain('Zoe Adams');
  });

  it('marks the current user with a "Vous" badge and disables their own role select', async () => {
    mockedGetUsers.mockResolvedValue({ data: [user({ idUser: 1 })], total: 1 });
    renderPage();
    await screen.findByText('Vous');
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('leaves other users\' role select enabled', async () => {
    mockedGetUsers.mockResolvedValue({ data: [user({ idUser: 2 })], total: 1 });
    renderPage();
    await screen.findByText('Jean Dupont');
    expect(screen.getByRole('combobox')).not.toBeDisabled();
  });

  it('updates the role and invalidates the related caches on success', async () => {
    mockedGetUsers.mockResolvedValue({ data: [user({ idUser: 2, roles: 'user' })], total: 1 });
    const { invalidateSpy } = renderPage();
    await screen.findByText('Jean Dupont');

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'admin' } });

    await waitFor(() => expect(mockedUpdateRole).toHaveBeenCalledWith(2, 'admin'));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-users-list'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-stats'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-collaborators'] });
  });

  it('shows the API error message when the role update fails', async () => {
    mockedGetUsers.mockResolvedValue({ data: [user({ idUser: 2 })], total: 1 });
    mockedUpdateRole.mockRejectedValue({ response: { data: { message: 'Not allowed' } } });
    renderPage();
    await screen.findByText('Jean Dupont');

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'admin' } });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Not allowed'));
  });

  it('shows "Jamais connecté" when the user has no last login date', async () => {
    mockedGetUsers.mockResolvedValue({ data: [user({ lastLoginAt: null })], total: 1 });
    renderPage();
    expect(await screen.findByText('Jamais connecté')).toBeInTheDocument();
  });

  it('refetches the user list when "Rafraîchir" is clicked', async () => {
    mockedGetUsers.mockResolvedValue({ data: [user({ idUser: 2 })], total: 1 });
    renderPage();
    await screen.findByText('Jean Dupont');

    mockedGetUsers.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /Rafraîchir/ }));

    await waitFor(() => expect(mockedGetUsers).toHaveBeenCalled());
  });
});
