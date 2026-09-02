import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterForm from './RegisterForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockRegister = vi.fn();
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

vi.mock('../../../api/country', () => ({
  countryApi: { getAll: vi.fn() },
}));

import { countryApi } from '../../../api/country';
const mockedGetAll = vi.mocked(countryApi.getAll);

function renderForm(initialEntry = '/auth/register') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <RegisterForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetAll.mockResolvedValue([{ idCountry: 1, countryName: 'France' } as any]);
    mockRegister.mockResolvedValue(undefined);
  });

  it('pre-fills the age field from the ?age= query param', () => {
    renderForm('/auth/register?age=25');
    expect(screen.getByPlaceholderText('auth.register.age')).toHaveValue(25);
  });

  it('populates the origin-country select from the API', async () => {
    renderForm();
    await waitFor(() => expect(screen.getByText('France')).toBeInTheDocument());
  });

  it('shows the display-name banner only once both names are filled', async () => {
    renderForm();
    const user = userEvent.setup();
    expect(screen.queryByText('auth.register.displayName')).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('auth.register.firstName'), 'Jean');
    expect(screen.queryByText('auth.register.displayName')).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('auth.register.lastName'), 'Dupont');
    expect(screen.getByText('auth.register.displayName')).toBeInTheDocument();
  });

  it('rejects submission when passwords do not match', async () => {
    renderForm();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('auth.register.firstName'), 'Jean');
    await user.type(screen.getByPlaceholderText('auth.register.lastName'), 'Dupont');
    await user.type(screen.getByPlaceholderText('auth.register.email'), 'jean@x.com');
    await user.type(screen.getByPlaceholderText('auth.register.password'), 'Secret123!');
    await user.type(screen.getByPlaceholderText('auth.register.confirmPassword'), 'Different1!');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'auth.register.submit' }));

    expect(await screen.findByText('auth.register.passwordMismatch')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('rejects submission when the names are blank/whitespace-only', async () => {
    renderForm();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('auth.register.firstName'), '   ');
    await user.type(screen.getByPlaceholderText('auth.register.lastName'), '   ');
    await user.type(screen.getByPlaceholderText('auth.register.email'), 'jean@x.com');
    await user.type(screen.getByPlaceholderText('auth.register.password'), 'Secret123!');
    await user.type(screen.getByPlaceholderText('auth.register.confirmPassword'), 'Secret123!');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'auth.register.submit' }));

    expect(await screen.findByText('auth.register.nameRequired')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('includes the selected origin country in the registration payload', async () => {
    renderForm();
    const user = userEvent.setup();
    await waitFor(() => expect(screen.getByText('France')).toBeInTheDocument());

    await user.selectOptions(screen.getByRole('combobox'), 'France');
    await user.type(screen.getByPlaceholderText('auth.register.firstName'), 'Jean');
    await user.type(screen.getByPlaceholderText('auth.register.lastName'), 'Dupont');
    await user.type(screen.getByPlaceholderText('auth.register.email'), 'jean@x.com');
    await user.type(screen.getByPlaceholderText('auth.register.password'), 'Secret123!');
    await user.type(screen.getByPlaceholderText('auth.register.confirmPassword'), 'Secret123!');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'auth.register.submit' }));

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({ countryOriginId: 1 }),
      ),
    );
  });

  it('registers with trimmed names, parsed age, and the selected country, then redirects', async () => {
    renderForm('/auth/register?redirect=%2Fdashboard');
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('auth.register.firstName'), '  Jean ');
    await user.type(screen.getByPlaceholderText('auth.register.lastName'), ' Dupont ');
    await user.type(screen.getByPlaceholderText('auth.register.email'), 'jean@x.com');
    await user.type(screen.getByPlaceholderText('auth.register.age'), '30');
    await user.type(screen.getByPlaceholderText('auth.register.password'), 'Secret123!');
    await user.type(screen.getByPlaceholderText('auth.register.confirmPassword'), 'Secret123!');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'auth.register.submit' }));

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'jean@x.com',
          firstName: 'Jean',
          lastName: 'Dupont',
          age: 30,
        }),
      ),
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  });

  it('shows the API error message on failure', async () => {
    mockRegister.mockRejectedValue({ response: { data: { message: 'Email already used' } } });
    renderForm();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('auth.register.firstName'), 'Jean');
    await user.type(screen.getByPlaceholderText('auth.register.lastName'), 'Dupont');
    await user.type(screen.getByPlaceholderText('auth.register.email'), 'jean@x.com');
    await user.type(screen.getByPlaceholderText('auth.register.password'), 'Secret123!');
    await user.type(screen.getByPlaceholderText('auth.register.confirmPassword'), 'Secret123!');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'auth.register.submit' }));

    expect(await screen.findByText('Email already used')).toBeInTheDocument();
  });

  describe('password strength meter', () => {
    it('is hidden when the password field is empty', () => {
      renderForm();
      expect(screen.queryByText('auth.register.strength')).not.toBeInTheDocument();
    });

    it('rates a short, simple password as weak', async () => {
      renderForm();
      const user = userEvent.setup();
      await user.type(screen.getByPlaceholderText('auth.register.password'), 'abc');
      expect(screen.getByText('auth.register.weak')).toBeInTheDocument();
    });

    it('rates a long password with all character classes as strong', async () => {
      renderForm();
      const user = userEvent.setup();
      await user.type(screen.getByPlaceholderText('auth.register.password'), 'Secret123!');
      expect(screen.getByText('auth.register.strong')).toBeInTheDocument();
    });

    it('marks each satisfied criterion in green', async () => {
      renderForm();
      const user = userEvent.setup();
      await user.type(screen.getByPlaceholderText('auth.register.password'), 'Secret123!');
      expect(screen.getByText('8+')).toHaveClass('text-green-600');
      expect(screen.getByText('A')).toHaveClass('text-green-600');
      expect(screen.getByText('a')).toHaveClass('text-green-600');
      expect(screen.getByText('0')).toHaveClass('text-green-600');
      expect(screen.getByText('!')).toHaveClass('text-green-600');
    });

    it('leaves unmet criteria gray', async () => {
      renderForm();
      const user = userEvent.setup();
      await user.type(screen.getByPlaceholderText('auth.register.password'), 'alllowercase');
      expect(screen.getByText('A')).toHaveClass('text-gray-400'); // no uppercase
      expect(screen.getByText('0')).toHaveClass('text-gray-400'); // no digit
      expect(screen.getByText('!')).toHaveClass('text-gray-400'); // no special char
    });
  });
});
