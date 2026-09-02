import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OfficialSources from './OfficialSources';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('OfficialSources', () => {
  it('lists the example official sources', () => {
    render(<OfficialSources />);
    expect(screen.getByText('service-public.fr')).toBeInTheDocument();
    expect(screen.getByText('canada.ca')).toBeInTheDocument();
    expect(screen.getByText('gov.uk')).toBeInTheDocument();
  });

  it('renders the title and description', () => {
    render(<OfficialSources />);
    expect(screen.getByText('landing.officialSources.title')).toBeInTheDocument();
  });
});
