import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExpertBadge from './ExpertBadge';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: any) => opts?.defaultValue ?? _key,
  }),
}));

describe('ExpertBadge', () => {
  it('renders nothing when the user is not an expert', () => {
    const { container } = render(<ExpertBadge user={{ isExpert: false }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the user is an expert but not yet verified', () => {
    const { container } = render(
      <ExpertBadge user={{ isExpert: true, expertVerifiedAt: null }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the badge for a verified expert user', () => {
    render(
      <ExpertBadge
        user={{ isExpert: true, expertVerifiedAt: '2026-01-01', expertTitle: 'Avocat' }}
      />,
    );
    expect(screen.getByText('Expert vérifié')).toBeInTheDocument();
    expect(screen.getByText('· Avocat')).toBeInTheDocument();
  });

  it('always renders when a bare title is given (no user prop)', () => {
    render(<ExpertBadge title="Consultant" />);
    expect(screen.getByText('Expert vérifié')).toBeInTheDocument();
    expect(screen.getByText('· Consultant')).toBeInTheDocument();
  });

  it('hides the title when showTitle is false', () => {
    render(<ExpertBadge title="Consultant" showTitle={false} />);
    expect(screen.queryByText('· Consultant')).not.toBeInTheDocument();
  });

  it('shows the average rating only when ratingCount is positive', () => {
    const { container, rerender } = render(
      <ExpertBadge title="X" averageRating={4.5} ratingCount={0} />,
    );
    expect(container.textContent).not.toContain('4.5');

    rerender(<ExpertBadge title="X" averageRating={4.5} ratingCount={3} />);
    expect(container.textContent).toContain('4.5');
  });
});
