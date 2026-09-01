import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileStep from './ProfileStep';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => opts?.defaultValue ?? key,
  }),
}));

function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText('onboarding.profile.agePlaceholder'), {
    target: { value: '30' },
  });
  const selects = screen.getAllByRole('combobox');
  fireEvent.change(selects[0], { target: { value: 'Français' } }); // motherTongue
  fireEvent.change(selects[1], { target: { value: 'employee' } }); // status
  fireEvent.click(screen.getByRole('radio', { name: 'onboarding.constants.travelParty.alone' }));
  fireEvent.change(selects[2], { target: { value: 'A1' } }); // languageLevel
}

describe('ProfileStep', () => {
  it('disables Next until every required field is filled', () => {
    render(<ProfileStep onNext={vi.fn()} />);
    expect(screen.getByText('onboarding.nav.next')).toBeDisabled();
    fillRequiredFields();
    expect(screen.getByText('onboarding.nav.next')).not.toBeDisabled();
  });

  it('calls onNext with the completed profile', () => {
    const onNext = vi.fn();
    render(<ProfileStep onNext={onNext} />);
    fillRequiredFields();
    fireEvent.click(screen.getByText('onboarding.nav.next'));
    expect(onNext).toHaveBeenCalledWith(
      expect.objectContaining({
        age: '30',
        motherTongue: 'Français',
        status: 'employee',
        travelParty: 'alone',
        languageLevel: 'A1',
      }),
    );
  });

  it('toggles hasChildren and hasJobOffer as booleans', () => {
    const onNext = vi.fn();
    render(<ProfileStep onNext={onNext} />);
    fillRequiredFields();

    const yesButtons = screen.getAllByRole('radio', { name: 'Oui' });
    fireEvent.click(yesButtons[0]); // hasChildren
    const noButtons = screen.getAllByRole('radio', { name: 'Non' });
    fireEvent.click(noButtons[1]); // hasJobOffer

    fireEvent.click(screen.getByText('onboarding.nav.next'));
    expect(onNext).toHaveBeenCalledWith(
      expect.objectContaining({ hasChildren: true, hasJobOffer: false }),
    );
  });

  it('pre-fills the form from initial data', () => {
    render(
      <ProfileStep
        onNext={vi.fn()}
        data={{
          age: '25',
          motherTongue: 'Anglais',
          status: 'student',
          travelParty: 'couple',
          languageLevel: 'B2',
          hasChildren: true,
        }}
      />,
    );
    expect(screen.getByPlaceholderText('onboarding.profile.agePlaceholder')).toHaveValue(25);
    expect(screen.getByText('onboarding.nav.next')).not.toBeDisabled();
    const yesButtons = screen.getAllByRole('radio', { name: 'Oui' });
    expect(yesButtons[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onBack when provided', () => {
    const onBack = vi.fn();
    render(<ProfileStep onNext={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getByText('onboarding.nav.back'));
    expect(onBack).toHaveBeenCalled();
  });
});
