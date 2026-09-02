import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormPage from './FormPage';

describe('FormPage', () => {
  it('renders the placeholder text', () => {
    render(<FormPage />);
    expect(screen.getByText('Formulaire')).toBeInTheDocument();
  });
});
