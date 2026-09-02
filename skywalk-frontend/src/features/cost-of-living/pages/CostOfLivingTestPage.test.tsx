import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CostOfLivingTestPage from './CostOfLivingTestPage';

const ctxState: any = {
  data: null,
  isLoading: false,
  isError: false,
  error: null,
  city: null,
  country: null,
  setTarget: vi.fn(),
};
vi.mock('../../../contexts/CostOfLivingContext', () => ({
  useCostOfLiving: () => ctxState,
}));

const fullData = {
  city: { name: 'Paris', country: 'France' },
  currency: { code: 'EUR' },
  summary: { monthlyBudget: { avg: 1500.5 }, averageSalary: 3000.25 },
  categories: {
    housing: {
      rent: {
        oneBedroom: { cityCenter: { avg: 1000 }, outsideCenter: { avg: 800 } },
        threeBedroom: { cityCenter: { avg: 2000 } },
      },
    },
    food: {
      markets: {
        milk1L: { avg: 1.2 },
        bread500g: { avg: 1.5 },
        eggs12: { avg: 3 },
      },
    },
  },
};

describe('CostOfLivingTestPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ctxState.data = null;
    ctxState.isLoading = false;
    ctxState.isError = false;
    ctxState.error = null;
    ctxState.city = null;
    ctxState.country = null;
  });

  it('defaults the inputs to Paris/France', () => {
    render(<CostOfLivingTestPage />);
    expect(screen.getByPlaceholderText('City (e.g., Paris)')).toHaveValue('Paris');
    expect(screen.getByPlaceholderText('Country (e.g., France)')).toHaveValue('France');
  });

  it('syncs the inputs from the context city/country', () => {
    ctxState.city = 'Berlin';
    ctxState.country = 'Allemagne';
    render(<CostOfLivingTestPage />);
    expect(screen.getByPlaceholderText('City (e.g., Paris)')).toHaveValue('Berlin');
    expect(screen.getByPlaceholderText('Country (e.g., France)')).toHaveValue('Allemagne');
  });

  it('calls setTarget with the entered city/country', () => {
    render(<CostOfLivingTestPage />);
    fireEvent.change(screen.getByPlaceholderText('City (e.g., Paris)'), { target: { value: 'Lyon' } });
    fireEvent.click(screen.getByText('Update Context'));
    expect(ctxState.setTarget).toHaveBeenCalledWith('Lyon', 'France');
  });

  it('disables the button and shows "Fetching..." while loading', () => {
    ctxState.isLoading = true;
    render(<CostOfLivingTestPage />);
    expect(screen.getByText('Fetching...')).toBeDisabled();
  });

  it('disables the button when a field is blank', () => {
    render(<CostOfLivingTestPage />);
    fireEvent.change(screen.getByPlaceholderText('City (e.g., Paris)'), { target: { value: '' } });
    expect(screen.getByText('Update Context')).toBeDisabled();
  });

  it('shows the error message when isError is set', () => {
    ctxState.isError = true;
    ctxState.error = new Error('boom');
    render(<CostOfLivingTestPage />);
    expect(screen.getByText('Error: boom')).toBeInTheDocument();
  });

  it('shows a generic error message for a non-Error rejection', () => {
    ctxState.isError = true;
    ctxState.error = 'string error';
    render(<CostOfLivingTestPage />);
    expect(screen.getByText('Error: An error occurred')).toBeInTheDocument();
  });

  it('renders the summary, housing, and food sections once data loads', () => {
    ctxState.data = fullData;
    render(<CostOfLivingTestPage />);
    expect(screen.getByText('Summary for Paris, France')).toBeInTheDocument();
    expect(screen.getByText('1500.50 EUR')).toBeInTheDocument();
    expect(screen.getByText('3000.25 EUR')).toBeInTheDocument();
    expect(screen.getByText('1000 EUR')).toBeInTheDocument();
    expect(screen.getByText('1.2 EUR')).toBeInTheDocument();
  });
});
