import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FAQ from './FAQ';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('FAQ', () => {
  it('renders every question, all collapsed by default', () => {
    render(<FAQ />);
    expect(screen.getByText('landing.faq.items.1.question')).toBeInTheDocument();
    expect(screen.getByText('landing.faq.items.6.question')).toBeInTheDocument();
  });

  it('toggles a question open and closed', () => {
    render(<FAQ />);
    const button = screen.getByText('landing.faq.items.1.question').closest('button')!;
    expect(button.parentElement?.querySelector('.rotate-180')).toBeNull();
    fireEvent.click(button);
    expect(button.parentElement?.querySelector('.rotate-180')).not.toBeNull();
    fireEvent.click(button);
    expect(button.parentElement?.querySelector('.rotate-180')).toBeNull();
  });

  it('closes the previously open question when another one is opened', () => {
    render(<FAQ />);
    const first = screen.getByText('landing.faq.items.1.question').closest('button')!;
    const second = screen.getByText('landing.faq.items.2.question').closest('button')!;
    fireEvent.click(first);
    fireEvent.click(second);
    expect(first.parentElement?.querySelector('.rotate-180')).toBeNull();
    expect(second.parentElement?.querySelector('.rotate-180')).not.toBeNull();
  });
});
