import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import AuthPromptCard from './AuthPromptCard';

function renderCard(props: Partial<React.ComponentProps<typeof AuthPromptCard>> = {}) {
  return render(
    <MemoryRouter>
      <AuthPromptCard
        icon={Sparkles}
        title="Créez votre projet"
        description="Suivez votre expatriation"
        ctaText="Créer un compte"
        ctaLink="/auth/register"
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('AuthPromptCard', () => {
  it('renders the title, description and CTA link', () => {
    renderCard();
    expect(screen.getByText('Créez votre projet')).toBeInTheDocument();
    expect(screen.getByText('Suivez votre expatriation')).toBeInTheDocument();
    expect(screen.getByText('Créer un compte').closest('a')).toHaveAttribute('href', '/auth/register');
  });

  it('lists the benefits when provided', () => {
    renderCard({ benefits: ['Suivi personnalisé', 'Offres exclusives'] });
    expect(screen.getByText('Suivi personnalisé')).toBeInTheDocument();
    expect(screen.getByText('Offres exclusives')).toBeInTheDocument();
  });

  it('omits the benefits list when empty', () => {
    const { container } = renderCard();
    expect(container.querySelector('ul')).toBeNull();
  });
});
