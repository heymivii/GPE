import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PreparationStep from './PreparationStep';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts?.currency ? `${key}:${opts.currency}` : key),
  }),
}));

describe('PreparationStep', () => {
  it('renders steps-done pills and the budget input with the given currency', () => {
    render(<PreparationStep onNext={vi.fn()} currency="$" />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('disables Next until a housing budget is entered', () => {
    render(<PreparationStep onNext={vi.fn()} />);
    expect(screen.getByText('onboarding.nav.next')).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('onboarding.preparation.housingBudgetPlaceholder'), {
      target: { value: '1000' },
    });
    expect(screen.getByText('onboarding.nav.next')).not.toBeDisabled();
  });

  it('strips non-numeric characters from the budget input', () => {
    render(<PreparationStep onNext={vi.fn()} />);
    const input = screen.getByPlaceholderText('onboarding.preparation.housingBudgetPlaceholder');
    fireEvent.change(input, { target: { value: 'abc1200xyz' } });
    expect(input).toHaveValue('1200');
  });

  it('calls onNext with the selected steps and budget', () => {
    const onNext = vi.fn();
    render(<PreparationStep onNext={onNext} />);
    fireEvent.click(screen.getByRole('button', { name: 'onboarding.constants.stepsDone.none' }));
    fireEvent.change(screen.getByPlaceholderText('onboarding.preparation.housingBudgetPlaceholder'), {
      target: { value: '1000' },
    });
    fireEvent.click(screen.getByText('onboarding.nav.next'));
    expect(onNext).toHaveBeenCalledWith({ stepsDone: ['none'], housingBudget: '1000' });
  });

  it('pre-fills the form from initial data', () => {
    render(<PreparationStep onNext={vi.fn()} data={{ stepsDone: ['none'], housingBudget: '1500' }} />);
    expect(screen.getByRole('button', { name: 'onboarding.constants.stepsDone.none' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByPlaceholderText('onboarding.preparation.housingBudgetPlaceholder')).toHaveValue('1500');
  });

  it('calls onBack and onSkip when provided', () => {
    const onBack = vi.fn();
    const onSkip = vi.fn();
    render(<PreparationStep onNext={vi.fn()} onBack={onBack} onSkip={onSkip} />);
    fireEvent.click(screen.getByText('onboarding.nav.back'));
    fireEvent.click(screen.getByText('onboarding.nav.skip'));
    expect(onBack).toHaveBeenCalled();
    expect(onSkip).toHaveBeenCalled();
  });
});
