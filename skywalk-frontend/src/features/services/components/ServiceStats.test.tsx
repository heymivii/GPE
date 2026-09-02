import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ServiceStats from './ServiceStats';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ServiceStats', () => {
  it('renders the section title', () => {
    render(<ServiceStats stats={[]} color="blue" />);
    expect(screen.getByText('services.guides.keyFigures')).toBeInTheDocument();
  });

  it('renders a card for each stat with its label and value', () => {
    render(
      <ServiceStats
        stats={[
          { label: 'Loyer moyen', value: '1200€' },
          { label: 'Salaire médian', value: '45000€' },
        ]}
        color="blue"
      />,
    );
    expect(screen.getByText('Loyer moyen')).toBeInTheDocument();
    expect(screen.getByText('1200€')).toBeInTheDocument();
    expect(screen.getByText('Salaire médian')).toBeInTheDocument();
    expect(screen.getByText('45000€')).toBeInTheDocument();
  });

  it('renders nothing but the title when stats is empty', () => {
    const { container } = render(<ServiceStats stats={[]} color="blue" />);
    expect(container.querySelectorAll('.grid > div').length).toBe(0);
  });
});
