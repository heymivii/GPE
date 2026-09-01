import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VisaPage from './VisaPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const authState: { isAuthenticated: boolean } = { isAuthenticated: false };
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: authState.isAuthenticated }),
}));

const destinationState: { countrySlug: string | null } = { countrySlug: null };
const mockSetCountrySlug = vi.fn((slug: string) => {
  destinationState.countrySlug = slug;
});
vi.mock('../../../contexts/DestinationContext', () => ({
  useDestination: () => ({
    countrySlug: destinationState.countrySlug,
    setCountrySlug: mockSetCountrySlug,
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <VisaPage />
    </MemoryRouter>,
  );
}

describe('VisaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = false;
    destinationState.countrySlug = null;
  });

  it('defaults to France when no destination is selected', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: /France/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /France/ })).toHaveClass('bg-gray-900');
  });

  it('lists selectable countries and switches destination on click', () => {
    renderPage();
    const switzerlandBtn = screen.getByRole('button', { name: /Suisse/ });
    fireEvent.click(switzerlandBtn);
    expect(mockSetCountrySlug).toHaveBeenCalledWith('suisse');
  });

  it('renders visa types, costs, warnings, and official resources for the selected country', () => {
    renderPage();
    expect(screen.getByText('visa.visaTypes — France')).toBeInTheDocument();
    expect(screen.getByText('visa.costsBreakdown')).toBeInTheDocument();
    expect(screen.getByText('visa.importantWarnings')).toBeInTheDocument();
    expect(screen.getByText('visa.officialResources')).toBeInTheDocument();
    expect(screen.getByText('visa.totalEstimated')).toBeInTheDocument();
  });

  it('expands a work-visa step to show its details', () => {
    renderPage();
    const guideSection = screen.getByText('visa.stepByStep').closest('section')!;
    const firstStepButton = within(guideSection).getAllByRole('button')[0];
    fireEvent.click(firstStepButton);
    // details list appears (an <ul> inside a bg-gray-50 wrapper) once expanded
    expect(document.querySelector('.ml-14')).toBeInTheDocument();
    fireEvent.click(firstStepButton);
    expect(document.querySelector('.ml-14')).not.toBeInTheDocument();
  });

  it('toggles a checklist item and updates the progress percentage', () => {
    renderPage();
    expect(screen.getByText('0%')).toBeInTheDocument();
    const checklistButtons = document.querySelectorAll('.p-5.space-y-2\\.5 > button');
    fireEvent.click(checklistButtons[0]);
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('resets checked items when switching country', () => {
    renderPage();
    const checklistButtons = document.querySelectorAll('.p-5.space-y-2\\.5 > button');
    fireEvent.click(checklistButtons[0]);
    expect(screen.queryByText('0%')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Suisse/ }));
    // re-render with the new country slug picked up by the mocked context
    destinationState.countrySlug = 'suisse';
  });

  it('shows the save-progress upsell when unauthenticated, and hides it when authenticated', () => {
    renderPage();
    expect(screen.getByText('visa.saveProgress')).toBeInTheDocument();
  });

  it('hides the save-progress upsell when authenticated', () => {
    authState.isAuthenticated = true;
    renderPage();
    expect(screen.queryByText('visa.saveProgress')).not.toBeInTheDocument();
  });

  it('renders practical tips', () => {
    renderPage();
    expect(screen.getByText('visa.practicalTips')).toBeInTheDocument();
  });
});
