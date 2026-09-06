import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmailVerificationBanner from './EmailVerificationBanner';

const mockAuth = vi.fn();
vi.mock('../hooks/useAuth', () => ({ useAuth: () => mockAuth() }));

vi.mock('../api/auth', () => ({
  authApi: { resendVerification: vi.fn() },
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('react-hot-toast', () => ({
  toast: { success: (m: string) => toastSuccess(m), error: (m: string) => toastError(m) },
}));

import { authApi } from '../api/auth';
const mockedResend = vi.mocked(authApi.resendVerification);

describe('EmailVerificationBanner', () => {
  beforeEach(() => vi.clearAllMocks());

  it("s'affiche pour un compte dont l'adresse n'est pas confirmée", () => {
    mockAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'tene@skywalk.com', emailVerified: false },
    });

    render(<EmailVerificationBanner />);

    expect(screen.getByText(/Confirmez votre adresse email/)).toBeInTheDocument();
    expect(screen.getByText('tene@skywalk.com')).toBeInTheDocument();
  });

  it("reste invisible quand l'adresse est confirmée", () => {
    mockAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'a@b.com', emailVerified: true },
    });

    const { container } = render(<EmailVerificationBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('reste invisible pour un visiteur non connecté', () => {
    mockAuth.mockReturnValue({ isAuthenticated: false, user: null });
    const { container } = render(<EmailVerificationBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("n'alarme pas les comptes existants dont le flag est absent (anciens comptes)", () => {
    // La migration marque les comptes antérieurs comme vérifiés ; si le champ
    // manque (réponse d'API plus ancienne), on n'affiche rien plutôt que
    // d'accuser à tort une adresse valide.
    mockAuth.mockReturnValue({ isAuthenticated: true, user: { email: 'a@b.com' } });
    const { container } = render(<EmailVerificationBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renvoie le lien de confirmation au clic', async () => {
    mockAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'a@b.com', emailVerified: false },
    });
    mockedResend.mockResolvedValue({ message: 'Email de confirmation envoyé' });

    render(<EmailVerificationBanner />);
    await userEvent.click(screen.getByRole('button', { name: /Renvoyer/ }));

    await waitFor(() => expect(mockedResend).toHaveBeenCalled());
    expect(toastSuccess).toHaveBeenCalledWith('Email de confirmation envoyé');
  });

  it("affiche l'erreur renvoyée par l'API si l'envoi échoue", async () => {
    mockAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'a@b.com', emailVerified: false },
    });
    mockedResend.mockRejectedValue({
      response: { data: { message: 'Trop de tentatives' } },
    });

    render(<EmailVerificationBanner />);
    await userEvent.click(screen.getByRole('button', { name: /Renvoyer/ }));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('Trop de tentatives'));
  });
});
