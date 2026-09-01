import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BuddyContactButtons from './BuddyContactButtons';
import { buddyContactApi } from '../../../api/buddy-contact';

vi.mock('../../../api/buddy-contact', () => ({
  buddyContactApi: { sendRequest: vi.fn() },
}));

const mockedSendRequest = vi.mocked(buddyContactApi.sendRequest);

function renderButtons(overrides: Partial<Parameters<typeof BuddyContactButtons>[0]> = {}) {
  return render(
    <MemoryRouter>
      <BuddyContactButtons
        recipientId={2}
        recipientFirstname="Jane"
        procedureId={5}
        procedureTitle="Visa long séjour"
        countryId={10}
        {...overrides}
      />
    </MemoryRouter>,
  );
}

describe('BuddyContactButtons', () => {
  beforeEach(() => {
    mockedSendRequest.mockReset();
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
});
