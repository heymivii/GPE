import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MessagesPage from './MessagesPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => opts?.defaultValue ?? key,
    i18n: { language: 'fr' },
  }),
}));

const conversationsState: { data: any[]; isLoading: boolean } = { data: [], isLoading: false };
const threadState: { data: any[]; isLoading: boolean } = { data: [], isLoading: false };
const mockMutate = vi.fn();
const sendState: { isPending: boolean } = { isPending: false };
vi.mock('../../../hooks/usePrivateMessages', () => ({
  useConversations: () => conversationsState,
  useThread: (userId: number, enabled: boolean) => (enabled ? threadState : { data: [], isLoading: false }),
  useSendMessage: () => ({ mutate: mockMutate, isPending: sendState.isPending }),
  pmKeys: {
    all: ['private-messages'],
    conversations: () => ['private-messages', 'conversations'],
    thread: (userId: number) => ['private-messages', 'thread', userId],
    unread: () => ['private-messages', 'unread'],
  },
}));

const mockReportCreate = vi.fn();
vi.mock('../../../api/user-report', () => ({
  userReportApi: { create: (...a: any[]) => mockReportCreate(...a) },
}));

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('react-hot-toast', () => ({
  toast: { success: (...a: any[]) => mockToastSuccess(...a), error: (...a: any[]) => mockToastError(...a) },
}));

function renderPage(initialEntries: string[] = ['/messages']) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={initialEntries}>
        <MessagesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const conv = (overrides: any = {}) => ({
  userId: 1,
  fullName: 'Jean Dupont',
  lastMessage: 'Salut !',
  unread: 0,
  ...overrides,
});

