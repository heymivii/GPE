import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BuddySidebarCard from './BuddySidebarCard';

// Le pays d'origine passe par la traduction ; on la pilote par test.
const traduction: Record<string, string> = { Germany: 'Allemagne' };
vi.mock('../../../hooks/useCountryName', () => ({
  useCountryName: () => (name: string) => traduction[name] ?? name,
}));

vi.mock('../../../api/buddies', () => ({ getBuddies: vi.fn() }));
vi.mock('./BuddyContactButtons', () => ({
  default: ({ recipientId }: { recipientId: number }) => (
    <span data-testid={`contact-${recipientId}`} />
  ),
}));

import { getBuddies } from '../../../api/buddies';

const mockedGetBuddies = vi.mocked(getBuddies);

const steps = [
  { adminProcedureId: 1, title: 'Visa & entrée' },
  { adminProcedureId: 2, title: 'Logement' },
];

function renderCard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <BuddySidebarCard steps={steps} countryId={10} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const buddy = (idUser: number, firstname: string, completedAt: string) => ({
  idUser,
  firstname,
  originCountry: 'France',
  completedAt,
});

describe('BuddySidebarCard', () => {
  beforeEach(() => {
    mockedGetBuddies.mockReset();
  });

  it("agrège les buddies de toutes les étapes dans une seule carte, avec l'étape en légende", async () => {
    mockedGetBuddies.mockImplementation(async (procedureId: number) =>
      procedureId === 1 ? [buddy(5, 'Aminata', '2026-08-20')] : [buddy(6, 'Marie', '2026-08-25')],
    );

    renderCard();

    expect(await screen.findByText(/Ils sont passés par là/)).toBeInTheDocument();
    expect(screen.getByText('Aminata')).toBeInTheDocument();
    expect(screen.getByText('Marie')).toBeInTheDocument();
    expect(screen.getByText(/Visa & entrée ·/)).toBeInTheDocument();
    expect(screen.getByText(/Logement ·/)).toBeInTheDocument();
    expect(screen.getByTestId('contact-5')).toBeInTheDocument();
  });

  it('limite l’aperçu à 3 lignes et déplie la liste complète au clic', async () => {
    mockedGetBuddies.mockImplementation(async (procedureId: number) =>
      procedureId === 1
        ? [buddy(1, 'Una', '2026-08-01'), buddy(2, 'Deux', '2026-08-02'), buddy(3, 'Tri', '2026-08-03')]
        : [buddy(4, 'Quat', '2026-08-04'), buddy(5, 'Cinq', '2026-08-05')],
    );

    renderCard();

    const toggle = await screen.findByText('Voir les 5 buddies');
    // Aperçu : les 3 plus récents seulement
    expect(screen.getByText('Cinq')).toBeInTheDocument();
    expect(screen.queryByText('Una')).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.getByText('Una')).toBeInTheDocument();
    expect(screen.getByText('Réduire')).toBeInTheDocument();
  });

  it('regroupe les étapes d’une même personne sur une seule ligne', async () => {
    mockedGetBuddies.mockImplementation(async (procedureId: number) =>
      procedureId === 1 ? [buddy(7, 'Marie', '2026-08-25')] : [buddy(7, 'Marie', '2026-08-20')],
    );

    renderCard();

    expect(await screen.findByText('Marie')).toBeInTheDocument();
    expect(screen.getAllByText('Marie')).toHaveLength(1);
    // Étape la plus récente en légende + compteur des autres
    expect(screen.getByText(/Visa & entrée \+1 ·/)).toBeInTheDocument();
  });

  it('invite à être le premier quand personne n’a complété d’étape', async () => {
    mockedGetBuddies.mockResolvedValue([]);

    renderCard();

    expect(
      await screen.findByText(/Personne n'a encore partagé son expérience/),
    ).toBeInTheDocument();
  });

  // Retour de recette : « pourquoi il y a Germany ? » — c'est le pays d'ORIGINE du
  // buddy, affiché tel quel en anglais. Il passe désormais par la traduction.
  it('traduit le pays d’origine du buddy', async () => {
    mockedGetBuddies.mockResolvedValue([{ ...buddy(7, 'Tene', '2026-08-01'), originCountry: 'Germany' }]);
    renderCard();
    expect(await screen.findByText(/– Allemagne/)).toBeInTheDocument();
    expect(screen.queryByText(/Germany/)).not.toBeInTheDocument();
  });
});
