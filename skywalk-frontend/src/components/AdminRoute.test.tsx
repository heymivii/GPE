import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminRoute from './AdminRoute';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../hooks/useAuth';
const mockedUseAuth = vi.mocked(useAuth);

const baseAuth = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
};

function renderAdminRoute() {
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>Admin Zone</div>} />
        </Route>
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminRoute', () => {
  it('shows a spinner instead of the outlet while auth is loading', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth,
      isLoading: true,
      isAuthenticated: false,
      user: null,
    } as any);

    renderAdminRoute();
    expect(screen.queryByText('Admin Zone')).not.toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('redirects to /dashboard when not authenticated', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth,
      isLoading: false,
      isAuthenticated: false,
      user: null,
    } as any);

    renderAdminRoute();
    expect(screen.queryByText('Admin Zone')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('redirects to /dashboard when authenticated but not an admin', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth,
      isLoading: false,
      isAuthenticated: true,
      user: { idUser: 1, role: 'user' },
    } as any);

    renderAdminRoute();
    expect(screen.queryByText('Admin Zone')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders the outlet for an admin user (role field)', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth,
      isLoading: false,
      isAuthenticated: true,
      user: { idUser: 1, role: 'admin' },
    } as any);

    renderAdminRoute();
    expect(screen.getByText('Admin Zone')).toBeInTheDocument();
  });

  it('accepts the "roles" field as an alternative to "role"', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth,
      isLoading: false,
      isAuthenticated: true,
      user: { idUser: 1, roles: 'admin' },
    } as any);

    renderAdminRoute();
    expect(screen.getByText('Admin Zone')).toBeInTheDocument();
  });

  it('accepts the "userRole" field as another alternative', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth,
      isLoading: false,
      isAuthenticated: true,
      user: { idUser: 1, userRole: 'admin' },
    } as any);

    renderAdminRoute();
    expect(screen.getByText('Admin Zone')).toBeInTheDocument();
  });

  it('is case-insensitive on the role value', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth,
      isLoading: false,
      isAuthenticated: true,
      user: { idUser: 1, role: 'ADMIN' },
    } as any);

    renderAdminRoute();
    expect(screen.getByText('Admin Zone')).toBeInTheDocument();
  });
});
