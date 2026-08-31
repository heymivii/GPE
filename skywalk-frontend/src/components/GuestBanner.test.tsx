import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GuestBanner from './GuestBanner';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function renderBanner() {
  return render(
    <MemoryRouter>
      <GuestBanner />
    </MemoryRouter>,
  );
}

describe('GuestBanner', () => {
  it('shows the signup CTA', () => {
    renderBanner();
    expect(screen.getByText('common.guestBanner.createAccount').closest('a')).toHaveAttribute(
      'href',
      '/auth/register',
    );
  });

  it('dismisses itself when closed', () => {
    renderBanner();
    fireEvent.click(screen.getByLabelText('common.guestBanner.close'));
    expect(screen.queryByText('common.guestBanner.createAccount')).not.toBeInTheDocument();
  });
});
