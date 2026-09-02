import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VisaStats from './VisaStats';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (opts?.count != null) return `${key}:${opts.count}`;
      if (key === 'visa.tipsList.tip.negative') return '❌ Avoid X';
      if (key === 'visa.tipsList.tip.positive') return '✅ Do Y';
      return key;
    },
  }),
}));

vi.mock('../../../data/visa-data', () => ({
  getVisaDataForCountry: vi.fn(),
}));

vi.mock('../../../data/supportedCountries', () => ({
  SUPPORTED_COUNTRIES: [{ code: 'FR', slug: 'france', name: 'France' }],
  getCountryMapping: () => ({ displayName: 'France' }),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const isSameCurrency = vi.fn();
const formatPrice = vi.fn();
vi.mock('../../../contexts/CurrencyContext', () => ({
  useCurrency: () => ({ isSameCurrency, displayCurrency: 'USD', formatPrice }),
}));

vi.mock('../../../api/expatriation-project', () => ({
  expatriationProjectApi: { getAll: vi.fn() },
}));

vi.mock('../../../data/countries-data.json', () => ({
  default: { countries: [{ id: 1, code: 'FR' }] },
}));

import { getVisaDataForCountry } from '../../../data/visa-data';
import { useAuth } from '../../../hooks/useAuth';
import { expatriationProjectApi } from '../../../api/expatriation-project';

const mockedGetVisaData = vi.mocked(getVisaDataForCountry);
const mockedUseAuth = vi.mocked(useAuth);
const mockedGetAll = vi.mocked(expatriationProjectApi.getAll);

const visaData = {
  countryCode: 'FR',
  countryName: 'France',
  flag: '🇫🇷',
  visaTypes: [
    { id: 'work', color: 'yellow', type: 'workVisa', description: 'd', duration: '1y', cost: '99 EUR', processing: '2m', learnMoreUrl: 'https://x' },
  ],
  workVisaSteps: [{ title: 'step1', description: 'desc1', timeline: 't1' }],
  costs: [{ label: 'visa', amount: '99 EUR' }],
  totalCost: '99 EUR',
  warnings: [{ level: 'red', text: 'warn1' }],
  officialResources: [{ name: 'Gov site', url: 'https://gov.fr' }],
  checklist: [
    { id: 'doc1', label: 'passport' },
    { id: 'doc2', label: 'photo' },
  ],
  tips: ['tip.positive', 'tip.negative'],
};

function renderVisaStats(countryName = 'france') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <VisaStats countryName={countryName} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('VisaStats', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockedGetVisaData.mockReturnValue(visaData as any);
    mockedUseAuth.mockReturnValue({ isAuthenticated: false } as any);
    mockedGetAll.mockResolvedValue([]);
    isSameCurrency.mockReturnValue(true);
    formatPrice.mockImplementation((n: number) => `$${n}`);
  });

  it('renders the general overview when countryName is "general"', () => {
    renderVisaStats('general');
    expect(screen.getByText('visa.general.heroTitle')).toBeInTheDocument();
  });

  it('shows the no-data message when there is no visa data for the country', () => {
    mockedGetVisaData.mockReturnValue(undefined);
    renderVisaStats('france');
    expect(screen.getByText('visa.noData')).toBeInTheDocument();
  });

  it('passes the raw cost through unchanged when currencies match', () => {
    isSameCurrency.mockReturnValue(true);
    renderVisaStats('france');
    // Rendered 3x: the visa type card, the cost breakdown line, and the total.
    expect(screen.getAllByText('99 EUR').length).toBe(3);
    expect(formatPrice).not.toHaveBeenCalled();
  });

  it('formats the cost via the currency context when currencies differ', () => {
    isSameCurrency.mockReturnValue(false);
    formatPrice.mockReturnValue('$110');
    renderVisaStats('france');
    expect(formatPrice).toHaveBeenCalledWith(99, 'EUR');
    expect(screen.getAllByText('$110').length).toBeGreaterThan(0);
  });

  it('toggles a checklist item and updates the progress percentage', () => {
    renderVisaStats('france');
    expect(screen.getByText('0%')).toBeInTheDocument();

    fireEvent.click(screen.getByText('visa.checklistItems.passport'));
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('persists checked items to localStorage under a country-scoped key', () => {
    renderVisaStats('france');
    fireEvent.click(screen.getByText('visa.checklistItems.passport'));
    const stored = JSON.parse(localStorage.getItem('visa-checklist-FR')!);
    expect(stored).toEqual(['doc1']);
  });

  it('restores previously checked items from localStorage', () => {
    localStorage.setItem('visa-checklist-FR', JSON.stringify(['doc1', 'doc2']));
    renderVisaStats('france');
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows a create-account prompt when unauthenticated', () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: false } as any);
    renderVisaStats('france');
    expect(screen.getByText('visa.createAccount →')).toBeInTheDocument();
  });

  it('prompts project creation when authenticated with no matching project', async () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: true } as any);
    mockedGetAll.mockResolvedValue([]);
    renderVisaStats('france');
    expect(await screen.findByText('visa.createProject →')).toBeInTheDocument();
  });

  it('links to the project checklist when authenticated with a matching project', async () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: true } as any);
    mockedGetAll.mockResolvedValue([{ idDestinationCountry: 1 }] as any);
    renderVisaStats('france');
    expect(await screen.findByText('visa.goToProjectChecklist')).toBeInTheDocument();
  });

  it('strips the emoji prefix from tips and distinguishes negative ones by icon', () => {
    renderVisaStats('france');
    expect(screen.getByText('Do Y')).toBeInTheDocument();
    expect(screen.getByText('Avoid X')).toBeInTheDocument();
    // The negative tip's container renders an XCircle icon instead of CheckCircle2.
    const negativeRow = screen.getByText('Avoid X').closest('div')!;
    expect(negativeRow.querySelector('svg.lucide-circle-x')).toBeInTheDocument();
  });

  it('shows the currency-conversion badge only when the currencies differ', () => {
    isSameCurrency.mockReturnValue(false);
    renderVisaStats('france');
    expect(screen.getByText('EUR → USD')).toBeInTheDocument();
  });

  it('expands a work-visa step to show its details', () => {
    mockedGetVisaData.mockReturnValue({
      ...visaData,
      workVisaSteps: [
        { title: 'step1', description: 'desc1', timeline: 't1', details: ['detailA', 'detailB'] },
      ],
    } as any);
    renderVisaStats('france');
    expect(screen.queryByText('visa.steps.detailA')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('visa.steps.step1'));
    expect(screen.getByText('visa.steps.detailA')).toBeInTheDocument();
    // Clicking again collapses it.
    fireEvent.click(screen.getByText('visa.steps.step1'));
    expect(screen.queryByText('visa.steps.detailA')).not.toBeInTheDocument();
  });

  it('leaves a "free" cost unconverted (no numeric amount to convert)', () => {
    isSameCurrency.mockReturnValue(false);
    mockedGetVisaData.mockReturnValue({
      ...visaData,
      costs: [{ label: 'visa', amount: 'Gratuit' }],
    } as any);
    renderVisaStats('france');
    expect(screen.getByText('Gratuit')).toBeInTheDocument();
  });

  it('leaves a non-numeric cost unconverted', () => {
    isSameCurrency.mockReturnValue(false);
    mockedGetVisaData.mockReturnValue({
      ...visaData,
      costs: [{ label: 'visa', amount: 'Variable' }],
    } as any);
    renderVisaStats('france');
    expect(screen.getByText('Variable')).toBeInTheDocument();
  });

  it('recovers gracefully when localStorage contains invalid JSON', () => {
    localStorage.setItem('visa-checklist-FR', '{not json');
    expect(() => renderVisaStats('france')).not.toThrow();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});

describe('VisaStats — VisaGeneralOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({ isAuthenticated: false } as any);
  });

  it.each([
    ['tips', 'visa.general.tipsTitle', 'visa.general.tip1Title'],
    ['errors', 'visa.general.errorsTitle', 'visa.general.error1'],
    ['types', 'visa.general.visaTypesTitle', 'visa.general.typeShortStay'],
  ])('opens the "%s" section on click, revealing its content', (_key, titleText, contentText) => {
    renderVisaStats('general');
    expect(screen.queryByText(contentText)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(titleText));
    expect(screen.getByText(contentText)).toBeInTheDocument();
    // Clicking again collapses the section.
    fireEvent.click(screen.getByText(titleText));
    expect(screen.queryByText(contentText)).not.toBeInTheDocument();
  });

  it('collapses the timeline section (open by default) on click', () => {
    renderVisaStats('general');
    expect(screen.getByText('visa.general.timeline1Title')).toBeInTheDocument();
    fireEvent.click(screen.getByText('visa.general.timelineTitle'));
    expect(screen.queryByText('visa.general.timeline1Title')).not.toBeInTheDocument();
  });
});
