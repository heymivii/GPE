import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WelcomeSection from './WelcomeSection';

/** Le bloc « profil incomplet » contient un <Link> : routeur requis. */
const renderSection = (props: Record<string, unknown> = {}) =>
  render(
    <MemoryRouter>
      <WelcomeSection {...props} />
    </MemoryRouter>,
  );

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('WelcomeSection', () => {
  it('shows the profile-incomplete notice by default', () => {
    renderSection();
    expect(screen.getByText('welcome.profileIncomplete')).toBeInTheDocument();
  });

  it('hides the notice when the profile is complete', () => {
    renderSection({ isProfileComplete: true });
    expect(screen.queryByText('welcome.profileIncomplete')).not.toBeInTheDocument();
  });

  it('calls onStartProject when the CTA is clicked', () => {
    const onStartProject = vi.fn();
    renderSection({ onStartProject });
    fireEvent.click(screen.getByText('welcome.startAdventure'));
    expect(onStartProject).toHaveBeenCalled();
  });

  it('propose un lien pour aller compléter le profil (retour de recette)', () => {
    // Le message constatait le problème sans donner le moyen de le régler.
    renderSection();
    const link = screen.getByRole('link', { name: /completeProfileCta/ });
    expect(link).toHaveAttribute('href', '/profile?edit=1');
  });

  it('ne propose pas ce lien quand le profil est complet', () => {
    renderSection({ isProfileComplete: true });
    expect(screen.queryByRole('link', { name: /completeProfileCta/ })).not.toBeInTheDocument();
  });
});
