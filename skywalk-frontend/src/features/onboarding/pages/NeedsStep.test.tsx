import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NeedsStep from './NeedsStep';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => opts?.defaultValue ?? key,
  }),
}));

describe('NeedsStep', () => {
  it('renders a pill for each priority option', () => {
    render(<NeedsStep onNext={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'onboarding.constants.priorities.housing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'onboarding.constants.priorities.health' })).toBeInTheDocument();
  });

  it('disables Next until at least one priority is selected', () => {
    render(<NeedsStep onNext={vi.fn()} />);
    expect(screen.getByText('onboarding.nav.next')).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'onboarding.constants.priorities.housing' }));
    expect(screen.getByText('onboarding.nav.next')).not.toBeDisabled();
  });

  it('calls onNext with the selected priorities', () => {
    const onNext = vi.fn();
    render(<NeedsStep onNext={onNext} />);
    fireEvent.click(screen.getByRole('button', { name: 'onboarding.constants.priorities.housing' }));
    fireEvent.click(screen.getByRole('button', { name: 'onboarding.constants.priorities.health' }));
    fireEvent.click(screen.getByText('onboarding.nav.next'));
    expect(onNext).toHaveBeenCalledWith({ priorities: ['housing', 'health'] });
  });

  it('pre-fills selected priorities from initial data', () => {
    render(<NeedsStep onNext={vi.fn()} data={{ priorities: ['transport'] }} />);
    expect(
      screen.getByRole('button', { name: 'onboarding.constants.priorities.transport' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('clears the priorities error once a selection is made', () => {
    render(<NeedsStep onNext={vi.fn()} data={{ priorities: ['housing'] }} />);
    // Deselect to trigger the disabled state, then verify no crash re-selecting (clears error path).
    fireEvent.click(screen.getByRole('button', { name: 'onboarding.constants.priorities.housing' }));
    fireEvent.click(screen.getByRole('button', { name: 'onboarding.constants.priorities.housing' }));
    expect(screen.getByText('onboarding.nav.next')).not.toBeDisabled();
  });

  it('calls onBack and onSkip when provided', () => {
    const onBack = vi.fn();
    const onSkip = vi.fn();
    render(<NeedsStep onNext={vi.fn()} onBack={onBack} onSkip={onSkip} />);
    fireEvent.click(screen.getByText('onboarding.nav.back'));
    fireEvent.click(screen.getByText("Passer pour l'instant"));
    expect(onBack).toHaveBeenCalled();
    expect(onSkip).toHaveBeenCalled();
  });
});
