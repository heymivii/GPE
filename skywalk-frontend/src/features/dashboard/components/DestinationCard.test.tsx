import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DestinationCard from './DestinationCard';

describe('DestinationCard', () => {
  it('renders the country name and description', () => {
    render(
      <DestinationCard
        image="https://example.com/img.jpg"
        countryName="Japon"
        flag="https://example.com/flag.png"
        description="Un pays fascinant"
      />,
    );
    expect(screen.getByText('Japon')).toBeInTheDocument();
    expect(screen.getByText('Un pays fascinant')).toBeInTheDocument();
    expect(screen.getByAltText('Japon')).toHaveAttribute('src', 'https://example.com/flag.png');
  });

  it('applies larger heading styles for the "large" size', () => {
    render(
      <DestinationCard
        image="https://example.com/img.jpg"
        countryName="Japon"
        flag="https://example.com/flag.png"
        description="Un pays fascinant"
        size="large"
      />,
    );
    expect(screen.getByText('Japon')).toHaveClass('text-3xl');
  });
});
