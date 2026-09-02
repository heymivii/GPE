import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Testimonials from './Testimonials';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('Testimonials', () => {
  it('renders a quote card for each testimonial', () => {
    render(<Testimonials />);
    expect(screen.getByText('"landing.testimonials.items.1.quote"')).toBeInTheDocument();
    expect(screen.getByText('landing.testimonials.items.1.name')).toBeInTheDocument();
    expect(screen.getByText('"landing.testimonials.items.3.quote"')).toBeInTheDocument();
  });
});
