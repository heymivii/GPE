import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TrustBadge from './TrustBadge';

describe('TrustBadge', () => {
  it('renders a plain span with no URL', () => {
    render(<TrustBadge />);
    const el = screen.getByText('Source officielle vérifiée');
    expect(el.closest('a')).toBeNull();
  });

  it('renders as a link with the hostname shown when a URL is given', () => {
    render(<TrustBadge url="https://www.service-public.fr/some/path" />);
    expect(screen.getByText('· service-public.fr')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://www.service-public.fr/some/path');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('strips the leading www. from the displayed host', () => {
    render(<TrustBadge url="https://www.gouv.fr" />);
    expect(screen.getByText('· gouv.fr')).toBeInTheDocument();
  });

  it('still links out on a malformed URL, but omits the unparsable host', () => {
    // `url` truthiness (not URL validity) decides link-vs-span, so a bad URL string
    // still renders as a clickable <a> — just without the "· hostname" suffix.
    render(<TrustBadge url="not-a-url" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'not-a-url');
    expect(screen.queryByText(/^· /)).not.toBeInTheDocument();
  });

  it('includes the formatted verification date in the title tooltip', () => {
    render(<TrustBadge url="https://gouv.fr" verifiedAt="2026-06-03T00:00:00Z" />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('title')).toContain('vérifiée le');
    expect(link.getAttribute('title')).toContain('juin 2026');
  });

  it('uses a generic title when no verification date is given', () => {
    render(<TrustBadge url="https://gouv.fr" />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('title')).toContain('Source officielle vérifiée');
    expect(link.getAttribute('title')).not.toContain('vérifiée le');
  });

  it('stops the click from bubbling to a parent onClick handler', () => {
    const onParentClick = vi.fn();
    render(
      <div onClick={onParentClick}>
        <TrustBadge url="https://gouv.fr" />
      </div>,
    );
    fireEvent.click(screen.getByRole('link'));
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it('applies a custom className', () => {
    render(<TrustBadge url="https://gouv.fr" className="my-extra-class" />);
    expect(screen.getByRole('link')).toHaveClass('my-extra-class');
  });

  it('includes the verification date in the span title when there is no URL', () => {
    render(<TrustBadge verifiedAt="2026-06-03T00:00:00Z" />);
    expect(screen.getByTitle(/vérifiée le/)).toBeInTheDocument();
  });
});
