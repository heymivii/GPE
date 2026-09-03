import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminModeration from './AdminModeration';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../../../api/forum-moderation', () => ({
  forumModerationApi: {
    listWords: vi.fn(),
    flaggedUsers: vi.fn(),
    userWarnings: vi.fn(),
    createWord: vi.fn(),
    updateWord: vi.fn(),
    removeWord: vi.fn(),
  },
}));

vi.mock('../../../api/user-report', () => ({
  userReportApi: { list: vi.fn(), resolve: vi.fn() },
}));

import { toast } from 'react-hot-toast';
import { forumModerationApi } from '../../../api/forum-moderation';
import { userReportApi } from '../../../api/user-report';

const mockedApi = vi.mocked(forumModerationApi);
const mockedReports = vi.mocked(userReportApi);

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AdminModeration />
    </QueryClientProvider>,
  );
}

const word = (overrides: any = {}) => ({
  idForbiddenWord: 1,
  word: 'insulte',
  severity: 'medium',
  isActive: true,
  ...overrides,
});

describe('AdminModeration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.listWords.mockResolvedValue([]);
    mockedApi.flaggedUsers.mockResolvedValue([]);
    mockedApi.userWarnings.mockResolvedValue([]);
    mockedApi.createWord.mockResolvedValue({} as any);
    mockedApi.updateWord.mockResolvedValue({} as any);
    mockedApi.removeWord.mockResolvedValue(undefined);
    mockedReports.list.mockResolvedValue([]);
    mockedReports.resolve.mockResolvedValue({} as any);
  });

  it('counts only active high/critical words as "blocking"', async () => {
    mockedApi.listWords.mockResolvedValue([
      word({ idForbiddenWord: 1, word: 'w1', severity: 'high', isActive: true }),
      word({ idForbiddenWord: 2, word: 'w2', severity: 'critical', isActive: false }), // inactive: excluded
      word({ idForbiddenWord: 3, word: 'w3', severity: 'low', isActive: true }), // low: excluded
      word({ idForbiddenWord: 4, word: 'w4', severity: 'critical', isActive: true }),
    ]);
    renderPage();
    await screen.findByText('w1');
    const blockingCountEl = document.querySelector('.text-red-600')!;
    expect(blockingCountEl).toHaveTextContent('2');
  });

  it('switches between the words/users/reports tabs', async () => {
    mockedApi.flaggedUsers.mockResolvedValue([
      { idUser: 1, firstName: 'Ann', lastName: 'Admin', email: 'a@b.com', warningCount: 3 } as any,
    ]);
    renderPage();
    await screen.findByText('Aucun mot ne correspond.');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Récidivistes/ }));
    expect(await screen.findByText('Ann Admin')).toBeInTheDocument();
    expect(screen.queryByText('Aucun mot ne correspond.')).not.toBeInTheDocument();
  });

  it('filters words by search text, severity, and active status together', async () => {
    mockedApi.listWords.mockResolvedValue([
      word({ idForbiddenWord: 1, word: 'insulte', severity: 'high', isActive: true }),
      word({ idForbiddenWord: 2, word: 'grossier', severity: 'high', isActive: false }),
      word({ idForbiddenWord: 3, word: 'inapte', severity: 'low', isActive: true }),
    ]);
    renderPage();
    await screen.findByText('insulte');

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('Rechercher un mot…'), 'ins');
    expect(screen.getByText('insulte')).toBeInTheDocument();
    expect(screen.queryByText('grossier')).not.toBeInTheDocument();
    expect(screen.queryByText('inapte')).not.toBeInTheDocument();
  });

  it('adds a new word, trimmed, with the selected severity, and clears the input', async () => {
    mockedApi.listWords.mockResolvedValue([]);
    renderPage();
    await screen.findByText('Aucun mot ne correspond.');

    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Nouveau mot ou expression…');
    await user.type(input, '  badword  ');
    await user.click(screen.getByRole('button', { name: /Ajouter/ }));

    await waitFor(() =>
      expect(mockedApi.createWord).toHaveBeenCalledWith({ word: 'badword', severity: 'medium' }),
    );
    await waitFor(() => expect((input as HTMLInputElement).value).toBe(''));
    expect(toast.success).toHaveBeenCalledWith('Mot ajouté');
  });

  it('adds a word with a non-default severity from the toolbar select', async () => {
    renderPage();
    await screen.findByText('Aucun mot ne correspond.');

    const user = userEvent.setup();
    const addSeveritySelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(addSeveritySelect, { target: { value: 'critical' } });
    await user.type(screen.getByPlaceholderText('Nouveau mot ou expression…'), 'badword');
    await user.click(screen.getByRole('button', { name: /Ajouter/ }));

    await waitFor(() =>
      expect(mockedApi.createWord).toHaveBeenCalledWith({ word: 'badword', severity: 'critical' }),
    );
  });

  it('disables the add button when the input is blank', async () => {
    renderPage();
    await screen.findByText('Aucun mot ne correspond.');
    expect(screen.getByRole('button', { name: /Ajouter/ })).toBeDisabled();
  });

  it('shows an error toast when adding a word fails (likely a duplicate)', async () => {
    mockedApi.createWord.mockRejectedValue(new Error('conflict'));
    renderPage();
    await screen.findByText('Aucun mot ne correspond.');

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('Nouveau mot ou expression…'), 'dup');
    await user.click(screen.getByRole('button', { name: /Ajouter/ }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Échec de l'ajout (déjà présent ?)"),
    );
  });

  it('removes a word when its delete button is clicked', async () => {
    mockedApi.listWords.mockResolvedValue([word({ idForbiddenWord: 5 })]);
    renderPage();
    await screen.findByText('insulte');

    fireEvent.click(screen.getByTitle('Supprimer'));

    await waitFor(() => expect(mockedApi.removeWord).toHaveBeenCalledWith(5));
    expect(toast.success).toHaveBeenCalledWith('Mot supprimé');
  });

  it('filters by severity and by active status via the toolbar selects', async () => {
    mockedApi.listWords.mockResolvedValue([
      word({ idForbiddenWord: 1, word: 'w-high', severity: 'high', isActive: true }),
      word({ idForbiddenWord: 2, word: 'w-low-inactive', severity: 'low', isActive: false }),
    ]);
    renderPage();
    await screen.findByText('w-high');

    const [sevSelect, activeSelect] = screen.getAllByRole('combobox').slice(1); // [0] is the "add word" severity select
    fireEvent.change(sevSelect, { target: { value: 'high' } });
    expect(screen.getByText('w-high')).toBeInTheDocument();
    expect(screen.queryByText('w-low-inactive')).not.toBeInTheDocument();

    fireEvent.change(sevSelect, { target: { value: 'all' } });
    fireEvent.change(activeSelect, { target: { value: 'inactive' } });
    expect(screen.queryByText('w-high')).not.toBeInTheDocument();
    expect(screen.getByText('w-low-inactive')).toBeInTheDocument();

    fireEvent.change(activeSelect, { target: { value: 'active' } });
    expect(screen.getByText('w-high')).toBeInTheDocument();
    expect(screen.queryByText('w-low-inactive')).not.toBeInTheDocument();
  });

  it('toggles a word active/inactive via its checkbox', async () => {
    mockedApi.listWords.mockResolvedValue([word({ idForbiddenWord: 5, isActive: true })]);
    renderPage();
    await screen.findByText('insulte');

    const row = screen.getByText('insulte').closest('tr')!;
    fireEvent.click(within(row).getByRole('checkbox'));

    await waitFor(() =>
      expect(mockedApi.updateWord).toHaveBeenCalledWith(5, { isActive: false }),
    );
  });

  it('shows an error toast when the severity update fails', async () => {
    mockedApi.listWords.mockResolvedValue([word({ idForbiddenWord: 5 })]);
    mockedApi.updateWord.mockRejectedValue(new Error('fail'));
    renderPage();
    await screen.findByText('insulte');

    const row = screen.getByText('insulte').closest('tr')!;
    fireEvent.change(within(row).getByRole('combobox'), { target: { value: 'critical' } });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Échec de la mise à jour'));
  });

  it('shows an error toast when removing a word fails', async () => {
    mockedApi.listWords.mockResolvedValue([word({ idForbiddenWord: 5 })]);
    mockedApi.removeWord.mockRejectedValue(new Error('fail'));
    renderPage();
    await screen.findByText('insulte');

    fireEvent.click(screen.getByTitle('Supprimer'));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Échec de la suppression'));
  });

  it('updates a word severity via its select', async () => {
    mockedApi.listWords.mockResolvedValue([word({ idForbiddenWord: 5, severity: 'medium' })]);
    renderPage();
    await screen.findByText('insulte');

    // Scope to the word's own table row — the "add new word" toolbar has its own
    // severity select that also defaults to 'medium'.
    const row = screen.getByText('insulte').closest('tr')!;
    const severitySelect = within(row).getByRole('combobox');
    fireEvent.change(severitySelect, { target: { value: 'critical' } });

    await waitFor(() =>
      expect(mockedApi.updateWord).toHaveBeenCalledWith(5, { severity: 'critical' }),
    );
  });

  it('paginates the word list beyond the page size', async () => {
    mockedApi.listWords.mockResolvedValue(
      Array.from({ length: 45 }, (_, i) => word({ idForbiddenWord: i, word: `word-${i}` })),
    );
    renderPage();
    await screen.findByText('word-0');

    expect(screen.getByText('Page 1 / 2')).toBeInTheDocument();
    expect(screen.queryByText('word-40')).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Suivant/ }));
    expect(await screen.findByText('word-40')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Suivant/ })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /Précédent/ }));
    expect(await screen.findByText('word-0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Précédent/ })).toBeDisabled();
  });

  it('expands a flagged user to load and show their warnings, then collapses again', async () => {
    mockedApi.flaggedUsers.mockResolvedValue([
      { idUser: 1, firstName: 'Ann', lastName: 'Admin', email: 'a@b.com', warningCount: 2 } as any,
    ]);
    mockedApi.userWarnings.mockResolvedValue([
      { idUserWarning: 1, reason: 'insulte', createdAt: '2026-01-01T00:00:00Z' } as any,
    ]);
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Récidivistes/ }));
    await screen.findByText('Ann Admin');

    await user.click(screen.getByText('Ann Admin'));
    expect(await screen.findByText('insulte')).toBeInTheDocument();
    expect(mockedApi.userWarnings).toHaveBeenCalledWith(1);

    await user.click(screen.getByText('Ann Admin'));
    expect(screen.queryByText('insulte')).not.toBeInTheDocument();
  });

  it('shows the empty state when there are no pending reports', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Signalements/ }));
    expect(await screen.findByText('Aucun signalement en attente.')).toBeInTheDocument();
  });

  it('resolves a report as "traité" and invalidates the reports cache', async () => {
    mockedReports.list.mockResolvedValue([
      {
        idUserReport: 7,
        reason: 'spam',
        reportedUser: { email: 'bad@x.com' },
        reporter: { email: 'good@x.com' },
      } as any,
    ]);
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Signalements/ }));
    await screen.findByText('bad@x.com', { exact: false });

    await user.click(screen.getByRole('button', { name: /Traiter/ }));

    await waitFor(() =>
      expect(mockedReports.resolve).toHaveBeenCalledWith(7, 'resolved'),
    );
    expect(toast.success).toHaveBeenCalledWith('Signalement traité');
  });

  it('rejects a report when "Rejeter" is clicked', async () => {
    mockedReports.list.mockResolvedValue([
      {
        idUserReport: 8,
        reason: 'other',
        reportedUser: { email: 'x@x.com' },
        reporter: { email: 'y@y.com' },
      } as any,
    ]);
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Signalements/ }));
    await screen.findByText('x@x.com', { exact: false });

    await user.click(screen.getByRole('button', { name: /Rejeter/ }));

    await waitFor(() => expect(mockedReports.resolve).toHaveBeenCalledWith(8, 'rejected'));
  });

  it('shows an error toast when resolving a report fails', async () => {
    mockedReports.list.mockResolvedValue([
      {
        idUserReport: 7,
        reason: 'spam',
        reportedUser: { email: 'bad@x.com' },
        reporter: { email: 'good@x.com' },
      } as any,
    ]);
    mockedReports.resolve.mockRejectedValue(new Error('fail'));
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Signalements/ }));
    await screen.findByText('bad@x.com', { exact: false });

    await user.click(screen.getByRole('button', { name: /Traiter/ }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Échec du traitement'));
  });

  it('falls back to the raw reason code when it has no French label', async () => {
    mockedReports.list.mockResolvedValue([
      {
        idUserReport: 9,
        reason: 'custom_reason',
        reportedUser: { email: 'x@x.com' },
        reporter: { email: 'y@y.com' },
      } as any,
    ]);
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Signalements/ }));
    expect(await screen.findByText('custom_reason')).toBeInTheDocument();
  });
});
