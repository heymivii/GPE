import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ServicesIndexPage from './ServicesIndexPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, fallback?: string) => fallback ?? k }),
}));

vi.mock('../../../components/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

function DummyIcon() {
  return <svg data-testid="icon" />;
}

vi.mock('../../../data/services-config', () => ({
  getServicesForIndex: () => [
    { id: 'emploi', title: 'Emploi', description: 'Find a job', icon: DummyIcon },
    { id: 'business', title: 'Business', description: 'Coming soon service', icon: DummyIcon, comingSoon: true },
  ],
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <ServicesIndexPage />
    </MemoryRouter>,
  );
}

describe('ServicesIndexPage', () => {
  it('renders a clickable card linking to the service page', () => {
    renderPage();
    const link = screen.getByText('Emploi').closest('a')!;
    expect(link).toHaveAttribute('href', '/services/emploi');
  });

  it('renders a coming-soon service as a non-clickable, locked card', () => {
    renderPage();
    expect(screen.getByText('Business').closest('a')).toBeNull();
    expect(screen.getByText('À venir')).toBeInTheDocument();
  });
});
