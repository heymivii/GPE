import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavBar from './NavBar';
import { useAuth } from '../hooks/useAuth';
import { useUnreadMessages } from '../hooks/usePrivateMessages';

const changeLanguage = vi.fn();
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => opts?.defaultValue ?? key,
    i18n: { language: 'fr', changeLanguage },
  }),
}));

vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../hooks/usePrivateMessages', () => ({ useUnreadMessages: vi.fn() }));

vi.mock('./GlobalSearchModal', () => ({ default: (p: any) => (p.isOpen ? <div data-testid="global-search-modal" /> : null) }));
vi.mock('./CurrencySelector', () => ({ default: () => <div data-testid="currency-selector" /> }));
vi.mock('./ProjectSwitcher', () => ({ default: () => <div data-testid="project-switcher" /> }));
vi.mock('../features/notifications/NotificationBell', () => ({ default: () => <div data-testid="notification-bell" /> }));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseUnreadMessages = vi.mocked(useUnreadMessages);

const logout = vi.fn().mockResolvedValue(undefined);

function setup({
  isAuthenticated = false,
  user = null as any,
  unreadCount = 0,
}: any = {}) {
  mockedUseAuth.mockReturnValue({ user, isAuthenticated, logout } as any);
  mockedUseUnreadMessages.mockReturnValue({ data: { count: unreadCount } } as any);
}

function renderNav(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <NavBar />
    </MemoryRouter>,
  );
}

describe('NavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows public nav links and login/register when logged out', () => {
    setup();
    renderNav();
    expect(screen.getByText('nav.login')).toBeInTheDocument();
    expect(screen.getByText('nav.register')).toBeInTheDocument();
    expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument();
  });

  it('shows the profile menu and project switcher when logged in', () => {
    setup({ isAuthenticated: true, user: { fullName: 'Alice Martin', email: 'alice@example.com', role: 'user' } });
    renderNav();
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    expect(screen.getByTestId('project-switcher')).toBeInTheDocument();
  });

  it('opens the user menu and logs out', async () => {
    setup({ isAuthenticated: true, user: { fullName: 'Alice Martin', email: 'alice@example.com', role: 'user' } });
    renderNav();
    // La pastille n'affiche que les initiales ; le nom est son libellé accessible.
    fireEvent.click(screen.getByRole('button', { name: 'Alice Martin' }));
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    fireEvent.click(screen.getByText('nav.logout'));
    await vi.waitFor(() => expect(logout).toHaveBeenCalled());
  });

  it('shows the admin link only for an admin user', () => {
    setup({ isAuthenticated: true, user: { fullName: 'Admin', role: 'admin' } });
    renderNav();
    fireEvent.click(screen.getByRole('button', { name: 'Admin' }));
    expect(screen.getByText('Administration')).toBeInTheDocument();
  });

  it('hides the admin link for a regular user', () => {
    setup({ isAuthenticated: true, user: { fullName: 'Bob', role: 'user' } });
    renderNav();
    fireEvent.click(screen.getByRole('button', { name: 'Bob' }));
    expect(screen.queryByText('Administration')).not.toBeInTheDocument();
  });

  it('shows the unread messages badge', () => {
    setup({ isAuthenticated: true, user: { fullName: 'Alice', role: 'user' }, unreadCount: 3 });
    renderNav();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('caps the unread messages badge at "9+"', () => {
    setup({ isAuthenticated: true, user: { fullName: 'Alice', role: 'user' }, unreadCount: 15 });
    renderNav();
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('opens the explore dropdown for a logged-in user', () => {
    setup({ isAuthenticated: true, user: { fullName: 'Alice', role: 'user' } });
    renderNav();
    fireEvent.click(screen.getByText('nav.explore'));
    expect(screen.getByText('nav.search')).toBeInTheDocument();
  });

  it('switches the language', () => {
    setup();
    renderNav();
    fireEvent.click(screen.getByText('Français').closest('button')!);
    fireEvent.click(screen.getByText('English'));
    expect(changeLanguage).toHaveBeenCalledWith('en');
  });

  it('opens the global search modal via the search button', () => {
    // La recherche globale est réservée aux connectés (retour de recette).
    setup({ isAuthenticated: true, user: { firstName: 'A' } });
    renderNav();
    fireEvent.click(screen.getByText('globalSearch.trigger'));
    expect(screen.getByTestId('global-search-modal')).toBeInTheDocument();
  });

  it('opens the global search modal with Cmd+K', () => {
    setup();
    renderNav();
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByTestId('global-search-modal')).toBeInTheDocument();
  });

  it('toggles the mobile menu', () => {
    setup();
    const { container } = renderNav();
    const toggle = screen.getByLabelText('Menu');
    fireEvent.click(toggle);
    expect(container.querySelectorAll('a').length).toBeGreaterThan(0);
  });

  it('highlights the active nav link', () => {
    setup();
    renderNav('/destinations');
    expect(screen.getByText('nav.destinations')).toHaveClass('text-brand-ink');
  });
});
