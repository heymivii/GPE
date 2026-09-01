import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import ServiceTools from './ServiceTools';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

vi.mock('./TransportTools', () => ({
  TransportCostTool: ({ countryName }: any) => <div data-testid="transport-cost-tool">{countryName}</div>,
}));

vi.mock('./HealthTools', () => ({
  HealthCoverageTool: ({ countryName }: any) => <div data-testid="health-coverage-tool">{countryName}</div>,
}));

const convert = vi.fn((v: number) => v);
vi.mock('../../../contexts/CurrencyContext', () => ({
  useCurrency: () => ({ displayCurrency: 'EUR', displaySymbol: '€', convert }),
  DISPLAY_CURRENCIES: [{ code: 'EUR', symbol: '€' }, { code: 'USD', symbol: '$' }],
}));

describe('ServiceTools', () => {
  it('renders nothing for an unknown category', () => {
    const { container } = render(<ServiceTools category="unknown" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the CV readiness checklist for the emploi category', () => {
    render(<ServiceTools category="emploi" countryName="france" />);
    expect(screen.getByText('services.tools.cvReadiness.title - france')).toBeInTheDocument();
  });

  it('checks off a CV readiness item and updates the progress', () => {
    render(<ServiceTools category="emploi" />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    fireEvent.click(screen.getByText('services.tools.cvReadiness.items.translated'));
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('renders the rent calculator for the logement category', () => {
    render(<ServiceTools category="logement" countryName="france" />);
    expect(screen.getByText('services.tools.rentCalculator.title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: 2500')).toBeInTheDocument();
  });

  it('computes a recommended budget from the net income input', () => {
    render(<ServiceTools category="logement" />);
    fireEvent.change(screen.getByPlaceholderText('Ex: 2500'), { target: { value: '3000' } });
    expect(screen.getByText('990')).toBeInTheDocument();
  });

  it('renders the mocked TransportCostTool for the transport category', () => {
    render(<ServiceTools category="transport" countryName="japon" />);
    expect(screen.getByTestId('transport-cost-tool')).toHaveTextContent('japon');
  });

  it('renders the mocked HealthCoverageTool for the sante category', () => {
    render(<ServiceTools category="sante" countryName="suisse" />);
    expect(screen.getByTestId('health-coverage-tool')).toHaveTextContent('suisse');
  });

  it('calls onToggleExpand and shows the expand/collapse icon when provided', () => {
    const onToggleExpand = vi.fn();
    render(<ServiceTools category="emploi" isExpanded={false} onToggleExpand={onToggleExpand} />);
    fireEvent.click(screen.getByTitle('common.expand'));
    expect(onToggleExpand).toHaveBeenCalled();
  });
});
