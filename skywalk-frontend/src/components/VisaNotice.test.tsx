import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import VisaNotice from './VisaNotice';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      const template = opts?.defaultValue ?? key;
      return opts?.country ? template.replace('{{country}}', opts.country) : template;
    },
  }),
}));

describe('VisaNotice', () => {
  it('shows the free-movement message for an EU/EEA/CH citizen going to an EU/EEA/CH country', () => {
    render(<VisaNotice nationality="FR" destinationIso="DE" destinationName="Allemagne" />);
    expect(screen.getByText(/Libre circulation/)).toBeInTheDocument();
    expect(screen.getByText(/Allemagne/)).toBeInTheDocument();
  });

  it('shows the visa-required message for a known non-exempt nationality', () => {
    render(<VisaNotice nationality="US" destinationIso="FR" destinationName="France" />);
    expect(screen.getByText(/un visa long séjour est requis/)).toBeInTheDocument();
  });

  it('shows the generic "check" message when nationality is unknown', () => {
    render(<VisaNotice nationality={null} destinationIso="FR" destinationName="France" />);
    expect(screen.getByText(/peut être requis/)).toBeInTheDocument();
  });

  it('falls back to a generic country label when destinationName is absent', () => {
    render(<VisaNotice nationality="US" destinationIso="FR" />);
    expect(screen.getByText(/ce pays/)).toBeInTheDocument();
  });

  it('renders the official-source link when sourceUrl is provided', () => {
    render(
      <VisaNotice nationality="US" destinationIso="FR" destinationName="France" sourceUrl="https://france-visas.gouv.fr" />,
    );
    const link = screen.getByRole('link', { name: /source officielle/ });
    expect(link).toHaveAttribute('href', 'https://france-visas.gouv.fr');
  });

  it('does not render a link when sourceUrl is absent', () => {
    render(<VisaNotice nationality="US" destinationIso="FR" destinationName="France" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('does not render a link on the exempt (free-movement) branch even if sourceUrl is provided', () => {
    render(
      <VisaNotice
        nationality="FR"
        destinationIso="DE"
        destinationName="Allemagne"
        sourceUrl="https://example.com"
      />,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('applies the custom className', () => {
    const { container } = render(
      <VisaNotice nationality="FR" destinationIso="DE" className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
