import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key,
  }),
}));

// `useRouteError` n'existe que dans le rôle « errorElement » ; hors routeur
// d'erreur il renvoie undefined. On pilote sa valeur par test.
const routeError: { value: unknown } = { value: undefined };
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useRouteError: () => routeError.value };
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <NotFoundPage />
    </MemoryRouter>,
  );
}

describe('NotFoundPage', () => {
  it('annonce une 404 et rappelle l’adresse demandée', () => {
    routeError.value = undefined;
    renderAt('/documents');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cette page n’existe pas');
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('/documents')).toBeInTheDocument();
  });

  it('propose une sortie plutôt qu’une impasse', () => {
    routeError.value = undefined;
    renderAt('/inconnu');

    const cibles = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(cibles).toEqual(expect.arrayContaining(['/destinations', '/search', '/forum', '/']));
  });

  it('bascule sur un message d’erreur technique dans le rôle errorElement', () => {
    routeError.value = new Error('boom');
    renderAt('/projects/2');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Une erreur est survenue');
    // L'URL n'a pas de sens ici : ce n'est pas elle qui est en cause.
    expect(screen.queryByText('/projects/2')).not.toBeInTheDocument();
  });
});
