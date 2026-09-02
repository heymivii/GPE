import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BuddyContactButtons from './BuddyContactButtons';
import { buddyContactApi } from '../../../api/buddy-contact';

vi.mock('../../../api/buddy-contact', () => ({
  buddyContactApi: { sendRequest: vi.fn(), getMyRequests: vi.fn() },
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { idUser: 1, firstName: 'Moi' } }),
}));

const mockedSendRequest = vi.mocked(buddyContactApi.sendRequest);
const mockedGetMyRequests = vi.mocked(buddyContactApi.getMyRequests);

// Une demande de moi (id 1) vers Jane (id 2) pour la démarche 5.
const request = (status: string) =>
  ({
    id: 77,
    status,
    sender: { idUser: 1, firstName: 'Moi' },
    recipient: { idUser: 2, firstName: 'Jane' },
    procedure: { idAdminProcedure: 5, procedureType: 'Visa long séjour' },
  }) as any;

function renderButtons(overrides: Partial<Parameters<typeof BuddyContactButtons>[0]> = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <BuddyContactButtons
          recipientId={2}
          recipientFirstname="Jane"
          procedureId={5}
          procedureTitle="Visa long séjour"
          countryId={10}
          {...overrides}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('BuddyContactButtons', () => {
  beforeEach(() => {
    mockedSendRequest.mockReset();
    mockedGetMyRequests.mockReset();
    mockedGetMyRequests.mockResolvedValue([]);
  });

  it('sends a buddy contact request and shows the pending state on success', async () => {
    mockedSendRequest.mockResolvedValue({} as any);
    renderButtons();

    fireEvent.click(screen.getByText('Message prive'));

    expect(mockedSendRequest).toHaveBeenCalledWith(2, 5);
    await waitFor(() =>
      expect(screen.getByText('Demande envoyee - en attente de reponse')).toBeInTheDocument(),
    );
  });

  it('shows an error and keeps the buttons visible when the request fails', async () => {
    mockedSendRequest.mockRejectedValue(new Error('network down'));
    renderButtons();

    fireEvent.click(screen.getByText('Message prive'));

    await waitFor(() =>
      expect(screen.getByText('Erreur - reessaie plus tard')).toBeInTheDocument(),
    );
    expect(screen.getByText('Message prive')).toBeInTheDocument();
  });

  it('builds a prefilled "Via le forum" link scoped to the procedure and country', () => {
    renderButtons();
    const link = screen.getByText('Via le forum').closest('a')!;
    const href = link.getAttribute('href')!;
    expect(href).toContain('/forum/new?');
    expect(href).toContain('procedureId=5');
    expect(href).toContain('countryId=10');
    expect(href).toContain(encodeURIComponent('Question sur "Visa long séjour"'));
    expect(href).toContain(encodeURIComponent('@Jane '));
  });

  // L'état vit côté serveur : au rechargement, une demande encore en attente
  // doit réafficher « en attente » sans requérir un nouveau clic.
  it('shows the waiting state on mount when a pending request already exists', async () => {
    mockedGetMyRequests.mockResolvedValue([request('pending')]);
    renderButtons();

    await waitFor(() =>
      expect(screen.getByText('Demande envoyee - en attente de reponse')).toBeInTheDocument(),
    );
    expect(screen.queryByText('Message prive')).not.toBeInTheDocument();
  });

  it('replaces the contact buttons with an open-conversation link once accepted', async () => {
    mockedGetMyRequests.mockResolvedValue([request('accepted')]);
    renderButtons();

    const link = await screen.findByText('Ouvrir la conversation');
    expect(link.closest('a')).toHaveAttribute('href', '/messages?to=2&name=Jane');
    expect(screen.queryByText('Message prive')).not.toBeInTheDocument();
    expect(screen.queryByText('Via le forum')).not.toBeInTheDocument();
  });

  it('lets the user send a new request after a declined or expired one', async () => {
    mockedGetMyRequests.mockResolvedValue([request('declined')]);
    renderButtons();

    expect(await screen.findByText('Message prive')).toBeInTheDocument();
  });

  it('ignores requests from other senders or other procedures', async () => {
    mockedGetMyRequests.mockResolvedValue([
      { ...request('pending'), sender: { idUser: 99, firstName: 'Autre' } },
      { ...request('accepted'), procedure: { idAdminProcedure: 42, procedureType: 'Autre' } },
    ]);
    renderButtons();

    expect(await screen.findByText('Message prive')).toBeInTheDocument();
  });
});
