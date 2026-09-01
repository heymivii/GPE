import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SettingsPage from './SettingsPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => opts?.defaultValue ?? key,
    i18n: { language: 'fr', changeLanguage: mockChangeLanguage },
  }),
}));
const mockChangeLanguage = vi.fn();

const currencyState: { displayCurrency: string } = { displayCurrency: 'EUR' };
const mockSetDisplayCurrency = vi.fn((code: string) => {
  currencyState.displayCurrency = code;
});
vi.mock('../../../contexts/CurrencyContext', () => ({
  useCurrency: () => ({
    displayCurrency: currencyState.displayCurrency,
    setDisplayCurrency: mockSetDisplayCurrency,
  }),
  DISPLAY_CURRENCIES: [
    { code: 'EUR', symbol: '€', nameKey: 'currencies.EUR' },
    { code: 'USD', symbol: '$', nameKey: 'currencies.USD' },
  ],
}));

const authState: { user: any } = { user: { fullName: 'Jean Dupont', email: 'jean@example.com' } };
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: authState.user }),
}));

const meState: { data: any } = { data: null };
vi.mock('../../../api/user', () => ({
  userApi: { getProfile: () => Promise.resolve(meState.data) },
}));

const mockUpdateMyProfile = vi.fn().mockResolvedValue({});
vi.mock('../../../api/experts', () => ({
  expertsApi: { updateMyProfile: (...args: any[]) => mockUpdateMyProfile(...args) },
}));

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('react-hot-toast', () => ({
  toast: { success: (...a: any[]) => mockToastSuccess(...a), error: (...a: any[]) => mockToastError(...a) },
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currencyState.displayCurrency = 'EUR';
    meState.data = null;
    authState.user = { fullName: 'Jean Dupont', email: 'jean@example.com' };
  });

  it('renders the user initial, name, and email', () => {
    renderPage();
    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('jean@example.com')).toBeInTheDocument();
  });

  it('changes the display currency on click', () => {
    renderPage();
    fireEvent.click(screen.getByText('$ USD'));
    expect(mockSetDisplayCurrency).toHaveBeenCalledWith('USD');
  });

  it('changes the language on click', () => {
    renderPage();
    fireEvent.click(screen.getByText('English'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('does not show the expert section for a non-verified user', async () => {
    meState.data = { isExpert: false };
    renderPage();
    await waitFor(() => expect(screen.queryByText('Profil expert')).not.toBeInTheDocument());
  });

  it('shows and pre-fills the expert section for a verified expert', async () => {
    meState.data = { isExpert: true, expertVerifiedAt: '2026-01-01', expertTitle: 'Avocat', expertBio: 'Ma bio' };
    renderPage();
    expect(await screen.findByText('Profil expert')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Titre')).toHaveValue('Avocat');
    expect(screen.getByPlaceholderText('Bio')).toHaveValue('Ma bio');
  });

  it('saves the expert profile and shows a success toast', async () => {
    meState.data = { isExpert: true, expertVerifiedAt: '2026-01-01' };
    renderPage();
    await screen.findByText('Profil expert');
    fireEvent.change(screen.getByPlaceholderText('Titre'), { target: { value: 'Notaire' } });
    fireEvent.click(screen.getByText('Enregistrer'));
    await waitFor(() => expect(mockUpdateMyProfile).toHaveBeenCalledWith({ expertTitle: 'Notaire', expertBio: '' }));
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalled());
  });

  it('shows an error toast when saving the expert profile fails', async () => {
    meState.data = { isExpert: true, expertVerifiedAt: '2026-01-01' };
    mockUpdateMyProfile.mockRejectedValueOnce(new Error('fail'));
    renderPage();
    await screen.findByText('Profil expert');
    fireEvent.click(screen.getByText('Enregistrer'));
    await waitFor(() => expect(mockToastError).toHaveBeenCalled());
  });

  it('links to the profile page', () => {
    renderPage();
    expect(screen.getByText('Modifier mon profil').closest('a')).toHaveAttribute('href', '/profile');
  });
});
