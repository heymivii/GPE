import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComparisonRowScore, ScoreBadge } from './ComparisonRowScore';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, opts?: any) => opts?.defaultValue ?? key }),
}));

const countries = [
  { isoCode: 'FR', countryName: 'France', flagEmoji: '🇫🇷', flagUrl: null },
  { isoCode: 'US', countryName: 'United States', flagEmoji: '🇺🇸', flagUrl: null },
] as any;

describe('ScoreBadge', () => {
  it('colors a high score green', () => {
    render(<ScoreBadge score="9/10" />);
    expect(screen.getByText('9/10')).toHaveClass('text-emerald-600');
  });

  it('colors a mid score amber', () => {
    render(<ScoreBadge score="6/10" />);
    expect(screen.getByText('6/10')).toHaveClass('text-amber-600');
  });

  it('colors a low score red', () => {
    render(<ScoreBadge score="3/10" />);
    expect(screen.getByText('3/10')).toHaveClass('text-red-500');
  });
});

describe('ComparisonRowScore', () => {
  it('renders the row label', () => {
    render(<ComparisonRowScore label="Sécurité" values={['8/10', undefined]} colClass="sm:grid-cols-2" countries={countries} />);
    expect(screen.getByText('Sécurité')).toBeInTheDocument();
  });

  it('renders a score badge for each country that has a value', () => {
    render(<ComparisonRowScore label="Sécurité" values={['8/10', '5/10']} colClass="sm:grid-cols-2" countries={countries} />);
    expect(screen.getByText('8/10')).toBeInTheDocument();
    expect(screen.getByText('5/10')).toBeInTheDocument();
  });

  it('shows a not-specified placeholder for a missing value', () => {
    render(<ComparisonRowScore label="Sécurité" values={[undefined, '5/10']} colClass="sm:grid-cols-2" countries={countries} />);
    expect(screen.getByText('comparison.fields.notSpecified')).toBeInTheDocument();
  });

  it('shows the translated country name on mobile', () => {
    render(<ComparisonRowScore label="Sécurité" values={['8/10', undefined]} colClass="sm:grid-cols-2" countries={countries} />);
    expect(screen.getByText('France')).toBeInTheDocument();
  });
});
