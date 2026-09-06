import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CityDetailPage from './CityDetailPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'fr' } }),
}));

// L'onglet coût de la vie a son propre rendu (déjà testé ailleurs).
vi.mock('../components/CostOfLivingTab', () => ({
  default: ({ cities }: { cities: unknown[] }) => (
    <div data-testid="cost-tab">{cities.length} ville(s)</div>
  ),
}));

const mockDetail = vi.fn();
vi.mock('../hooks/useCityDetail', () => ({ useCityDetail: () => mockDetail() }));

const city = {
  idCity: 1,
  name: 'Paris',
  population: 2161000,
  timezone: 'UTC',
  isCapital: true,
  imageUrl: 'https://example.com/paris.jpg',
  country: { countryName: 'France' },
};

const base = {
  city,
  isLoading: false,
  isError: false,
  costOfLiving: { currency: { code: 'EUR' } },
  isCostOfLivingLoading: false,
  qualityOfLife: null,
  propertyInvestment: null,
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/destinations/france/villes/1']}>
      <Routes>
        <Route path="/destinations/:countrySlug/villes/:cityId" element={<CityDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CityDetailPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('affiche l’identité de la ville', () => {
    mockDetail.mockReturnValue(base);
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Paris' })).toBeInTheDocument();
    expect(screen.getByText(/2 161 000/)).toBeInTheDocument();
    expect(screen.getByText('cityDetail.capital')).toBeInTheDocument();
  });

  it('renvoie vers la page du pays', () => {
    mockDetail.mockReturnValue(base);
    renderPage();

    expect(screen.getByRole('link', { name: 'France' })).toHaveAttribute(
      'href',
      '/destinations/france',
    );
  });

  it('affiche les indices de qualité de vie quand ils existent', () => {
    mockDetail.mockReturnValue({
      ...base,
      qualityOfLife: {
        qualityOfLife: 138.69,
        safety: 42.12,
        healthCare: null,
        purchasingPower: null,
        pollution: null,
        climate: null,
        trafficCommuteTime: null,
        costOfLiving: null,
        propertyPriceToIncome: null,
        sourceUrl: 'https://www.numbeo.com/quality-of-life/in/Paris',
      },
    });
    renderPage();

    expect(screen.getByText('cityDetail.qualityOfLife')).toBeInTheDocument();
    expect(screen.getByText('138,69')).toBeInTheDocument();
    expect(screen.getByText('42,12')).toBeInTheDocument();
  });

  it('masque une tuile dont l’indice est absent plutôt que d’afficher un vide', () => {
    // Numbeo ne publie pas tous les indices pour toutes les villes.
    mockDetail.mockReturnValue({
      ...base,
      qualityOfLife: {
        qualityOfLife: 100,
        safety: null,
        healthCare: null,
        purchasingPower: null,
        pollution: null,
        climate: null,
        trafficCommuteTime: null,
        costOfLiving: null,
        propertyPriceToIncome: null,
        sourceUrl: null,
      },
    });
    renderPage();

    expect(screen.getByText('cityDetail.qol.global')).toBeInTheDocument();
    expect(screen.queryByText('cityDetail.qol.safety')).not.toBeInTheDocument();
  });

  it('affiche les indicateurs immobiliers quand ils existent', () => {
    mockDetail.mockReturnValue({
      ...base,
      propertyInvestment: {
        priceToIncomeRatio: 17.27,
        mortgageAsPctIncome: null,
        loanAffordabilityIndex: null,
        priceToRentCityCentre: null,
        priceToRentOutside: null,
        sourceUrl: 'https://www.numbeo.com/property-investment/in/Paris',
      },
    });
    renderPage();

    expect(screen.getByText('cityDetail.property')).toBeInTheDocument();
    expect(screen.getByText('17,27')).toBeInTheDocument();
  });

  it('masque les sections qualité de vie et immobilier sans données', () => {
    mockDetail.mockReturnValue(base);
    renderPage();

    expect(screen.queryByText('cityDetail.qualityOfLife')).not.toBeInTheDocument();
    expect(screen.queryByText('cityDetail.property')).not.toBeInTheDocument();
    expect(screen.getByText('cityDetail.partialData')).toBeInTheDocument();
  });

  it('affiche un état d’erreur avec un retour vers le pays', () => {
    mockDetail.mockReturnValue({ ...base, city: undefined, isError: true });
    renderPage();

    expect(screen.getByText('cityDetail.notFound')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'cityDetail.backToCountry' })).toHaveAttribute(
      'href',
      '/destinations/france',
    );
  });
});
