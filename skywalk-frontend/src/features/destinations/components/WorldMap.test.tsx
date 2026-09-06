import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WorldMap from './WorldMap';

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
});
