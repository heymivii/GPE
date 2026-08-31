import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ServiceHeader from './ServiceHeader';

function Icon() {
  return <svg data-testid="service-icon" />;
}

const service = {
  id: 'logement',
  title: 'Logement',
  subtitle: 'sub',
  description: 'Trouvez votre logement',
  icon: Icon,
  color: 'blue',
  bgColor: 'bg-blue',
  guides: [],
  tips: [],
} as any;

function renderHeader(overrides = {}) {
  return render(
    <MemoryRouter>
      <ServiceHeader service={{ ...service, ...overrides }} />
    </MemoryRouter>,
  );
}

describe('ServiceHeader', () => {
  it('renders the service title and description', () => {
    renderHeader();
    expect(screen.getByRole('heading', { name: 'Logement' })).toBeInTheDocument();
    expect(screen.getByText('Trouvez votre logement')).toBeInTheDocument();
  });

  it('renders the service icon', () => {
    renderHeader();
    expect(screen.getByTestId('service-icon')).toBeInTheDocument();
  });

  it('shows the current service title in the breadcrumb', () => {
    renderHeader();
    expect(screen.getByText('Logement', { selector: 'span' })).toBeInTheDocument();
  });

  it('links the breadcrumb "Accueil" back to home', () => {
    renderHeader();
    expect(screen.getByText('Accueil').closest('a')).toHaveAttribute('href', '/');
  });

  it('links the breadcrumb "Nos services" to the services anchor', () => {
    renderHeader();
    expect(screen.getByText('Nos services').closest('a')).toHaveAttribute('href', '/#services');
  });
});
