import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HowItWorks from './HowItWorks';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

describe('HowItWorks', () => {
  it('renders the three steps in order', () => {
    render(<HowItWorks />);
    expect(screen.getByText('landing.howItWorks.steps.choose.title')).toBeInTheDocument();
    expect(screen.getByText('landing.howItWorks.steps.compare.title')).toBeInTheDocument();
    expect(screen.getByText('landing.howItWorks.steps.go.title')).toBeInTheDocument();
  });

  it('numbers each step', () => {
    render(<HowItWorks />);
    expect(screen.getByText(/"number":1/)).toBeInTheDocument();
    expect(screen.getByText(/"number":3/)).toBeInTheDocument();
  });
});
