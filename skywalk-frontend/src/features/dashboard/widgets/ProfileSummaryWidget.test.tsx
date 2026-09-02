import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileSummaryWidget from './ProfileSummaryWidget';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key.split('.').pop() ?? key }),
}));

vi.mock('../../onboarding/data/constants', () => ({
  COUNTRIES: [
    { value: 'FR', i18nKey: 'countries.france' },
    { value: 'DE', i18nKey: 'countries.germany' },
  ],
}));

const baseOnboarding = {
  destination: { fromCountry: 'FR', toCountry: 'DE', targetCity: 'Berlin', departureYear: '2027' },
  profile: { age: '30', status: 'employed', travelParty: 'alone' },
  objective: { goal: 'work' },
};

describe('ProfileSummaryWidget', () => {
  it('shows the empty state when there is no onboarding data', () => {
    render(<ProfileSummaryWidget userData={{ name: 'Jean' }} />);
    expect(screen.getByText('emptyState')).toBeInTheDocument();
  });

  it('resolves country labels via the COUNTRIES registry, falling back to the raw code', () => {
    render(
      <ProfileSummaryWidget
        userData={{
          name: 'Jean',
          onboardingData: {
            ...baseOnboarding,
            destination: { ...baseOnboarding.destination, fromCountry: 'FR', toCountry: 'ZZ' },
          },
        }}
      />,
    );
    expect(screen.getByText('france → ZZ')).toBeInTheDocument();
  });

  it('joins only the filled-in profile fields, separated by a bullet', () => {
    render(
      <ProfileSummaryWidget
        userData={{
          name: 'Jean',
          onboardingData: { ...baseOnboarding, profile: { age: '30', status: '', travelParty: 'alone' } },
        }}
      />,
    );
    expect(screen.getByText('30 age • alone')).toBeInTheDocument();
  });

  it('falls back to "not provided" when no profile field is filled in', () => {
    render(
      <ProfileSummaryWidget
        userData={{
          name: 'Jean',
          onboardingData: { ...baseOnboarding, profile: { age: '', status: '', travelParty: '' } },
        }}
      />,
    );
    expect(screen.getByText('notProvided')).toBeInTheDocument();
  });

  it('prefixes the departure year with the target city only when it is set', () => {
    const { rerender } = render(
      <ProfileSummaryWidget userData={{ name: 'Jean', onboardingData: baseOnboarding }} />,
    );
    expect(screen.getByText('Berlin • departureIn 2027')).toBeInTheDocument();

    rerender(
      <ProfileSummaryWidget
        userData={{
          name: 'Jean',
          onboardingData: { ...baseOnboarding, destination: { ...baseOnboarding.destination, targetCity: '' } },
        }}
      />,
    );
    expect(screen.getByText('departureIn 2027')).toBeInTheDocument();
  });

  it('computes completion as the share of filled-in tracked fields', () => {
    // 3 of 5 fields filled: age, status, targetCity (travelParty and goal empty)
    render(
      <ProfileSummaryWidget
        userData={{
          name: 'Jean',
          onboardingData: {
            destination: { fromCountry: 'FR', toCountry: 'DE', targetCity: 'Berlin', departureYear: '2027' },
            profile: { age: '30', status: 'employed', travelParty: '' },
            objective: { goal: '' },
          },
        }}
      />,
    );
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('reports 100% completion when every tracked field is filled', () => {
    render(<ProfileSummaryWidget userData={{ name: 'Jean', onboardingData: baseOnboarding }} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
