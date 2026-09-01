import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './MainLayout';

vi.mock('../components/NavBar', () => ({ default: () => <div data-testid="navbar" /> }));
vi.mock('../components/Footer', () => ({ default: () => <div data-testid="footer" /> }));
vi.mock('../components/ScrollToTop', () => ({ default: () => null }));
vi.mock('../components/GuestBanner', () => ({ default: () => <div data-testid="guest-banner" /> }));
vi.mock('../contexts/DestinationContext', () => ({
  DestinationProvider: ({ children }: any) => <div data-testid="destination-provider">{children}</div>,
}));

const authState: { isAuthenticated: boolean } = { isAuthenticated: false };
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => authState,
}));

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/child']}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="child" element={<div data-testid="outlet-content">child page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('MainLayout', () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
  });

  it('renders the navbar, footer and routed outlet content', () => {
    renderLayout();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('outlet-content')).toHaveTextContent('child page');
  });

  it('shows the guest banner when the user is not authenticated', () => {
    renderLayout();
    expect(screen.getByTestId('guest-banner')).toBeInTheDocument();
  });

  it('hides the guest banner when the user is authenticated', () => {
    authState.isAuthenticated = true;
    renderLayout();
    expect(screen.queryByTestId('guest-banner')).not.toBeInTheDocument();
  });

  it('wraps the page in the DestinationProvider', () => {
    renderLayout();
    expect(screen.getByTestId('destination-provider')).toBeInTheDocument();
  });
});
