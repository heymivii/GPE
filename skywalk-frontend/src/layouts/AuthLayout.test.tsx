import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthLayout from './AuthLayout';

vi.mock('../components/ScrollToTop', () => ({ default: () => null }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/" element={<AuthLayout />}>
          <Route path="login" element={<div data-testid="outlet-content">login form</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AuthLayout', () => {
  it('renders the routed outlet content', () => {
    renderLayout();
    expect(screen.getByTestId('outlet-content')).toHaveTextContent('login form');
  });

  it('shows the tagline and the SkyWalk brand link', () => {
    renderLayout();
    expect(screen.getByText('authPages.tagline')).toBeInTheDocument();
    expect(screen.getByText('SkyWalk')).toBeInTheDocument();
  });

  it('links the logo and brand name back home', () => {
    renderLayout();
    const homeLinks = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === '/');
    expect(homeLinks.length).toBeGreaterThan(0);
  });
});
