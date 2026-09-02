import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SubstepLinks from './SubstepLinks';
import type { ExtractedLink } from '../lib/formatters';

const urlLink: ExtractedLink = {
  kind: 'url',
  href: 'https://www.service-public.fr/particuliers/vosdroits/n110',
  label: 'service-public.fr',
  value: 'https://www.service-public.fr/particuliers/vosdroits/n110',
};

const emailLink: ExtractedLink = {
  kind: 'email',
  href: 'mailto:pref-etrangers@calvados.gouv.fr',
  label: 'calvados.gouv.fr',
  value: 'pref-etrangers@calvados.gouv.fr',
};

describe('SubstepLinks', () => {
  it('renders nothing when there is no link', () => {
    const { container } = render(<SubstepLinks links={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders one anchor per link, pointing at its href', () => {
    render(<SubstepLinks links={[urlLink, emailLink]} />);
    expect(screen.getByRole('link', { name: /service-public\.fr/ })).toHaveAttribute(
      'href',
      urlLink.href,
    );
    expect(screen.getByRole('link', { name: /calvados\.gouv\.fr/ })).toHaveAttribute(
      'href',
      emailLink.href,
    );
  });

  it('opens external URLs in a new tab without leaking the opener', () => {
    render(<SubstepLinks links={[urlLink]} />);
    const link = screen.getByRole('link', { name: /service-public\.fr/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('exposes the full value as a tooltip', () => {
    render(<SubstepLinks links={[emailLink]} />);
    expect(screen.getByRole('link', { name: /calvados\.gouv\.fr/ })).toHaveAttribute(
      'title',
      'pref-etrangers@calvados.gouv.fr',
    );
  });

  it('does not toggle the parent row when a link is clicked', () => {
    const onRowClick = vi.fn();
    render(
      <div onClick={onRowClick}>
        <SubstepLinks links={[urlLink]} />
      </div>,
    );
    fireEvent.click(screen.getByRole('link', { name: /service-public\.fr/ }));
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
