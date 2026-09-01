import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { TransportCostTool, DriverLicenseTool, VehicleChecklistTool } from './TransportTools';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) =>
      opts && typeof opts === 'object' ? `${key}:${JSON.stringify(opts)}` : key,
  }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

const formatPrice = vi.fn((v: number) => `${v}€`);
vi.mock('../../../contexts/CurrencyContext', () => ({
  useCurrency: () => ({ formatPrice }),
}));

const mockedUseQuery = vi.mocked(useQuery);

const costOfLivingData = {
  categories: {
    transportation: {
      personal: { gasoline1L: { avg: 1.8 } },
      publicTransport: { monthlyPass: { avg: 75 } },
    },
  },
  currency: { code: 'EUR', exchangeRates: null },
};

describe('TransportCostTool', () => {
  beforeEach(() => {
    mockedUseQuery.mockReturnValue({ isLoading: false, data: costOfLivingData } as any);
  });

  it('shows a loading state while the query is pending', () => {
    mockedUseQuery.mockReturnValue({ isLoading: true, data: undefined } as any);
    render(<TransportCostTool countryName="france" />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('defaults to the car tab and computes a cost from distance', () => {
    render(<TransportCostTool countryName="france" />);
    fireEvent.change(screen.getByPlaceholderText('Ex: 30'), { target: { value: '20' } });
    expect(screen.getByText('services.tools.transportCost.monthlyCost')).toBeInTheDocument();
  });

  it('switches to the public-transport tab and shows the monthly pass cost', () => {
    render(<TransportCostTool countryName="france" />);
    fireEvent.click(screen.getByText('services.tools.transportCost.publicTransport'));
    expect(screen.getByText('services.tools.transportCost.publicPass')).toBeInTheDocument();
    expect(screen.getAllByText('75€').length).toBeGreaterThan(0);
  });
});

describe('DriverLicenseTool', () => {
  it('does not show exchange details before a country is picked', () => {
    render(<DriverLicenseTool countryName="France" />);
    expect(screen.queryByText('services.transportTools.exchangePossible')).not.toBeInTheDocument();
  });

  it('shows exchange details once an origin country is selected', () => {
    render(<DriverLicenseTool countryName="France" />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'canada' } });
    expect(screen.getByText('services.transportTools.exchangePossible')).toBeInTheDocument();
  });
});

describe('VehicleChecklistTool', () => {
  it('renders every checklist item starting at 0%', () => {
    render(<VehicleChecklistTool />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('services.transportTools.validId')).toBeInTheDocument();
  });

  it('updates progress as items are checked', () => {
    render(<VehicleChecklistTool />);
    fireEvent.click(screen.getByText('services.transportTools.validId'));
    expect(screen.getByText('17%')).toBeInTheDocument();
  });
});
