import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingToolsSection from './LandingToolsSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('LandingToolsSection', () => {
  it('renders a card per tool category linked to its service page', () => {
    render(
      <MemoryRouter>
        <LandingToolsSection />
      </MemoryRouter>,
    );
    expect(screen.getByText('landing.tools.categories.emploi').closest('a')).toHaveAttribute(
      'href',
      '/services/emploi',
    );
    expect(screen.getByText('landing.tools.categories.logement').closest('a')).toHaveAttribute(
      'href',
      '/services/logement',
    );
    expect(screen.getByText('landing.tools.categories.transport').closest('a')).toHaveAttribute(
      'href',
      '/services/transport',
    );
    expect(screen.getByText('landing.tools.categories.sante').closest('a')).toHaveAttribute(
      'href',
      '/services/sante',
    );
  });
});
