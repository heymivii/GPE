import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WorldMap, { territoryAt, detachTerritories } from './WorldMap';
import { SUPPORTED_COUNTRIES, type SupportedCountry } from '../../../data/supportedCountries';

const navigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigate };
});

// La carte lit désormais la liste servie par l'API ; on la pilote par test.
const hookState: { countries: SupportedCountry[] } = { countries: SUPPORTED_COUNTRIES };
vi.mock('../../../hooks/useSupportedCountries', () => ({
  useSupportedCountries: () => hookState,
}));

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
    hookState.countries = SUPPORTED_COUNTRIES;
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

describe('liste des pays servie par l’API', () => {
  // La carte lisait la constante SUPPORTED_COUNTRIES figée dans le code : un
  // pays archivé depuis l'admin restait « Disponible », un pays activé
  // n'apparaissait pas. Aujourd'hui les deux listes coïncident par chance.
  const canada: SupportedCountry = {
    code: 'CA', iso3: 'CAN', isoNumeric: '124', name: 'Canada', slug: 'canada',
    flag: '🇨🇦', i18nKey: 'countries.canada', apiCity: 'Toronto', apiCountryName: 'Canada',
  };

  it('allume un pays activé depuis l’admin, même hors liste de départ', () => {
    hookState.countries = [...SUPPORTED_COUNTRIES, canada];
    renderMap();
    expect(screen.getByTestId('map-country-CA')).toBeInTheDocument();
  });

  it('n’allume plus un pays archivé depuis l’admin', () => {
    hookState.countries = SUPPORTED_COUNTRIES.filter((c) => c.code !== 'JP');
    renderMap();
    expect(screen.queryByTestId('map-country-JP')).not.toBeInTheDocument();
    expect(screen.getByTestId('map-country-FR')).toBeInTheDocument();
  });

describe('detachTerritories', () => {
  // Retour de recette : « enlève la Guyane pour l'instant ». Elle est un
  // polygone de la feature France dans le fond de carte.
  const carre = (lon: number, lat: number) => [[[lon, lat], [lon + 1, lat], [lon + 1, lat + 1], [lon, lat + 1], [lon, lat]]];
  const france = {
    type: 'Feature' as const,
    id: 250,
    properties: { name: 'France' },
    geometry: { type: 'MultiPolygon' as const, coordinates: [carre(2, 48), carre(-53, 4)] },
  };

  it('sort la Guyane du tracé de la France, en feature grise à part', () => {
    const out = detachTerritories([france]);
    expect(out).toHaveLength(2);
    expect(out[0].geometry.type).toBe('Polygon'); // la métropole seule
    expect(out[1]).toMatchObject({ id: '250-Guyane', properties: { name: 'Guyane', detached: true } });
  });

  it('laisse intacts les pays sans territoire listé', () => {
    const japon = { ...france, id: 392, properties: { name: 'Japan' } };
    expect(detachTerritories([japon])).toEqual([japon]);
  });

  it('dessine la Guyane dans la couche grise, plus dans la France', () => {
    renderMap();
    expect(screen.getByTestId('map-territory-Guyane')).toBeInTheDocument();
    expect(screen.getByTestId('map-country-FR')).toBeInTheDocument();
  });
});
});