describe('MessagesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    conversationsState.data = [];
    conversationsState.isLoading = false;
    threadState.data = [];
    threadState.isLoading = false;
    sendState.isPending = false;
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('shows a loading indicator for the conversation list', () => {
    conversationsState.isLoading = true;
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows the empty-conversations message', () => {
    renderPage();
    expect(screen.getByText('Aucune conversation.')).toBeInTheDocument();
  });

  it('renders a conversation row with an unread badge', () => {
    conversationsState.data = [conv({ unread: 3 }), conv({ userId: 2, fullName: 'Marie Curie', unread: 12 })];
    renderPage();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('shows the "pick a conversation" placeholder when nothing is selected', () => {
    renderPage();
    expect(screen.getByText('Sélectionnez une conversation.')).toBeInTheDocument();
  });

  it('selects a conversation and shows its thread', () => {
    conversationsState.data = [conv()];
    threadState.data = [
      { idPrivateMessage: 1, content: 'Salut !', mine: false, sentAt: '2026-01-01T10:00:00Z' },
      { idPrivateMessage: 2, content: 'Hello !', mine: true, sentAt: '2026-01-01T10:05:00Z' },
    ];
    renderPage();
    fireEvent.click(screen.getByText('Jean Dupont'));
    expect(screen.getAllByText('Jean Dupont').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Salut !').length).toBeGreaterThan(0);
    expect(screen.getByText('Hello !')).toBeInTheDocument();
  });

  it('shows a thread loading spinner and the "start conversation" empty state', () => {
    conversationsState.data = [conv()];
    threadState.isLoading = true;
    renderPage(['/messages?to=1&name=Jean']);
    expect(document.querySelectorAll('.animate-spin').length).toBeGreaterThan(0);
  });

  it('shows the empty-thread prompt when a conversation has no messages yet', () => {
    renderPage(['/messages?to=1&name=Jean']);
    expect(screen.getByText('Écrivez le premier message.')).toBeInTheDocument();
  });

  it('uses the ?name= param as a fallback display name for a new conversation', () => {
    renderPage(['/messages?to=42&name=Nouveau%20Contact']);
    expect(screen.getByText('Nouveau Contact')).toBeInTheDocument();
  });

  it('sends a message via the send button and clears the draft on success', () => {
    conversationsState.data = [conv()];
    renderPage(['/messages?to=1&name=Jean']);
    fireEvent.change(screen.getByPlaceholderText('Votre message…'), { target: { value: 'Bonjour' } });
    fireEvent.click(screen.getByLabelText('Envoyer'));
    expect(mockMutate).toHaveBeenCalledWith(
      { recipientId: 1, content: 'Bonjour' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('sends a message on Enter without shift', () => {
    conversationsState.data = [conv()];
    renderPage(['/messages?to=1&name=Jean']);
    const textarea = screen.getByPlaceholderText('Votre message…');
    fireEvent.change(textarea, { target: { value: 'Bonjour' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    expect(mockMutate).toHaveBeenCalled();
  });

  it('does not send an empty or whitespace-only draft', () => {
    conversationsState.data = [conv()];
    renderPage(['/messages?to=1&name=Jean']);
    expect(screen.getByLabelText('Envoyer')).toBeDisabled();
  });

  it('disables the send button while a message is pending', () => {
    conversationsState.data = [conv()];
    sendState.isPending = true;
    renderPage(['/messages?to=1&name=Jean']);
    fireEvent.change(screen.getByPlaceholderText('Votre message…'), { target: { value: 'Bonjour' } });
    expect(screen.getByLabelText('Envoyer')).toBeDisabled();
  });

  it('reports a member successfully', async () => {
    mockReportCreate.mockResolvedValue({});
    conversationsState.data = [conv()];
    renderPage(['/messages?to=1&name=Jean']);
    fireEvent.click(screen.getByTitle('Signaler ce membre'));
    expect(mockReportCreate).toHaveBeenCalledWith({ reportedUserId: 1, reason: 'harassment' });
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalledWith('Membre signalé'));
  });

  it('shows an error toast when reporting a member fails', async () => {
    mockReportCreate.mockRejectedValue(new Error('boom'));
    conversationsState.data = [conv()];
    renderPage(['/messages?to=1&name=Jean']);
    fireEvent.click(screen.getByTitle('Signaler ce membre'));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Erreur'));
  });

  it('deselects the conversation via the mobile back button', () => {
    conversationsState.data = [conv()];
    renderPage(['/messages?to=1&name=Jean']);
    fireEvent.click(screen.getByLabelText('Retour'));
    expect(screen.getByText('Sélectionnez une conversation.')).toBeInTheDocument();
  });

  describe('experts vs buddies', () => {
    const mixed = () => [
      conv({ userId: 1, fullName: 'Jean Dupont' }),
      conv({ userId: 2, fullName: 'Eve Avocate', isExpert: true, expertTitle: 'Avocate', expertCountry: 'Canada' }),
      conv({
        userId: 3,
        fullName: 'Marie Buddy',
        buddyTopics: [
          { label: 'Assurance maladie & santé', country: 'Canada' },
          { label: 'Compte bancaire', country: 'Canada' },
        ],
      }),
    ];

    it('shows an Expert badge and a Buddy badge in the conversation list', () => {
      conversationsState.data = mixed();
      renderPage();
      expect(screen.getByText('Expert')).toBeInTheDocument();
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });

    it('filters the list to experts only', () => {
      conversationsState.data = mixed();
      renderPage();
      fireEvent.click(screen.getByText('Experts'));
      expect(screen.getByText('Eve Avocate')).toBeInTheDocument();
      expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();
      expect(screen.queryByText('Marie Buddy')).not.toBeInTheDocument();
    });

    it('filters the list to buddies only, then back to all', () => {
      conversationsState.data = mixed();
      renderPage();
      fireEvent.click(screen.getByText('Buddies'));
      expect(screen.getByText('Marie Buddy')).toBeInTheDocument();
      expect(screen.queryByText('Eve Avocate')).not.toBeInTheDocument();
      fireEvent.click(screen.getByText('Tous'));
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    it('shows the buddy topics with their destination under the thread header', () => {
      conversationsState.data = mixed();
      renderPage(['/messages?to=3&name=Marie']);
      // Un seul pays → il s'affiche en préfixe, une seule fois.
      expect(screen.getByText(/À propos de : Canada —/)).toBeInTheDocument();
      expect(screen.getByText(/Assurance maladie & santé/)).toBeInTheDocument();
    });

    it('suffixes each topic with its country when destinations differ', () => {
      conversationsState.data = [
        conv({
          userId: 3,
          fullName: 'Marie Buddy',
          buddyTopics: [
            { label: 'Visa', country: 'Canada' },
            { label: 'Logement', country: 'Portugal' },
          ],
        }),
      ];
      renderPage(['/messages?to=3&name=Marie']);
      expect(screen.getByText(/Visa \(Canada\)/)).toBeInTheDocument();
      expect(screen.getByText(/Logement \(Portugal\)/)).toBeInTheDocument();
    });

    it('shows the expert title and country next to the thread header name', () => {
      conversationsState.data = mixed();
      renderPage(['/messages?to=2&name=Eve']);
      expect(screen.getByText(/Avocate · Canada/)).toBeInTheDocument();
    });
  });
});
