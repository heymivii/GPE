import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CategoryGrid from './CategoryGrid';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('CategoryGrid', () => {
  it('renders a card for every category', () => {
    render(
      <MemoryRouter>
        <CategoryGrid />
      </MemoryRouter>,
    );
    expect(screen.getByText('categoryGrid.emploi.title')).toBeInTheDocument();
    expect(screen.getByText('categoryGrid.logement.title')).toBeInTheDocument();
    expect(screen.getByText('categoryGrid.transport.title')).toBeInTheDocument();
    expect(screen.getByText('categoryGrid.sante.title')).toBeInTheDocument();
    expect(screen.getByText('categoryGrid.demarches.title')).toBeInTheDocument();
  });

  it('links each card to the right service page', () => {
    render(
      <MemoryRouter>
        <CategoryGrid />
      </MemoryRouter>,
    );
    expect(screen.getByText('categoryGrid.emploi.cta').closest('a')).toHaveAttribute(
      'href',
      '/services/emploi',
    );
  });
});
