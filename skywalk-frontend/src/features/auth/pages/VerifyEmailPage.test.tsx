import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import VerifyEmailPage from './VerifyEmailPage';

vi.mock('../../../api/auth', () => ({
  authApi: { verifyEmail: vi.fn() },
}));

const refreshUser = vi.fn().mockResolvedValue(undefined);
vi.mock('../../../hooks/useAuth', () => ({ useAuth: () => ({ refreshUser }) }));

import { authApi } from '../../../api/auth';
const mockedVerify = vi.mocked(authApi.verifyEmail);

function renderPage(search: string) {
  return render(
    <MemoryRouter initialEntries={[`/auth/verify-email${search}`]}>
      <Routes>
        <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('VerifyEmailPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('confirme l’adresse avec le token de l’URL', async () => {
    mockedVerify.mockResolvedValue({ message: 'Adresse email confirmée' });

    renderPage('?token=abc123');

    expect(await screen.findByText('Adresse confirmée')).toBeInTheDocument();
    expect(mockedVerify).toHaveBeenCalledWith('abc123');
  });

  it('rafraîchit l’utilisateur en session pour faire disparaître le bandeau', async () => {
    mockedVerify.mockResolvedValue({ message: 'ok' });

    renderPage('?token=abc123');

    await waitFor(() => expect(refreshUser).toHaveBeenCalled());
  });

  it('affiche le message d’erreur de l’API pour un lien expiré', async () => {
    mockedVerify.mockRejectedValue({
      response: { data: { message: 'Lien de confirmation invalide ou expiré' } },
    });

    renderPage('?token=expired');

    expect(
      await screen.findByText('Lien de confirmation invalide ou expiré'),
    ).toBeInTheDocument();
  });

  it('signale un lien sans token sans appeler l’API', async () => {
    renderPage('');

    expect(await screen.findByText(/token est absent/)).toBeInTheDocument();
    expect(mockedVerify).not.toHaveBeenCalled();
  });

  it('n’envoie le token qu’une fois malgré le double montage de React en dev', async () => {
    mockedVerify.mockResolvedValue({ message: 'ok' });

    renderPage('?token=abc123');

    await screen.findByText('Adresse confirmée');
    expect(mockedVerify).toHaveBeenCalledTimes(1);
  });
});
