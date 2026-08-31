import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PopularDestinations from './PopularDestinations';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('PopularDestinations', () => {
  it('renders the three destination cards linked to their country pages', () => {
    render(
      <MemoryRouter>
        <PopularDestinations />
      </MemoryRouter>,
    );
    expect(screen.getByText('popularDestinations.japan.name').closest('a')).toHaveAttribute(
      'href',
      '/destinations/JP',
    );
    expect(screen.getByText('popularDestinations.usa.name').closest('a')).toHaveAttribute(
      'href',
      '/destinations/US',
    );
    expect(screen.getByText('popularDestinations.switzerland.name').closest('a')).toHaveAttribute(
      'href',
      '/destinations/CH',
    );
  });

  it('links "view all" to the destinations index', () => {
    render(
      <MemoryRouter>
        <PopularDestinations />
      </MemoryRouter>,
    );
    expect(screen.getByText('popularDestinations.viewAll').closest('a')).toHaveAttribute(
      'href',
      '/destinations',
    );
  });
});
