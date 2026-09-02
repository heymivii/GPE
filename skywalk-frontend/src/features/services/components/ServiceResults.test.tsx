import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ServiceResults from './ServiceResults';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) =>
      opts && typeof opts === 'object' ? `${key}:${JSON.stringify(opts)}` : key,
  }),
}));

function renderResults(category: string, title = 'Logement') {
  return render(
    <MemoryRouter>
      <ServiceResults category={category} title={title} />
    </MemoryRouter>,
  );
}

describe('ServiceResults', () => {
  it('shows the exploration CTA and search link for the emploi category', () => {
    renderResults('emploi', 'Emploi');
    expect(screen.getByText('services.serviceResults.exploreResults')).toBeInTheDocument();
    const link = screen.getByText('services.serviceResults.goToSearch').closest('a');
    expect(link).toHaveAttribute('href', '/search?category=emploi');
  });

  it('renders the "recent" and "popular" quick links for the emploi category', () => {
    renderResults('emploi', 'Emploi');
    expect(screen.getByText('services.serviceResults.viewRecent').closest('a')).toHaveAttribute(
      'href',
      '/search?category=emploi&sort=recent',
    );
    expect(screen.getByText('services.serviceResults.viewPopular').closest('a')).toHaveAttribute(
      'href',
      '/search?category=emploi&sort=popular',
    );
  });

  it('shows a disabled coming-soon state for a non-emploi category', () => {
    renderResults('logement', 'Logement');
    expect(screen.getByText('services.serviceResults.comingSoon.title')).toBeInTheDocument();
    const button = screen.getByText('services.serviceResults.comingSoon.button').closest('button');
    expect(button).toBeDisabled();
  });

  it('does not render the recent/popular quick links outside the emploi category', () => {
    renderResults('logement', 'Logement');
    expect(screen.queryByText('services.serviceResults.viewRecent')).not.toBeInTheDocument();
  });

  it('shows the title in the section heading', () => {
    renderResults('emploi', 'Emploi');
    expect(screen.getByText(/services\.serviceResults\.searchIn/)).toBeInTheDocument();
  });
});
