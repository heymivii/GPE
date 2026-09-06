import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WorldMap, { territoryAt } from './WorldMap';

const navigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigate };
});

function renderMap() {
  return render(
    <MemoryRouter>
      <WorldMap />
    </MemoryRouter>,
  );
}

describe('WorldMap', () => {
  beforeEach(() => {
    navigate.mockReset();
  });

  it('illumine les 4 destinations couvertes et affiche la légende', () => {
    renderMap();

    for (const code of ['FR', 'US', 'JP', 'CH']) {
      expect(screen.getByTestId(`map-country-${code}`)).toBeInTheDocument();
    }
    expect(screen.getByText(/Disponible \(4\)/)).toBeInTheDocument();
    expect(screen.getByText(/Bientôt/)).toBeInTheDocument();
  });

  it('navigue vers la page du pays au clic sur une destination couverte', () => {
    renderMap();

    fireEvent.click(screen.getByTestId('map-country-FR'));
    expect(navigate).toHaveBeenCalledWith('/destinations/france');

    fireEvent.click(screen.getByTestId('map-country-CH'));
    expect(navigate).toHaveBeenCalledWith('/destinations/suisse');
  });

  it('nomme chaque destination sur la carte, sans dépendre du survol', () => {
    renderMap();

    for (const nom of ['France', 'États-Unis', 'Japon', 'Suisse']) {
      expect(screen.getByText(nom)).toBeInTheDocument();
    }
  });

  it('dessine une épingle contrastée par destination', () => {
    // Un point clair cerclé de teal disparaissait sur le teal du pays :
    // l'épingle est sombre avec un contour blanc.
    const { container } = renderMap();

    expect(container.querySelectorAll('path[fill="#14425A"]')).toHaveLength(4);
  });

  describe('territoryAt', () => {
    // Les données cartographiques ne nomment que le pays : la Guyane fait
    // partie de la feature « France ». Sans ce repérage, la survoler annonçait
    // « France — disponible » alors que nos données sont métropolitaines.
    it('reconnaît la Guyane dans la feature France', () => {
      expect(territoryAt('FR', -53, 4)).toBe('Guyane');
    });

    it('ne signale rien sur la France métropolitaine', () => {
      expect(territoryAt('FR', 2.35, 48.86)).toBeUndefined(); // Paris
      expect(territoryAt('FR', 9.1, 42.1)).toBeUndefined(); // Corse
    });

    it("n'invente pas de territoire pour les pays qui n'en déclarent pas", () => {
      // L'Alaska reste « États-Unis » : personne ne s'en étonne sur une carte.
      expect(territoryAt('US', -150, 64)).toBeUndefined();
      expect(territoryAt('JP', 139, 35)).toBeUndefined();
    });
  });
});
