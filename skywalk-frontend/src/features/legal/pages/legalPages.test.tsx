import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AboutPage from './AboutPage';
import LegalNoticePage from './LegalNoticePage';
import PrivacyPage from './PrivacyPage';
import TermsPage from './TermsPage';
import Footer from '../../../components/Footer';
import { router } from '../../../routes';

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('pages d’information et légales', () => {
  it.each([
    ['À propos', <AboutPage key="a" />, 'À propos de SkyWalk'],
    ['Mentions légales', <LegalNoticePage key="l" />, 'Mentions légales'],
    ['Confidentialité', <PrivacyPage key="p" />, 'Politique de confidentialité'],
    ['CGU', <TermsPage key="t" />, "Conditions générales d'utilisation"],
  ])('%s affiche son titre', (_label, element, titre) => {
    wrap(element);
    expect(screen.getByRole('heading', { level: 1, name: titre })).toBeInTheDocument();
  });

  it('les mentions légales nomment l’hébergeur, exigé par la loi', () => {
    wrap(<LegalNoticePage />);
    expect(screen.getByText(/Vercel/)).toBeInTheDocument();
    expect(screen.getByText(/Heroku/)).toBeInTheDocument();
  });

  it('signale visiblement ce qui reste à compléter, sans rien inventer', () => {
    // Une immatriculation inventée serait pire qu'une mention incomplète.
    wrap(<LegalNoticePage />);
    expect(screen.getAllByText('à compléter').length).toBeGreaterThan(0);
  });

  it('la confidentialité décrit les cookies réellement déposés', () => {
    wrap(<PrivacyPage />);
    expect(screen.getByText(/access_token/)).toBeInTheDocument();
    expect(screen.getByText(/httpOnly/i)).toBeInTheDocument();
  });

  it('les CGU rappellent que les informations sont indicatives', () => {
    wrap(<TermsPage />);
    expect(screen.getByText(/administrations compétentes font foi/)).toBeInTheDocument();
  });
});

describe('liens du pied de page', () => {
  it('ne pointe vers aucune route inexistante', () => {
    // Retour de recette : « À propos, Mentions légales, Confidentialité, CGU
    // ne fonctionnent pas, on a une erreur 404 ».
    const { container } = wrap(<Footer />);
    const internes = [...container.querySelectorAll('a')]
      .map((a) => a.getAttribute('href') ?? '')
      .filter((h) => h.startsWith('/'));

    type Node = { path?: string; index?: boolean; children?: Node[] };
    const declarees = new Set<string>();
    const collect = (list: Node[], prefix = '') => {
      for (const r of list) {
        const path = r.path?.startsWith('/') ? r.path : `${prefix}/${r.path ?? ''}`;
        const clean = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
        if (r.path || r.index) declarees.add(clean);
        if (r.children) collect(r.children, r.path?.startsWith('/') ? r.path : clean);
      }
    };
    collect(router.routes as Node[]);

    // Les routes dynamiques (« services/:category ») doivent matcher leurs
    // instances concrètes (« /services/emploi »).
    const motifs = [...declarees].map(
      (d) => new RegExp('^' + d.replace(/:[^/]+/g, '[^/]+') + '$'),
    );
    const morts = internes.filter((h) => {
      const base = h.split('?')[0].replace(/\/$/, '') || '/';
      return !motifs.some((m) => m.test(base));
    });
    expect(morts).toEqual([]);
  });
});
