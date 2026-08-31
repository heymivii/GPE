import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe('Footer', () => {
  it('renders the brand name', () => {
    renderFooter();
    expect(screen.getByText('SkyWalk')).toBeInTheDocument();
  });

  it('links to the services and resources sections', () => {
    renderFooter();
    expect(screen.getByText('footer.findJob').closest('a')).toHaveAttribute('href', '/services/emploi');
    expect(screen.getByText('footer.communityForum').closest('a')).toHaveAttribute('href', '/forum');
  });

  it('shows the contact email and phone', () => {
    renderFooter();
    expect(screen.getByText('contact@skywalk.com').closest('a')).toHaveAttribute(
      'href',
      'mailto:contact@skywalk.com',
    );
    expect(screen.getByText('+33 6 58 28 63 80').closest('a')).toHaveAttribute('href', 'tel:+33658286380');
  });

  it('shows the current year in the copyright line', () => {
    renderFooter();
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });
});
