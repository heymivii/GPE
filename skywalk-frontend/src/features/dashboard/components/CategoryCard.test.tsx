import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import CategoryCard from './CategoryCard';

describe('CategoryCard', () => {
  it('renders the title, subtitle, description and CTA link', () => {
    render(
      <MemoryRouter>
        <CategoryCard
          title="Emploi"
          subtitle="Trouvez un poste"
          description="Découvrez les offres"
          ctaText="Explorer"
          ctaLink="/services/emploi"
          icon={Briefcase}
          backgroundColor="bg-blue-50"
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('Emploi')).toBeInTheDocument();
    expect(screen.getByText('Trouvez un poste')).toBeInTheDocument();
    expect(screen.getByText('Découvrez les offres')).toBeInTheDocument();
    expect(screen.getByText('Explorer').closest('a')).toHaveAttribute('href', '/services/emploi');
  });
});
