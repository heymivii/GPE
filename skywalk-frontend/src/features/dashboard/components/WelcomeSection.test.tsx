import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeSection from './WelcomeSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('WelcomeSection', () => {
  it('shows the profile-incomplete notice by default', () => {
    render(<WelcomeSection />);
    expect(screen.getByText('welcome.profileIncomplete')).toBeInTheDocument();
  });

  it('hides the notice when the profile is complete', () => {
    render(<WelcomeSection isProfileComplete />);
    expect(screen.queryByText('welcome.profileIncomplete')).not.toBeInTheDocument();
  });

  it('calls onStartProject when the CTA is clicked', () => {
    const onStartProject = vi.fn();
    render(<WelcomeSection onStartProject={onStartProject} />);
    fireEvent.click(screen.getByText('welcome.startAdventure'));
    expect(onStartProject).toHaveBeenCalled();
  });
});
