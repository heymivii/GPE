import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import AdminExperts from './AdminExperts';
import { useVerifyExpert, useRevokeExpert } from '../../../hooks/useExperts';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, opts?: any) => opts?.defaultValue ?? key }),
}));

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('../../../hooks/useExperts', () => ({
  useVerifyExpert: vi.fn(),
  useRevokeExpert: vi.fn(),
}));

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseVerifyExpert = vi.mocked(useVerifyExpert);
const mockedUseRevokeExpert = vi.mocked(useRevokeExpert);

const verifyMutate = vi.fn();
const revokeMutate = vi.fn();

const users = [
  { idUser: 1, fullName: 'Alice Martin', email: 'alice@example.com', isExpert: false },
  {
    idUser: 2,
    fullName: 'Bob Dupont',
    email: 'bob@example.com',
    isExpert: true,
    expertVerifiedAt: '2026-01-01T00:00:00Z',
    expertTitle: 'Avocat en immigration',
  },
];

const countries = [{ idCountry: 1, countryName: 'France' }, { idCountry: 2, countryName: 'Canada' }];

function setup({ isLoading = false, usersList = users }: { isLoading?: boolean; usersList?: any[] } = {}) {
  mockedUseQuery.mockImplementation((opts: any) => {
    if (opts.queryKey[0] === 'admin-users') return { data: { data: usersList }, isLoading } as any;
    return { data: countries } as any;
  });
  mockedUseVerifyExpert.mockReturnValue({ mutate: verifyMutate, isPending: false } as any);
  mockedUseRevokeExpert.mockReturnValue({ mutate: revokeMutate, isPending: false } as any);
}

describe('AdminExperts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading spinner while users are loading', () => {
    setup({ isLoading: true });
    const { container } = render(<AdminExperts />);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('lists every user with the correct verify/revoke action', () => {
    setup();
    render(<AdminExperts />);
    expect(screen.getByText('Alice Martin')).toBeInTheDocument();
    expect(screen.getByText('Avocat en immigration')).toBeInTheDocument();
  });

  it('filters the list by name or email', () => {
    setup();
    render(<AdminExperts />);
    fireEvent.change(screen.getByPlaceholderText('Rechercher un membre…'), { target: { value: 'bob' } });
    expect(screen.queryByText('Alice Martin')).not.toBeInTheDocument();
    expect(screen.getByText('Bob Dupont')).toBeInTheDocument();
  });

  it('opens the verification form and submits it', () => {
    setup();
    render(<AdminExperts />);
    fireEvent.click(screen.getByText('Vérifier'));
    fireEvent.change(screen.getByPlaceholderText('Titre (ex. Avocat en immigration)'), {
      target: { value: 'Consultant visa' },
    });
    fireEvent.click(screen.getByText('Confirmer la vérification'));
    expect(verifyMutate).toHaveBeenCalledWith(
      { userId: 1, dto: { expertTitle: 'Consultant visa', expertBio: undefined, expertCountryId: undefined } },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('shows a success toast once verification succeeds', () => {
    setup();
    render(<AdminExperts />);
    fireEvent.click(screen.getByText('Vérifier'));
    fireEvent.click(screen.getByText('Confirmer la vérification'));
    const onSuccess = verifyMutate.mock.calls[0][1].onSuccess;
    onSuccess();
    expect(toast.success).toHaveBeenCalledWith('Expert vérifié');
  });

  it('cancels the verification form', () => {
    setup();
    render(<AdminExperts />);
    fireEvent.click(screen.getByText('Vérifier'));
    fireEvent.click(screen.getByText('Annuler'));
    expect(screen.queryByPlaceholderText('Titre (ex. Avocat en immigration)')).not.toBeInTheDocument();
  });

  it('revokes an expert and shows a success toast', () => {
    setup();
    render(<AdminExperts />);
    fireEvent.click(screen.getByText('Révoquer'));
    expect(revokeMutate).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
    const onSuccess = revokeMutate.mock.calls[0][1].onSuccess;
    onSuccess();
    expect(toast.success).toHaveBeenCalledWith('Vérification révoquée');
  });

  it('shows an error toast when verification fails', () => {
    setup();
    render(<AdminExperts />);
    fireEvent.click(screen.getByText('Vérifier'));
    fireEvent.click(screen.getByText('Confirmer la vérification'));
    const onError = verifyMutate.mock.calls[0][1].onError;
    onError();
    expect(toast.error).toHaveBeenCalledWith('Une erreur est survenue');
  });
});
