import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InfoTag from './InfoTag';

describe('InfoTag', () => {
  it('renders its children', () => {
    render(<InfoTag>Hello</InfoTag>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies the default variant style', () => {
    render(<InfoTag>Default</InfoTag>);
    expect(screen.getByText('Default')).toHaveClass('bg-gray-100');
  });

  it('applies the warning variant style', () => {
    render(<InfoTag variant="warning">Warn</InfoTag>);
    expect(screen.getByText('Warn')).toHaveClass('bg-orange-100');
  });

  it('applies the success variant style', () => {
    render(<InfoTag variant="success">Success</InfoTag>);
    expect(screen.getByText('Success')).toHaveClass('bg-green-100');
  });

  it('applies the error variant style', () => {
    render(<InfoTag variant="error">Error</InfoTag>);
    expect(screen.getByText('Error')).toHaveClass('bg-red-100');
  });

  it('merges a custom className', () => {
    render(<InfoTag className="custom-cls">Tag</InfoTag>);
    expect(screen.getByText('Tag')).toHaveClass('custom-cls');
  });
});
