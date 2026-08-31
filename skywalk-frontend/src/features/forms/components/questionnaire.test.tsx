import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormPage from './questionnaire';

describe('FormPage (questionnaire placeholder)', () => {
  it('renders the placeholder text', () => {
    render(<FormPage />);
    expect(screen.getByText('Formulaire')).toBeInTheDocument();
  });
});
