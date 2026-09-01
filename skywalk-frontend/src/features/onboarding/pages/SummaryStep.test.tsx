import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SummaryStep from './SummaryStep';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (opts?.age != null) return `${opts.age} yo`;
      if (opts?.budget != null) return `Budget: ${opts.budget}`;
      if (key === 'onboarding.summary.notSpecified') return 'Not specified';
      if (key === 'onboarding.summary.none') return 'None';
      return opts?.defaultValue ?? key;
    },
  }),
}));

vi.mock('../data/constants', () => ({
  COUNTRIES: [{ value: 'FR', i18nKey: 'countries.france' }],
}));

vi.mock('../../../data/supportedCountries', () => ({
  SUPPORTED_COUNTRIES: [{ code: 'DE', slug: 'allemagne' }],
}));

vi.mock('../../../data/freeMovement', () => ({
  NATIONALITY_OPTIONS: [{ value: 'FR', label: 'Française' }],
}));

vi.mock('../../../api/destinations', () => ({
  destinationsApi: { getBySlug: vi.fn() },
}));

import { destinationsApi } from '../../../api/destinations';
const mockedGetBySlug = vi.mocked(destinationsApi.getBySlug);

const baseData = {
  destination: { fromCountry: 'FR', toCountry: 'DE', targetCity: '', departureYear: '2027' },
  profile: { age: '30', status: 'employed', travelParty: 'alone', languageLevel: 'b2' },
  objective: { goal: 'work', stayDuration: '2y' },
  preparation: { stepsDone: [], housingBudget: '' },
  needs: { priorities: [] },
} as any;

function renderStep(data = baseData, extra: Partial<React.ComponentProps<typeof SummaryStep>> = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <SummaryStep data={data} onEdit={vi.fn()} onComplete={vi.fn()} {...extra} />
    </QueryClientProvider>,
  );
}

describe('SummaryStep', () => {
  beforeEach(() => {
    mockedGetBySlug.mockResolvedValue({ cities: [] } as any);
  });

  it('resolves country labels via the COUNTRIES registry', () => {
    renderStep();
    expect(screen.getByText('countries.france')).toBeInTheDocument();
  });

  it('resolves the nationality label from NATIONALITY_OPTIONS', () => {
    renderStep({
      ...baseData,
      destination: { ...baseData.destination, nationality: 'FR' },
    });
    expect(screen.getByText('Française')).toBeInTheDocument();
  });

  it('falls back to the raw code when the nationality is unmapped', () => {
    renderStep({
      ...baseData,
      destination: { ...baseData.destination, nationality: 'ZZ' },
    });
    expect(screen.getByText('ZZ')).toBeInTheDocument();
  });

  it('shows "not specified" when no nationality is set', () => {
    renderStep();
    expect(screen.getAllByText('Not specified').length).toBeGreaterThan(0);
  });

  it('resolves the target city name from the fetched destination cities', async () => {
    mockedGetBySlug.mockResolvedValue({
      cities: [{ id: 5, name: 'Berlin' }],
    } as any);
    renderStep({
      ...baseData,
      destination: { ...baseData.destination, targetCity: '5' },
    });
    expect(await screen.findByText('Berlin')).toBeInTheDocument();
  });

  it('falls back to the legacy raw city name when targetCity is not numeric', () => {
    renderStep({
      ...baseData,
      destination: { ...baseData.destination, targetCity: 'Munich' },
    });
    expect(screen.getByText('Munich')).toBeInTheDocument();
  });

  it('shows a formatted departure date when set, otherwise the raw year', () => {
    const { rerender } = renderStep({
      ...baseData,
      destination: { ...baseData.destination, departureDate: '2027-06-15T00:00:00Z' },
    });
    expect(screen.getByText('15 juin 2027')).toBeInTheDocument();

    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <SummaryStep data={baseData} onEdit={vi.fn()} onComplete={vi.fn()} />
      </QueryClientProvider>,
    );
    expect(screen.getByText('2027')).toBeInTheDocument();
  });

  it('defaults optional sections to a placeholder when their data is empty', () => {
    renderStep();
    expect(screen.getByText('None')).toBeInTheDocument(); // stepsDone empty
  });

  it('joins multiple selected priorities into a single label', () => {
    renderStep({
      ...baseData,
      needs: { priorities: ['housing', 'employment'] },
    });
    expect(screen.getByText('housing, employment')).toBeInTheDocument();
  });

  it('calls onEdit with the right step number for each card', () => {
    const onEdit = vi.fn();
    renderStep(baseData, { onEdit });
    const editButtons = screen.getAllByText('common.edit');
    fireEvent.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith(1);
    fireEvent.click(editButtons[1]);
    expect(onEdit).toHaveBeenCalledWith(2);
    fireEvent.click(editButtons[2]);
    expect(onEdit).toHaveBeenCalledWith(3);
    fireEvent.click(editButtons[3]);
    expect(onEdit).toHaveBeenCalledWith(4);
    fireEvent.click(editButtons[4]);
    expect(onEdit).toHaveBeenCalledWith(5);
  });

  it('calls onComplete when the submit button is clicked', async () => {
    const onComplete = vi.fn();
    renderStep(baseData, { onComplete });
    fireEvent.click(screen.getByText('onboarding.summary.submitLabel'));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });

  it('disables the submit button and shows the submitting label while isSubmitting', () => {
    renderStep(baseData, { isSubmitting: true });
    const button = screen.getByText('onboarding.summary.creatingLabel').closest('button')!;
    expect(button).toBeDisabled();
  });
});
