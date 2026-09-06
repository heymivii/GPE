import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ExpertsHighlight from './ExpertsHighlight';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    // Mock fidèle sur deux points d'i18next : le repli sur defaultValue et
    // l'interpolation des {{variables}} — sans elle on testerait un gabarit brut.
    t: (k: string, o?: Record<string, unknown>) => {
      const template = (o?.defaultValue as string) ?? k;
      return template.replace(/\{\{(\w+)\}\}/g, (_, name) => String(o?.[name] ?? ''));
    },
    i18n: { language: 'fr' },
  }),
}));

const mockExperts = vi.fn();
vi.mock('../../../hooks/useExperts', () => ({ useExperts: () => mockExperts() }));
vi.mock('../../../hooks/useCountryName', () => ({
  useCountryName: () => (n?: string | null) => (n === 'Japan' ? 'Japon' : n ?? ''),
}));

const expert = (o: Record<string, unknown> = {}) => ({
  idUser: 1,
  fullName: 'Yuki Tanaka',
  expertTitle: 'Immigration lawyer',
  expertBio: null,
  expertCountry: { idCountry: 3, countryName: 'Japan' },
  expertVerifiedAt: '2026-01-01',
  ...o,
});

const render_ = () =>
  render(
    <MemoryRouter>
      <ExpertsHighlight />
    </MemoryRouter>,
  );

describe('ExpertsHighlight', () => {
  beforeEach(() => vi.clearAllMocks());

  it('annonce l’accompagnement et renvoie vers la page experts', () => {
    mockExperts.mockReturnValue({ data: [expert()], isLoading: false });
    render_();

    expect(screen.getByText(/Des experts vérifiés par notre équipe/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voir les experts/ })).toHaveAttribute(
      'href',
      '/experts',
    );
  });

  it('ne nomme aucun expert en particulier', () => {
    // Le vivier change : mettre des personnes en vitrine deviendrait arbitraire
    // dès qu'il y en a davantage.
    mockExperts.mockReturnValue({
      data: [expert(), expert({ idUser: 2, fullName: 'Marc Lefevre' })],
      isLoading: false,
    });
    render_();

    expect(screen.queryByText('Yuki Tanaka')).not.toBeInTheDocument();
    expect(screen.queryByText('Marc Lefevre')).not.toBeInTheDocument();
  });

  it('n’annonce aucun nombre d’experts', () => {
    mockExperts.mockReturnValue({
      data: [1, 2, 3, 4, 5].map((i) => expert({ idUser: i })),
      isLoading: false,
    });
    const { container } = render_();

    expect(container.textContent).not.toMatch(/\d+\s*experts?/i);
  });

  it('cite les pays couverts, dédoublonnés et traduits', () => {
    mockExperts.mockReturnValue({
      data: [
        expert(),
        expert({ idUser: 2, expertCountry: { idCountry: 1, countryName: 'France' } }),
        expert({ idUser: 3, expertCountry: { idCountry: 3, countryName: 'Japan' } }),
      ],
      isLoading: false,
    });
    render_();

    // « Japan » apparaît deux fois côté données : une seule fois à l'écran, traduit.
    expect(screen.getByText(/France, Japon/)).toBeInTheDocument();
    expect(screen.queryByText(/Japan/)).not.toBeInTheDocument();
  });

  it('reste invisible sans expert vérifié', () => {
    // Mieux vaut ne rien promettre qu'annoncer un accompagnement vide.
    mockExperts.mockReturnValue({ data: [], isLoading: false });
    const { container } = render_();

    expect(container).toBeEmptyDOMElement();
  });

  it('reste invisible pendant le chargement', () => {
    mockExperts.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render_();

    expect(container).toBeEmptyDOMElement();
  });
});
