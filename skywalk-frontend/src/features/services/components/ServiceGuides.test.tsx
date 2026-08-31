import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ServiceGuides from './ServiceGuides';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const guides = [
  { title: 'Étape 1', steps: ['Faire ceci', 'Faire cela'] },
  { title: 'Étape 2', steps: ['Autre chose'] },
];

describe('ServiceGuides', () => {
  it('renders every guide title and opens the first guide by default', () => {
    render(<ServiceGuides guides={guides} tips={[]} />);
    expect(screen.getByText('Étape 1')).toBeInTheDocument();
    expect(screen.getByText('Étape 2')).toBeInTheDocument();
    expect(screen.getByText('Faire ceci')).toBeInTheDocument();
  });

  it('toggles a guide open and closed on click', () => {
    render(<ServiceGuides guides={guides} tips={[]} />);
    fireEvent.click(screen.getByText('Étape 1'));
    fireEvent.click(screen.getByText('Étape 2'));
    expect(screen.getByText('Autre chose')).toBeInTheDocument();
  });

  it('does not render a tips section when tips is empty', () => {
    render(<ServiceGuides guides={guides} tips={[]} />);
    expect(screen.queryByText('services.guides.tipsTitle')).not.toBeInTheDocument();
  });

  it('renders tips when provided', () => {
    render(<ServiceGuides guides={guides} tips={['Astuce 1', 'Astuce 2']} />);
    expect(screen.getByText('services.guides.tipsTitle')).toBeInTheDocument();
    expect(screen.getByText('Astuce 1')).toBeInTheDocument();
    expect(screen.getByText('Astuce 2')).toBeInTheDocument();
  });

  it('does not render an FAQ section when faq is omitted', () => {
    render(<ServiceGuides guides={guides} tips={[]} />);
    expect(screen.queryByText('services.guides.faqTitle')).not.toBeInTheDocument();
  });

  it('renders and toggles FAQ items when provided', () => {
    render(
      <ServiceGuides
        guides={guides}
        tips={[]}
        faq={[{ question: 'Question 1', answer: 'Réponse 1' }]}
      />,
    );
    expect(screen.getByText('services.guides.faqTitle')).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Question 1'));
    expect(screen.getByText('Réponse 1')).toBeInTheDocument();
  });
});
