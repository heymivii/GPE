import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ObjectiveStep from './ObjectiveStep';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

describe('ObjectiveStep', () => {
  it('renders goal toggles and a stay-duration select', () => {
    render(<ObjectiveStep onNext={vi.fn()} />);
    expect(screen.getByRole('radio', { name: 'onboarding.constants.goals.work' })).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('disables Next until both goal and stayDuration are set', () => {
    render(<ObjectiveStep onNext={vi.fn()} />);
    expect(screen.getByText('onboarding.nav.next')).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: 'onboarding.constants.goals.work' }));
    expect(screen.getByText('onboarding.nav.next')).toBeDisabled(); // still missing stayDuration

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1_3_years' } });
    expect(screen.getByText('onboarding.nav.next')).not.toBeDisabled();
  });

  it('calls onNext with the selected goal and duration', () => {
    const onNext = vi.fn();
    render(<ObjectiveStep onNext={onNext} />);
    fireEvent.click(screen.getByRole('radio', { name: 'onboarding.constants.goals.studies' }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'less_6_months' } });
    fireEvent.click(screen.getByText('onboarding.nav.next'));
    expect(onNext).toHaveBeenCalledWith({ goal: 'studies', stayDuration: 'less_6_months' });
  });

  it('pre-fills the form from initial data', () => {
    render(<ObjectiveStep onNext={vi.fn()} data={{ goal: 'family', stayDuration: 'more_3_years' }} />);
    expect(screen.getByRole('radio', { name: 'onboarding.constants.goals.family' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('combobox')).toHaveValue('more_3_years');
  });

  it('calls onBack and onSkip when provided', () => {
    const onBack = vi.fn();
    const onSkip = vi.fn();
    render(<ObjectiveStep onNext={vi.fn()} onBack={onBack} onSkip={onSkip} />);
    fireEvent.click(screen.getByText('onboarding.nav.back'));
    fireEvent.click(screen.getByText('onboarding.nav.skip'));
    expect(onBack).toHaveBeenCalled();
    expect(onSkip).toHaveBeenCalled();
  });
});
