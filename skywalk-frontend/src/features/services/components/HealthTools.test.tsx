import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { HealthCoverageTool, MedicalChecklistTool, HealthBudgetTool } from './HealthTools';

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

beforeEach(() => {
  mockedUseQuery.mockReturnValue({ isLoading: false, data: undefined } as any);
});

describe('HealthCoverageTool', () => {
  it('shows a loading state while the query is pending', () => {
    mockedUseQuery.mockReturnValue({ isLoading: true, data: undefined } as any);
    render(<HealthCoverageTool countryName="france" />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('shows the public coverage as included (free) for France', () => {
    render(<HealthCoverageTool countryName="france" />);
    expect(screen.getByText('services.tools.healthCoverage.included')).toBeInTheDocument();
  });

  it('shows a complementary insurance line when a private cost applies', () => {
    render(<HealthCoverageTool countryName="france" />);
    expect(screen.getByText('services.tools.healthCoverage.complementary')).toBeInTheDocument();
  });

  it('omits the complementary line for a country with no private cost', () => {
    render(<HealthCoverageTool countryName="etats-unis" />);
    expect(screen.queryByText('services.tools.healthCoverage.complementary')).not.toBeInTheDocument();
  });

  it('falls back to France costs for an unknown country', () => {
    render(<HealthCoverageTool countryName="atlantide" />);
    expect(screen.getByText('services.tools.healthCoverage.included')).toBeInTheDocument();
  });

  it('lets the user switch their coverage profile', () => {
    render(<HealthCoverageTool countryName="france" />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'student' } });
    expect(select.value).toBe('student');
  });
});

describe('MedicalChecklistTool', () => {
  it('renders every checklist item and starts at 0%', () => {
    render(<MedicalChecklistTool countryName="france" />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('services.tools.medicalChecklist.items.records')).toBeInTheDocument();
  });

  it('updates the progress percentage as items are checked', () => {
    render(<MedicalChecklistTool countryName="france" />);
    fireEvent.click(screen.getByText('services.tools.medicalChecklist.items.records'));
    expect(screen.getByText('17%')).toBeInTheDocument();
  });

  it('reaches 100% once every item is checked', () => {
    render(<MedicalChecklistTool countryName="france" />);
    [
      'services.tools.medicalChecklist.items.records',
      'services.tools.medicalChecklist.items.vaccination',
      'services.tools.medicalChecklist.items.prescriptions',
      'services.tools.medicalChecklist.items.ehic',
      'services.tools.medicalChecklist.items.insurance',
      'services.tools.medicalChecklist.items.allergies',
    ].forEach((label) => fireEvent.click(screen.getByText(label)));
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});

describe('HealthBudgetTool', () => {
  it('shows a loading state while the query is pending', () => {
    mockedUseQuery.mockReturnValue({ isLoading: true, data: undefined } as any);
    render(<HealthBudgetTool countryName="france" />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('shows the Swiss cost warning for Switzerland', () => {
    render(<HealthBudgetTool countryName="suisse" />);
    expect(screen.getByText('services.healthTools.swissWarning')).toBeInTheDocument();
  });

  it('shows the US cost warning for the United States', () => {
    render(<HealthBudgetTool countryName="etats-unis" />);
    expect(screen.getByText('services.healthTools.usaWarning')).toBeInTheDocument();
  });

  it('shows neither warning for France', () => {
    render(<HealthBudgetTool countryName="france" />);
    expect(screen.queryByText('services.healthTools.swissWarning')).not.toBeInTheDocument();
    expect(screen.queryByText('services.healthTools.usaWarning')).not.toBeInTheDocument();
  });

  it('lets the user switch their age profile', () => {
    render(<HealthBudgetTool countryName="france" />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'senior' } });
    expect(select.value).toBe('senior');
  });
});
