import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import ProfilePage from './ProfilePage';
import { useProfile, useUpdateProfile, useDeleteAccount } from '../../../hooks/useProfile';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) =>
      opts && typeof opts === 'object' ? `${key}:${JSON.stringify(opts)}` : key,
  }),
}));

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('../../../hooks/useProfile', () => ({
  useProfile: vi.fn(),
  useUpdateProfile: vi.fn(),
  useDeleteAccount: vi.fn(),
}));

vi.mock('../../onboarding/ui/MultiPillSelect', () => ({
  default: ({ values }: any) => <div data-testid="multi-pill-select">{values.join(',')}</div>,
}));

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseProfile = vi.mocked(useProfile);
const mockedUseUpdateProfile = vi.mocked(useUpdateProfile);
const mockedUseDeleteAccount = vi.mocked(useDeleteAccount);

const baseProfile = {
  id: 1,
  email: 'jane@example.com',
  fullName: 'Jane Doe',
  firstName: 'Jane',
  lastName: 'Doe',
  age: 28,
  status: 'employee',
  languageLevel: 'B2',
  motherTongue: 'Français',
  spokenLanguages: ['Anglais', 'Espagnol'],
  countryOriginId: 1,
};

const countries = [{ idCountry: 1, countryName: 'France' }, { idCountry: 2, countryName: 'Canada' }];

const mutateAsync = vi.fn();
const deleteMutateAsync = vi.fn();

function setup(overrides: any = {}) {
  const {
    isLoading = false,
    error = null,
    updatePending = false,
    updateError = false,
    deletePending = false,
  } = overrides;
  const profile = 'profile' in overrides ? overrides.profile : baseProfile;
  mockedUseProfile.mockReturnValue({ data: profile, isLoading, error } as any);
  mockedUseQuery.mockReturnValue({ data: countries } as any);
  mockedUseUpdateProfile.mockReturnValue({
    mutateAsync,
    isPending: updatePending,
    isError: updateError,
  } as any);
  mockedUseDeleteAccount.mockReturnValue({
    mutateAsync: deleteMutateAsync,
    isPending: deletePending,
  } as any);
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading spinner while the profile is loading', () => {
    setup({ isLoading: true, profile: undefined });
    const { container } = render(<ProfilePage />);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('shows an error message when the profile fails to load', () => {
    setup({ error: new Error('boom'), profile: undefined });
    render(<ProfilePage />);
    expect(screen.getByText('profilePage.loadingError')).toBeInTheDocument();
  });

  it('renders nothing when there is no profile and no error', () => {
    setup({ profile: undefined });
    const { container } = render(<ProfilePage />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the profile summary in read mode', () => {
    setup();
    render(<ProfilePage />);
    expect(screen.getByRole('heading', { name: 'Jane Doe' })).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getAllByText('France').length).toBeGreaterThan(0);
    expect(screen.getByText('Anglais')).toBeInTheDocument();
  });

  it('switches to edit mode and pre-fills the form', () => {
    setup();
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('profilePage.edit'));
    expect(screen.getByLabelText('profilePage.firstName')).toHaveValue('Jane');
    expect(screen.getByLabelText('profilePage.lastName')).toHaveValue('Doe');
  });

  it('cancels editing and returns to read mode', () => {
    setup();
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('profilePage.edit'));
    fireEvent.click(screen.getByText('profilePage.cancel'));
    expect(screen.getByText('profilePage.edit')).toBeInTheDocument();
  });

  it('submits the edited form and shows a success toast', async () => {
    mutateAsync.mockResolvedValue(undefined);
    setup();
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('profilePage.edit'));
    fireEvent.change(screen.getByLabelText('profilePage.firstName'), { target: { value: 'Janet' } });
    fireEvent.click(screen.getByText('profilePage.save'));
    expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Janet' }));
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it('shows an error banner when the update mutation failed', () => {
    setup({ updateError: true });
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('profilePage.edit'));
    expect(screen.getByText('profilePage.updateError')).toBeInTheDocument();
  });

  it('shows the delete confirmation, then confirms and deletes the account', async () => {
    deleteMutateAsync.mockResolvedValue(undefined);
    setup();
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('profilePage.deleteAccount'));
    expect(screen.getByText('profilePage.deleteConfirm')).toBeInTheDocument();
    fireEvent.click(screen.getByText('profilePage.confirm'));
    await vi.waitFor(() => expect(deleteMutateAsync).toHaveBeenCalled());
  });

  it('cancels the delete confirmation', () => {
    setup();
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('profilePage.deleteAccount'));
    fireEvent.click(screen.getByText('profilePage.cancel'));
    expect(screen.queryByText('profilePage.deleteConfirm')).not.toBeInTheDocument();
  });

  it('shows a fallback message for languages when none are provided', () => {
    setup({ profile: { ...baseProfile, spokenLanguages: [] } });
    render(<ProfilePage />);
    expect(screen.getByText('profilePage.noLanguages')).toBeInTheDocument();
  });
});
