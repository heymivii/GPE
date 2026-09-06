import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';

vi.mock('./NotificationBell', () => ({ default: () => <div data-testid="notification-bell" /> }));

const logout = vi.fn().mockResolvedValue(undefined);
const authState: any = { logout, user: { fullName: 'Jane Doe', email: 'jane@example.com' } };
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => authState,
}));

function renderLayout(initialPath = '/admin/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<div data-testid="outlet-content">dashboard content</div>} />
          <Route path="countries" element={<div data-testid="outlet-content">countries content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminLayout', () => {
  it('renders the routed outlet content and the notification bell', () => {
    renderLayout();
    expect(screen.getByTestId('outlet-content')).toHaveTextContent('dashboard content');
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
  });

  it('shows the logged-in admin name and email', () => {
    renderLayout();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('highlights the nav link matching the current route', () => {
    renderLayout('/admin/countries');
    const link = screen.getByText('Gestion Pays').closest('a');
    expect(link).toHaveClass('bg-brand-ink');
  });

  it('does not highlight a non-matching nav link', () => {
    renderLayout('/admin/countries');
    const link = screen.getByText('Gestion des Rôles').closest('a');
    expect(link).not.toHaveClass('bg-brand-ink');
  });

  it('toggles the mobile menu open and closed', () => {
    const { container } = renderLayout();
    const menuButton = container.querySelector('.md\\:hidden button') as HTMLElement;
    expect(container.querySelector('.lucide-menu')).not.toBeNull();
    fireEvent.click(menuButton);
    expect(container.querySelector('.lucide-x')).not.toBeNull();
    fireEvent.click(menuButton);
    expect(container.querySelector('.lucide-menu')).not.toBeNull();
  });

  it('logs out and navigates home when "Déconnexion" is clicked', async () => {
    renderLayout();
    fireEvent.click(screen.getByText('Déconnexion'));
    await vi.waitFor(() => expect(logout).toHaveBeenCalled());
  });
});
