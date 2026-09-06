import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ExpertsHighlight from './ExpertsHighlight';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: { defaultValue?: string }) => o?.defaultValue ?? k,
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

  it('met en avant les experts vérifiés avec un lien vers la page', () => {
    mockExperts.mockReturnValue({ data: [expert()], isLoading: false });
    render_();

    expect(screen.getByText('Yuki Tanaka')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voir les experts/ })).toHaveAttribute(
      'href',
      '/experts',
    );
  });

  it('traduit le pays de l’expert', () => {
    mockExperts.mockReturnValue({ data: [expert()], isLoading: false });
    render_();

    expect(screen.getByText(/Japon/)).toBeInTheDocument();
    expect(screen.queryByText(/Japan/)).not.toBeInTheDocument();
  });

  it('parle des experts en général, sans annoncer un nombre', () => {
    // Le nombre d'experts varie : une phrase chiffrée vieillit mal et se
    // contredit dès qu'un expert est ajouté ou révoqué.
    mockExperts.mockReturnValue({ data: [expert(), expert({ idUser: 2 })], isLoading: false });
    render_();

    expect(screen.getByText(/Des experts vérifiés par notre équipe/)).toBeInTheDocument();
    expect(screen.queryByText(/^2 experts/)).not.toBeInTheDocument();
  });

  it('n’affiche que trois experts en aperçu', () => {
    mockExperts.mockReturnValue({
      data: [1, 2, 3, 4, 5].map((i) => expert({ idUser: i, fullName: `Expert ${i}` })),
      isLoading: false,
    });
    render_();

    expect(screen.getByText('Expert 1')).toBeInTheDocument();
    expect(screen.queryByText('Expert 4')).not.toBeInTheDocument();
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
