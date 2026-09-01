import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OfficialLinkCard from './OfficialLinkCard';

describe('OfficialLinkCard', () => {
  it('links to the official url', () => {
    render(<OfficialLinkCard label="Service Public" url="https://service-public.fr" />);
    expect(screen.getByText('Service Public').closest('a')).toHaveAttribute(
      'href',
      'https://service-public.fr',
    );
  });

  it('shows the verified date when provided', () => {
    render(<OfficialLinkCard label="Gov" url="https://gouv.fr" verifiedAt="2026-03-15T00:00:00Z" />);
    expect(screen.getByText(/vérifié le 15 mars 2026/)).toBeInTheDocument();
  });

  it('omits the verified date when not provided', () => {
    render(<OfficialLinkCard label="Gov" url="https://gouv.fr" />);
    expect(screen.queryByText(/vérifié le/)).not.toBeInTheDocument();
  });

  it('shows the summary list when provided', () => {
    render(<OfficialLinkCard label="Gov" url="https://gouv.fr" summary={['Fait 1', 'Fait 2']} />);
    expect(screen.getByText('Fait 1')).toBeInTheDocument();
    expect(screen.getByText('Fait 2')).toBeInTheDocument();
  });

  it('omits the summary section when empty', () => {
    render(<OfficialLinkCard label="Gov" url="https://gouv.fr" summary={[]} />);
    expect(screen.queryByText("L'essentiel")).not.toBeInTheDocument();
  });
});
